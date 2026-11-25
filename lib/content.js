/**
 * Single source of truth for all editable site copy.
 *
 * Before launch:
 *  - Verify the contact details in `site` below.
 *  - Portfolio and testimonials are managed in /admin, not in this file.
 */

export const site = {
  name: "Inertia Creations",
  logo: "/inertia-logo.webp",
  descriptor: "Digital experiences built with intention.",
  eyebrow: "Independent digital studio",
  email: "inertiacreation@gmail.com",
  whatsapp: "https://wa.me/918667486546",
  whatsappLabel: "+91 866-748-6546",
  address: ["No.26, Sowdeshwari Nagar", "Ondipudur – 641016"],
  location: "Working with businesses everywhere",
  availability: "Available for select projects",
  // Optional: add a real Cal.com / Calendly link to reveal a 15-min call CTA.
  calendly: "",
  year: new Date().getFullYear(),
};

export const hero = {
  // Final period is rendered by the accent dot in Hero.jsx.
  lines: ["Websites that", "make people", "stay, trust", "& buy"],
  subhead:
    "We replace forgettable pages with fast, custom-built websites that turn attention into action — designed around your business, not a template.",
  // Process promises, not unverified performance claims.
  trustSignals: [
    "Custom-built, never templated",
    "Direct collaboration",
    "Fast & accessible by default",
  ],
  // Real inner-page screenshots used by the decorative hero flip.
  screenshots: [
    { src: "/portfolio/inner-atlas.webp", label: "Atlas Clothing" },
    { src: "/portfolio/inner-raaghas.webp", label: "Raaghas" },
    { src: "/portfolio/inner-grafty.webp", label: "Grafty" },
    { src: "/portfolio/inner-faith-model-school.webp", label: "Faith Model School" },
  ],
};

export const nav = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/#services" },
  { label: "Process", href: "/#process" },
  { label: "About", href: "/#about" },
];

export const marquee = [
  "WEB DESIGN",
  "DEVELOPMENT",
  "E-COMMERCE",
  "BRANDING",
  "DIGITAL",
  "STRATEGY",
];

export const services = [
  {
    number: "01",
    title: "Website Design",
    description:
      "Thoughtful visual experiences designed around your business, your brand, and your customers.",
    preview: "editorial",
  },
  {
    number: "02",
    title: "Website Development",
    description:
      "Fast, responsive, reliable websites built using modern technologies.",
    preview: "code",
  },
  {
    number: "03",
    title: "E-commerce",
    description:
      "Online stores designed to showcase products and make buying easier.",
    preview: "commerce",
  },
  {
    number: "04",
    title: "Landing Pages",
    description:
      "Focused pages built to generate enquiries, registrations, and conversions.",
    preview: "landing",
  },
  {
    number: "05",
    title: "Website Redesign",
    description:
      "Transform an outdated website into a modern digital experience.",
    preview: "split",
  },
  {
    number: "06",
    title: "Custom Digital Solutions",
    description:
      "Web applications, integrations, and business systems built around specific requirements.",
    preview: "system",
  },
];

export const capabilities = [
  {
    number: "01",
    title: "Looks right everywhere.",
    description:
      "Responsive layouts that hold their composition from the first phone screen to the widest desktop.",
    points: ["Responsive design", "Fluid typography", "Touch-friendly interfaces"],
    screenshots: [
      "/portfolio/inner-atlas.webp",
      "/portfolio/inner-raaghas.webp",
      "/portfolio/inner-mindfl.webp",
      "/portfolio/inner-faith-model-school.webp",
    ],
  },
  {
    number: "02",
    title: "Easy to understand, easy to choose.",
    description:
      "Structure and content working together so visitors know where they are and what to do next.",
    points: ["Clear user experience", "Conversion-focused structure", "Lead capture"],
    screenshots: [
      "/portfolio/inner-mca.webp",
      "/portfolio/inner-garage.webp",
      "/portfolio/inner-viktoreus.webp",
      "/portfolio/inner-fc.webp",
    ],
  },
  {
    number: "03",
    title: "Built for the way you work.",
    description:
      "The right foundations and integrations underneath, from content editing to everyday automation.",
    points: ["CMS integration", "SEO-friendly foundation", "WhatsApp & business automation"],
    screenshots: [
      "/portfolio/inner-grafty.webp",
      "/portfolio/inner-buzz.webp",
      "/portfolio/inner-academy.webp",
      "/portfolio/inner-echo.webp",
    ],
  },
];

export const process = [
  {
    number: "01",
    title: "Discovery",
    description:
      "We understand your business, goals, audience, and what your website needs to achieve.",
  },
  {
    number: "02",
    title: "Direction",
    description:
      "We establish the visual direction, structure, and user experience before building.",
  },
  {
    number: "03",
    title: "Design",
    description:
      "We turn the direction into a thoughtful, refined website experience.",
  },
  {
    number: "04",
    title: "Development",
    description:
      "We bring the design to life with responsive, reliable, and functional development.",
  },
  {
    number: "05",
    title: "Launch",
    description: "We test, refine, launch, and help you move forward.",
  },
];

export const purpose = [
  {
    title: "Built around your business.",
    description:
      "No forced templates. The structure comes from what you actually need to say and sell.",
  },
  {
    title: "Designed with intention.",
    description:
      "Every visual decision should communicate something, guide someone, or improve the experience.",
  },
  {
    title: "Developed for real-world use.",
    description:
      "Fast, accessible, and dependable long after launch day is over.",
  },
];

export const whyUs = [
  {
    number: "01",
    title: "Built around your business",
    description:
      "We don't force your business into a template. We build around what you actually need.",
  },
  {
    number: "02",
    title: "Design with purpose",
    description:
      "Every visual decision should help communicate, guide, or improve the experience.",
  },
  {
    number: "03",
    title: "Function matters",
    description: "A website should work just as well as it looks.",
  },
  {
    number: "04",
    title: "Straightforward process",
    description:
      "Clear communication and a process you understand from beginning to end.",
  },
  {
    number: "05",
    title: "Built to grow",
    description:
      "Your digital presence should be ready for where your business is going next.",
  },
];

export const faqs = [
  {
    question: "How much does a website cost?",
    answer:
      "Every project is different. We scope the work after understanding your goals, then share a clear proposal before anything begins. The quick-select options in the enquiry form help us start that conversation.",
  },
  {
    question: "How long does it take to build?",
    answer:
      "It depends on the size and complexity of the project. A focused landing page is much quicker than a full website with content systems or integrations. You'll get a realistic timeline with your proposal.",
  },
  {
    question: "Will my website work on mobile?",
    answer:
      "Yes. Responsive design is part of every project we take on. We design and check layouts across phone, tablet, and desktop so the experience holds together everywhere.",
  },
  {
    question: "Can I update the website myself?",
    answer:
      "Where it makes sense, we build sites with a content management system so your team can edit pages, images, and text without touching code. We'll show you how during handover.",
  },
  {
    question: "Do you provide hosting?",
    answer:
      "We can help you choose and set up reliable hosting, and work with your existing provider if you already have one. The right setup is agreed as part of the project.",
  },
  {
    question: "Can you redesign an existing website?",
    answer:
      "Absolutely. We can keep what works, improve what doesn't, and rebuild the parts that are holding the business back.",
  },
  {
    question: "Can you integrate WhatsApp or lead forms?",
    answer:
      "Yes. Enquiry forms, WhatsApp links, and simple automation are common additions. We'll recommend the most direct route for the way your team handles enquiries.",
  },
  {
    question: "Do you provide support after launch?",
    answer:
      "We stay available for questions, fixes, and improvements after launch. Ongoing support and maintenance can be arranged to suit your needs.",
  },
];

export const projectTypes = [
  "Business Website",
  "E-commerce Website",
  "Landing Page",
  "Website Redesign",
  "Web Application",
  "Other",
];

export const budgets = [
  "Not decided",
  "Below ₹25,000",
  "₹25,000–₹50,000",
  "₹50,000–₹1,00,000",
  "Above ₹1,00,000",
];

export const contactPreferences = ["Email", "WhatsApp", "Either works"];

export const timelines = [
  "As soon as possible",
  "1–3 months",
  "Just exploring",
];

export const descriptionSuggestions = [
  "Need a redesign",
  "Launching a new brand",
  "Need it done quickly",
  "Looking for e-commerce",
];

export const contactDescriptionLimit = 600;
