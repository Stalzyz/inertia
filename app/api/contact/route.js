/**
 * Contact enquiry endpoint.
 *
 * Delivery is intentionally explicit:
 *  - Set CONTACT_WEBHOOK_URL to POST the enquiry to any CRM / automation endpoint.
 *  - Or set RESEND_API_KEY + CONTACT_TO_EMAIL (+ optional CONTACT_FROM_EMAIL)
 *    to send an email through Resend.
 *  - In development with no delivery config the enquiry is logged and the
 *    request succeeds in "development" mode so the UI can be tested.
 *  - In production with no delivery config the endpoint returns 503. It never
 *    reports a success that wasn't actually delivered.
 */

import {
  budgets,
  contactDescriptionLimit,
  contactPreferences,
  projectTypes,
  timelines,
} from "@/lib/content";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_DESCRIPTION_LENGTH = 10;

function value(payload, key) {
  return typeof payload?.[key] === "string" ? payload[key].trim() : "";
}

function needsPhone(preference) {
  return preference === "WhatsApp" || preference === "Either works";
}

function isWebsite(raw) {
  if (!raw || /\s/.test(raw)) return false;

  try {
    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(candidate);
    return url.hostname.includes(".");
  } catch {
    return false;
  }
}

function validate(payload) {
  const errors = {};
  const name = value(payload, "name");
  const email = value(payload, "email");
  const phone = value(payload, "phone");
  const preference = value(payload, "contactPreference");
  const projectType = value(payload, "projectType");
  const budget = value(payload, "budget");
  const timeline = value(payload, "timeline");
  const existingWebsite = value(payload, "existingWebsite");
  const description = value(payload, "description");

  if (!name) errors.name = "Please enter your name.";
  if (!email) errors.email = "Please enter your email address.";
  else if (!EMAIL_PATTERN.test(email))
    errors.email = "Please enter a valid email address.";

  if (!contactPreferences.includes(preference))
    errors.contactPreference = "Please choose a valid contact preference.";
  else if (needsPhone(preference) || phone) {
    if (!phone) errors.phone = "Please enter your phone or WhatsApp number.";
    else if (phone.replace(/\D/g, "").length < 7)
      errors.phone = "Please enter a valid phone number.";
  }

  if (!projectTypes.includes(projectType))
    errors.projectType = "Please choose a project type.";
  if (budget && !budgets.includes(budget))
    errors.budget = "Please choose a valid budget.";
  if (timeline && !timelines.includes(timeline))
    errors.timeline = "Please choose a valid timeline.";
  if (existingWebsite && !isWebsite(existingWebsite))
    errors.existingWebsite = "Please enter a valid website address.";

  if (!description)
    errors.description = "Please tell us a little about your project.";
  else if (description.length < MIN_DESCRIPTION_LENGTH)
    errors.description = "Please add a little more detail (at least 10 characters).";
  else if (description.length > contactDescriptionLimit)
    errors.description = `Please keep the description under ${contactDescriptionLimit} characters.`;

  return errors;
}

function buildWebhookPayload(enquiry) {
  const webhook = process.env.CONTACT_WEBHOOK_URL || "";

  // The studio's public CRM lead endpoint expects these exact field names.
  if (webhook.includes("/api/v1/crm/public/leads/")) {
    const notes = [
      enquiry.description,
      enquiry.timeline ? `Timeline: ${enquiry.timeline}` : "",
      enquiry.contactPreference
        ? `Preferred contact: ${enquiry.contactPreference}`
        : "",
      enquiry.existingWebsite
        ? `Current website: ${enquiry.existingWebsite}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    return {
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone,
      company: enquiry.business,
      projectType: enquiry.projectType,
      estimatedBudget: enquiry.budget,
      notes,
    };
  }

  return {
    source: "inertia-creations-website",
    submittedAt: new Date().toISOString(),
    ...enquiry,
  };
}

function buildEmail(enquiry) {
  const rows = [
    ["Name", enquiry.name],
    ["Business", enquiry.business || "—"],
    ["Email", enquiry.email],
    ["Phone / WhatsApp", enquiry.phone || "—"],
    ["Best way to reach you", enquiry.contactPreference],
    ["Project type", enquiry.projectType],
    ["Budget", enquiry.budget || "—"],
    ["Timeline", enquiry.timeline || "—"],
    ["Current website", enquiry.existingWebsite || "—"],
    ["Description", enquiry.description],
  ];

  const text = rows
    .map(([label, item]) => `${label}: ${item}`)
    .join("\n");

  return {
    from: process.env.CONTACT_FROM_EMAIL || "Inertia Creations <onboarding@resend.dev>",
    to: [process.env.CONTACT_TO_EMAIL],
    subject: `New project enquiry — ${enquiry.projectType}`,
    text,
  };
}

async function deliver(enquiry) {
  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildWebhookPayload(enquiry)),
    });
    if (!response.ok) {
      throw new Error(`Webhook responded with ${response.status}`);
    }
    return "webhook";
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && process.env.CONTACT_TO_EMAIL) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildEmail(enquiry)),
    });
    if (!response.ok) {
      throw new Error(`Resend responded with ${response.status}`);
    }
    return "resend";
  }

  return null;
}

export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: silently accept bot submissions without delivering them.
  if (typeof payload?.website === "string" && payload.website.trim()) {
    return Response.json({ ok: true }, { status: 200 });
  }

  const errors = validate(payload);
  if (Object.keys(errors).length) {
    return Response.json(
      { error: "Please check the highlighted fields.", fields: errors },
      { status: 422 }
    );
  }

  const enquiry = {
    name: value(payload, "name"),
    business: value(payload, "business"),
    email: value(payload, "email"),
    phone: value(payload, "phone"),
    contactPreference: value(payload, "contactPreference"),
    projectType: value(payload, "projectType"),
    budget: value(payload, "budget"),
    timeline: value(payload, "timeline"),
    existingWebsite: value(payload, "existingWebsite"),
    description: value(payload, "description"),
  };

  try {
    const channel = await deliver(enquiry);

    if (!channel) {
      if (process.env.NODE_ENV === "production") {
        return Response.json(
          {
            error:
              "The contact form is not configured yet. Please email us directly.",
          },
          { status: 503 }
        );
      }
      console.info(
        "[contact] Development mode — enquiry accepted but not delivered:",
        enquiry
      );
      return Response.json({ ok: true, mode: "development" }, { status: 200 });
    }

    return Response.json({ ok: true, channel }, { status: 200 });
  } catch (error) {
    console.error("[contact] Delivery failed:", error);
    return Response.json(
      {
        error:
          "We couldn't deliver your enquiry right now. Please try again or email us directly.",
      },
      { status: 502 }
    );
  }
}
