"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, CalendarDays, MessageCircle } from "lucide-react";
import {
  budgets,
  contactDescriptionLimit,
  contactPreferences,
  descriptionSuggestions,
  projectTypes,
  site,
  timelines,
} from "@/lib/content";
import Reveal from "./Reveal";

const initialValues = {
  name: "",
  business: "",
  email: "",
  phone: "",
  contactPreference: "Email",
  projectType: "",
  budget: "",
  timeline: "",
  existingWebsite: "",
  description: "",
  website: "",
};

const validationOrder = [
  "name",
  "email",
  "phone",
  "projectType",
  "existingWebsite",
  "description",
];

function needsPhone(preference) {
  return preference === "WhatsApp" || preference === "Either works";
}

function messageFor(field, rawValue, values) {
  const value = typeof rawValue === "string" ? rawValue.trim() : rawValue;

  switch (field) {
    case "name":
      return value ? "" : "Please enter your name.";
    case "email":
      if (!value) return "Please enter your email address.";
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ? ""
        : "Please enter a valid email address.";
    case "phone":
      if (!value) {
        return needsPhone(values?.contactPreference)
          ? "Please enter your phone or WhatsApp number."
          : "";
      }
      return value.replace(/\D/g, "").length >= 7
        ? ""
        : "Please enter a valid phone number.";
    case "projectType":
      return value ? "" : "Please choose a project type.";
    case "existingWebsite": {
      if (!value) return "";
      try {
        const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
        const url = new URL(candidate);
        return url.hostname.includes(".") && !/\s/.test(value)
          ? ""
          : "Please enter a valid website address.";
      } catch {
        return "Please enter a valid website address.";
      }
    }
    case "description":
      if (!value) return "Please tell us a little about your project.";
      if (value.length < 10)
        return "Please add a little more detail (at least 10 characters).";
      if (value.length > contactDescriptionLimit)
        return `Please keep the description under ${contactDescriptionLimit} characters.`;
      return "";
    default:
      return "";
  }
}

function fieldsToValidate(values) {
  return validationOrder.filter((field) => {
    if (field === "phone") {
      return needsPhone(values.contactPreference) || Boolean(values.phone.trim());
    }
    if (field === "existingWebsite") return Boolean(values.existingWebsite.trim());
    return true;
  });
}

function Field({ id, label, required, error, hint, children, full = false }) {
  return (
    <div className={`field${full ? " field--full" : ""}${error ? " has-error" : ""}`}>
      <label htmlFor={id}>
        {label}
        {required ? (
          <span className="required" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint ? (
        <span className="field-hint" id={`${id}-hint`}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="field-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

/** Tap-to-select radio chips — faster and clearer than a dropdown on mobile. */
function ChipGroup({
  id,
  label,
  options,
  value,
  onChange,
  error,
  required,
  full = false,
}) {
  return (
    <fieldset
      id={id}
      tabIndex={-1}
      className={`field chip-field${full ? " field--full" : ""}${error ? " has-error" : ""}`}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      <legend>
        {label}
        {required ? (
          <span className="required" aria-hidden="true">
            *
          </span>
        ) : null}
      </legend>
      <div className="chip-grid">
        {options.map((option) => (
          <label
            className={`chip${value === option ? " is-selected" : ""}`}
            key={option}
          >
            <input
              type="radio"
              name={id}
              value={option}
              checked={value === option}
              onChange={() => onChange(id, option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      {error ? (
        <span className="field-error" id={`${id}-error`} role="alert">
          {error}
        </span>
      ) : null}
    </fieldset>
  );
}

export default function Contact() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [submitError, setSubmitError] = useState("");
  const submittingRef = useRef(false);

  const setField = (field, value) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);

    setErrors((current) => {
      const nextErrors = { ...current };

      if (field === "contactPreference") {
        if (value === "Email") {
          delete nextErrors.phone;
        } else if (!nextValues.phone.trim()) {
          nextErrors.phone = messageFor("phone", "", nextValues);
        }
      } else if (current[field]) {
        const message = messageFor(field, value, nextValues);
        if (message) nextErrors[field] = message;
        else delete nextErrors[field];
      }

      return nextErrors;
    });
  };

  const handleBlur = (field) => {
    setErrors((current) => {
      const nextErrors = { ...current };
      const message = messageFor(field, values[field], values);
      if (message) nextErrors[field] = message;
      else delete nextErrors[field];
      return nextErrors;
    });
  };

  const hasSuggestion = (text) =>
    values.description.toLowerCase().includes(text.toLowerCase());

  const toggleSuggestion = (text) => {
    if (hasSuggestion(text)) {
      const parts = values.description
        .split(",")
        .map((part) => part.trim())
        .filter((part) => part.toLowerCase() !== text.toLowerCase());
      setField("description", parts.join(", "));
      return;
    }

    const current = values.description.replace(/[,\s]+$/, "");
    setField("description", current ? `${current}, ${text}` : text);
  };

  const focusFirstError = (nextErrors) => {
    const firstField = validationOrder.find((field) => nextErrors[field]);
    if (firstField) document.getElementById(firstField)?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submittingRef.current) return;

    const nextErrors = {};
    fieldsToValidate(values).forEach((field) => {
      const message = messageFor(field, values[field], values);
      if (message) nextErrors[field] = message;
    });

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      focusFirstError(nextErrors);
      return;
    }

    submittingRef.current = true;
    setErrors({});
    setSubmitError("");
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 422 && data.fields) {
          setErrors(data.fields);
          focusFirstError(data.fields);
          return;
        }
        throw new Error(
          data.error || "We couldn't send your enquiry. Please try again."
        );
      }

      setStatus("success");
      setValues(initialValues);
    } catch (error) {
      setStatus("error");
      setSubmitError(
        error.message || "We couldn't send your enquiry. Please try again."
      );
    } finally {
      submittingRef.current = false;
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setSubmitError("");
    setStatus("idle");
  };

  const textField = (
    id,
    label,
    placeholder,
    required = false,
    type = "text",
    hint
  ) => {
    const describedBy = [
      hint ? `${id}-hint` : null,
      errors[id] ? `${id}-error` : null,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <Field
        id={id}
        label={label}
        required={required}
        error={errors[id]}
        hint={hint}
      >
        <input
          id={id}
          name={id}
          type={type}
          value={values[id]}
          placeholder={placeholder}
          required={required}
          maxLength={
            id === "name" || id === "business" || id === "existingWebsite"
              ? 120
              : id === "email"
                ? 254
                : id === "phone"
                  ? 40
                  : undefined
          }
          aria-invalid={Boolean(errors[id])}
          aria-describedby={describedBy || undefined}
          autoComplete={
            id === "name"
              ? "name"
              : id === "email"
                ? "email"
                : id === "phone"
                  ? "tel"
                  : id === "business"
                    ? "organization"
                    : "off"
          }
          onChange={(event) => setField(id, event.target.value)}
          onBlur={() => handleBlur(id)}
        />
      </Field>
    );
  };

  const phoneRequired = needsPhone(values.contactPreference);
  const descriptionCount = values.description.length;

  return (
    <section className="section" id="contact" aria-labelledby="contact-title">
      <div className="container contact-grid">
        <Reveal className="contact-aside">
          <p className="label">Start a project</p>
          <h2 className="section-title" id="contact-title">
            Tell us what you&apos;re building.
          </h2>
          <p className="body-lg" style={{ marginTop: 24 }}>
            Share a few details and we&apos;ll get back to you with the right
            next steps. Prefer to talk first? Use the quick routes below.
          </p>

          <div className="quick-path">
            <span className="quick-path-label">Quick route</span>
            <a
              className="btn btn--accent"
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={15} strokeWidth={1.8} aria-hidden="true" />
              Chat on WhatsApp
              <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
            </a>
            {site.calendly ? (
              <a
                className="btn btn--outline"
                href={site.calendly}
                target="_blank"
                rel="noopener noreferrer"
              >
                <CalendarDays size={15} strokeWidth={1.8} aria-hidden="true" />
                Book a 15-min call
                <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
              </a>
            ) : null}
            <p className="quick-path-note">
              Direct to the person building your site — no account manager in
              between.
            </p>
          </div>

          <div className="contact-details">
            <a href={`mailto:${site.email}`}>
              <span className="status-dot" aria-hidden="true" />
              {site.email}
            </a>
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={15} strokeWidth={1.8} aria-hidden="true" />
              {site.whatsappLabel}
            </a>
            <address className="contact-address">
              {site.address.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
            <small>{site.availability}</small>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="contact-form-panel">
            <div className="form-panel-head" aria-hidden="true">
              <span>Project enquiry</span>
              <span>01 / 01</span>
            </div>
            <div className="form-panel-body">
              {status === "success" ? (
                <div className="form-success" role="status">
                  <h3>Thank you.</h3>
                  <p>
                    Your project enquiry has been received. We&apos;ll get back to
                    you shortly.
                  </p>
                  <button type="button" className="btn btn--dark" onClick={resetForm}>
                    Send another enquiry
                    <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate aria-busy={status === "submitting"}>
                  {status === "error" ? (
                    <div className="form-status form-status--error" role="alert">
                      {submitError} If the problem continues, email us directly at{" "}
                      <a href={`mailto:${site.email}`}>{site.email}</a>.
                    </div>
                  ) : null}
    
                  <div className="form-grid">
                    {textField("name", "Name", "Your name", true)}
                    {textField("business", "Business name", "Optional")}
                    {textField("email", "Email", "you@business.com", true, "email")}
                    {textField(
                      "phone",
                      phoneRequired ? "Phone / WhatsApp" : "Phone / WhatsApp (optional)",
                      "Including country code",
                      phoneRequired,
                      "tel"
                    )}
    
                    <ChipGroup
                      id="contactPreference"
                      label="Best way to reach you"
                      options={contactPreferences}
                      value={values.contactPreference}
                      onChange={setField}
                      error={errors.contactPreference}
                      full
                    />
    
                    <ChipGroup
                      id="projectType"
                      label="Project type"
                      options={projectTypes}
                      value={values.projectType}
                      onChange={setField}
                      error={errors.projectType}
                      required
                      full
                    />
    
                    <ChipGroup
                      id="budget"
                      label="Budget"
                      options={budgets}
                      value={values.budget}
                      onChange={setField}
                      error={errors.budget}
                    />
    
                    <ChipGroup
                      id="timeline"
                      label="Timeline"
                      options={timelines}
                      value={values.timeline}
                      onChange={setField}
                      error={errors.timeline}
                    />
    
                    {textField(
                      "existingWebsite",
                      "Current website",
                      "example.com (optional)",
                      false,
                      "text",
                      "If there's already a site, we'll look before we ask."
                    )}
    
                    <Field
                      id="description"
                      label="Project description"
                      required
                      error={errors.description}
                      full
                    >
                      <div className="suggestions" aria-label="Quick additions">
                        {descriptionSuggestions.map((suggestion) => (
                          <button
                            type="button"
                            className={`suggestion-chip${
                              hasSuggestion(suggestion) ? " is-active" : ""
                            }`}
                            key={suggestion}
                            aria-pressed={hasSuggestion(suggestion)}
                            onClick={() => toggleSuggestion(suggestion)}
                          >
                            {hasSuggestion(suggestion) ? "−" : "+"} {suggestion}
                          </button>
                        ))}
                      </div>
                      <textarea
                        id="description"
                        name="description"
                        value={values.description}
                        required
                        maxLength={contactDescriptionLimit}
                        placeholder="Tell us about your business, what you need, and any timelines..."
                        aria-invalid={Boolean(errors.description)}
                        aria-describedby={`description-hint${
                          errors.description ? " description-error" : ""
                        }`}
                        onChange={(event) => setField("description", event.target.value)}
                        onBlur={() => handleBlur("description")}
                      />
                      <span className="field-hint" id="description-hint">
                        At least 10 characters. {descriptionCount}/{contactDescriptionLimit} used.
                      </span>
                    </Field>
                  </div>
    
                  <div className="sr-only" aria-hidden="true">
                    <label htmlFor="website">Leave this field empty</label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={values.website}
                      onChange={(event) => setField("website", event.target.value)}
                    />
                  </div>
    
                  <div className="form-footer">
                    <p className="form-note">
                      We only use these details to reply to your enquiry.
                    </p>
                    <button
                      type="submit"
                      className="btn btn--dark"
                      disabled={status === "submitting"}
                    >
                      {status === "submitting" ? "Sending enquiry…" : "Send enquiry"}
                      {status !== "submitting" ? (
                        <ArrowUpRight size={15} strokeWidth={1.8} aria-hidden="true" />
                      ) : null}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
