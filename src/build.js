/*
 * M-Tel Networks — static site builder.
 * Assembles shared partials (header, footer, modals) with each page body into
 * standalone HTML files. Keeps the redesign componentised without adding a
 * framework or runtime dependency to the delivered website.
 *
 * Editable content from the admin panel (data/settings.json and
 * data/testimonials.json) is injected here so the public pages stay static.
 */
const fs = require('fs');
const path = require('path');
const { defaults } = require('../lib/defaults');

const root = path.resolve(__dirname, '..');
const partialDir = path.join(__dirname, 'partials');
const pageDir = path.join(__dirname, 'pages');

const read = (p) => fs.readFileSync(p, 'utf8');
const partial = (name) => read(path.join(partialDir, `${name}.html`));

const pages = [
  { file: 'index.html', title: 'M-tel', description: 'M - Tel Networks (P) Ltd is a leading technology-driven Internet Service Provider (ISP)', active: 'home', body: 'home.html' },
  { file: 'about-us.html', title: 'M-tel — About Us', description: 'About Us — M - Tel Networks (P) Ltd', active: 'about', body: 'about-us.html' },
  { file: 'services.html', title: 'M-tel — Services', description: 'Services — M - Tel Networks (P) Ltd', active: 'services', body: 'services.html' },
  { file: 'contact-us.html', title: 'M-tel — Contact Us', description: 'Kindly Contact Us — M - Tel Networks (P) Ltd', active: 'contact', body: 'contact-us.html' },
  { file: 'clients-list.html', title: 'M-tel — Clients', description: 'Clients — M - Tel Networks (P) Ltd', active: 'clients', body: 'clients-list.html' },
  { file: 'privacy-policy.html', title: 'M-tel — Privacy Policy', description: 'Privacy Policy — M - Tel Networks (P) Ltd', active: '', body: 'privacy-policy.html' },
  { file: 'cookies-policy.html', title: 'M-tel — Cookies Policy', description: 'Cookies Policy — M - Tel Networks (P) Ltd', active: '', body: 'cookies-policy.html' },
  { file: 'data-deletion.html', title: 'M-tel — Data Deletion', description: 'Data Deletion — M - Tel Networks (P) Ltd', active: '', body: 'data-deletion.html' },
  { file: 'terms-conditions.html', title: 'M-tel — Terms and Conditions', description: 'Terms and Conditions — M - Tel Networks (P) Ltd', active: '', body: 'terms-conditions.html' },
  { file: 'refund-policy.html', title: 'M-tel — Refund Policy', description: 'Refund Policy — M - Tel Networks (P) Ltd', active: '', body: 'refund-policy.html' },
];

// Legacy .php routes from the original website are kept as real files as well,
// so every original destination still resolves.
const legacyRoutes = {
  'index.php': 'index.html',
  'about-us.php': 'about-us.html',
  'services.php': 'services.html',
  'contact-us.php': 'contact-us.html',
  'clients-list.php': 'clients-list.html',
  'privacy-policy.php': 'privacy-policy.html',
  'cookies-policy.php': 'cookies-policy.html',
  'data-deletion.php': 'data-deletion.html',
  'terms-conditions.php': 'terms-conditions.html',
  'refund-policy.php': 'refund-policy.html',
};

const textOf = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function esc(value) {
  return String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function readData(name, fallback) {
  const file = path.join(root, 'data', `${name}.json`);
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.warn(`[build] Ignoring unreadable data/${name}.json`);
    return fallback;
  }
}

function settings() {
  const stored = readData('settings', {});
  return Object.assign({}, defaults.settings, stored, {
    smtp: Object.assign({}, defaults.settings.smtp, stored.smtp || {})
  });
}

function approvedTestimonials() {
  const list = readData('testimonials', defaults.testimonials);
  if (!Array.isArray(list)) return defaults.testimonials.filter((t) => t.status === 'approved');
  return list.filter((t) => t.status === 'approved').sort((a, b) => (a.order || 0) - (b.order || 0));
}

function activePackages(category) {
  const list = readData('packages', defaults.packages);
  const source = Array.isArray(list) ? list : defaults.packages;
  return source
    .filter((item) => item.status === 'active' && (!category || item.category === category))
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

const quoteIcon = '<svg class="quote-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6C6.5 7.4 5 9.8 5 13.2V18h5.4v-5.4H8.2c.1-1.7 1-2.9 2.7-3.6L9.5 6Zm9 0c-3 1.4-4.5 3.8-4.5 7.2V18h5.4v-5.4h-2.2c.1-1.7 1-2.9 2.7-3.6L18.5 6Z"/></svg>';

function testimonialMarkup(items) {
  if (!items.length) return '<p class="testimonial-empty">No approved testimonials yet.</p>';
  return items.map((item) => [
    '\t\t\t\t\t<figure class="testimonial-card">',
    `\t\t\t\t\t\t${quoteIcon}`,
    `\t\t\t\t\t\t<blockquote><p>“${esc(item.quote)}”</p></blockquote>`,
    '\t\t\t\t\t\t<figcaption>',
    `\t\t\t\t\t\t\t<span class="testimonial-avatar" aria-hidden="true">${esc(item.initials)}</span>`,
    `\t\t\t\t\t\t\t<span><strong>${esc(item.name)}</strong><small>${esc(item.role)}</small></span>`,
    '\t\t\t\t\t\t</figcaption>',
    item.note ? `\t\t\t\t\t\t<p class="testimonial-note">${esc(item.note)}</p>` : '',
    '\t\t\t\t\t</figure>'
  ].filter(Boolean).join('\n')).join('\n');
}

const checkIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 6 8.5 13.5 5 10"/></svg>';
const arrowIcon = '<svg class="arrow" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4"/></svg>';

function planIcon(type, uid) {
  switch (type) {
    case 'half-star':
      return `<svg viewBox="0 0 24 24"><defs><linearGradient id="halfStar${uid}"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path fill="url(#halfStar${uid})" stroke="currentColor" d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/></svg>`;
    case 'solid-star':
      return '<svg viewBox="0 0 24 24"><path fill="currentColor" d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/></svg>';
    case 'grid':
      return '<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4zM4 9h16M9 4v16"/></svg>';
    case 'globe':
      return '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm1 14.93V17a1 1 0 0 1-2 0v-.07A8 8 0 0 1 4.07 10H5a1 1 0 0 1 0-2h-.93A8 8 0 0 1 11 4.07V5a1 1 0 0 1 2 0v-.93A8 8 0 0 1 19.93 11H19a1 1 0 0 1 0 2h.93A8 8 0 0 1 13 16.93Z"/></svg>';
    case 'wireless':
      return '<svg viewBox="0 0 24 24"><path d="M12 20a8 8 0 1 0-8-8 8 8 0 0 0 8 8Z"/><path d="M12 14a2 2 0 1 0-2-2 2 2 0 0 0 2 2Zm0-8v2m0 8v2m-6-6h2m8 0h2"/></svg>';
    default:
      return '<svg viewBox="0 0 24 24"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/></svg>';
  }
}

function packageMarkup(items) {
  if (!items.length) return '\t\t\t\t\t<p class="package-empty">No active packages in this category.</p>';
  return items.map((item, index) => {
    const featured = Boolean(item.featured);
    const price = item.custom
      ? `<strong class="amount amount--custom">${esc(item.amount)}</strong>`
      : `<span class="currency">${esc(item.currency)}</span><strong class="amount">${esc(item.amount)}</strong><span class="period">${esc(item.period)}</span>`;
    const features = (item.features || []).map((feature) =>
      `\t\t\t\t\t\t\t<li>${checkIcon} ${esc(feature)}</li>`).join('\n');
    return [
      `\t\t\t\t\t<article class="plan-card${featured ? ' plan-card--featured' : ''} reveal" data-reveal="card">`,
      featured && item.ribbon ? `\t\t\t\t\t\t<span class="featured-ribbon">${esc(item.ribbon)}</span>` : '',
      `\t\t\t\t\t\t<div class="plan-badge-speed${featured ? ' plan-badge-speed--featured' : ''}">${esc(item.badge)}</div>`,
      `\t\t\t\t\t\t<div class="plan-icon" aria-hidden="true">${planIcon(item.icon, index + 1)}</div>`,
      `\t\t\t\t\t\t<h3>${esc(item.name)}</h3>`,
      `\t\t\t\t\t\t<p class="plan-description">${esc(item.description)}</p>`,
      `\t\t\t\t\t\t<div class="plan-price">${price}</div>`,
      '\t\t\t\t\t\t<ul class="plan-features">',
      features,
      '\t\t\t\t\t\t</ul>',
      `\t\t\t\t\t\t<a class="btn ${featured ? 'btn-primary' : 'btn-outline'} plan-btn" href="${esc(item.href || 'contact-us.php')}">${esc(item.cta || 'Enquire')}\n\t\t\t\t\t\t\t${arrowIcon}\n\t\t\t\t\t\t</a>`,
      '\t\t\t\t\t</article>'
    ].filter(Boolean).join('\n');
  }).join('\n');
}

function inject(html, data, asText) {
  const values = {
    CONTACT_EMAIL: data.settings.contactEmail,
    CONTACT_PHONE: data.settings.contactPhone,
    TOPBAR_PHONE: data.settings.topbarPhone,
    PHONE_DIGITS: data.settings.phoneDigits,
    GATEWAY_NAME: data.settings.gatewayName,
    TESTIMONIALS: asText ? data.testimonialText : data.testimonialHtml,
    PACKAGES_HOME: asText ? data.packageText.home : data.packageHtml.home,
    PACKAGES_BUSINESS: asText ? data.packageText.business : data.packageHtml.business
  };
  let out = html;
  Object.keys(values).forEach((key) => {
    // Generated markup is already escaped field by field.
    const raw = key === 'TESTIMONIALS' || key === 'PACKAGES_HOME' || key === 'PACKAGES_BUSINESS';
    const value = raw && !asText ? values[key] : (asText ? String(values[key]) : esc(values[key]));
    out = out.split(`{{${key}}}`).join(value);
  });
  return out;
}

function buildSearchIndex(data) {
  const contactText = textOf(partial('contact-details'));
  const legalNavText = textOf(partial('legal-nav'));
  const legalNoticeText = textOf(partial('legal-notice'));
  const entries = pages.map((page) => {
    const html = read(path.join(pageDir, page.body))
      .replace(/\{\{CONTACT_DETAILS\}\}/g, contactText)
      .replace(/\{\{LEGAL_NAV\}\}/g, legalNavText)
      .replace(/\{\{LEGAL_NOTICE\}\}/g, legalNoticeText);
    const text = inject(html, data, true)
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return { title: page.title.replace('M-tel — ', ''), url: page.file, text };
  });
  const out = `/* Generated by src/build.js — local search index */\nwindow.SEARCH_INDEX = ${JSON.stringify(entries)};\n`;
  fs.writeFileSync(path.join(root, 'assets/js/search-index.js'), out);
}

function build() {
  const head = partial('head').replace(/\{\{TITLE\}\}/g, '__TITLE__').replace(/\{\{DESCRIPTION\}\}/g, '__DESCRIPTION__');
  const topbar = partial('topbar');
  const header = partial('header');
  const modals = partial('modals');
  const footer = partial('footer');
  const contactDetails = partial('contact-details');
  const legalNav = partial('legal-nav');
  const legalNotice = partial('legal-notice');
  const approved = approvedTestimonials();
  const home = activePackages('home');
  const business = activePackages('business');
  const packageTextFor = (items) => items.map((item) =>
    [item.name, item.badge, item.description, item.amount, (item.features || []).join(' ')].join(' ')).join(' ');
  const data = {
    settings: settings(),
    testimonialHtml: testimonialMarkup(approved),
    testimonialText: approved.map((t) => `${t.quote} ${t.name} ${t.role}`).join(' '),
    packageHtml: { home: packageMarkup(home), business: packageMarkup(business) },
    packageText: { home: packageTextFor(home), business: packageTextFor(business) }
  };

  pages.forEach((page) => {
    const body = read(path.join(pageDir, page.body))
      .replace(/\{\{CONTACT_DETAILS\}\}/g, contactDetails)
      .replace(/\{\{LEGAL_NAV\}\}/g, legalNav)
      .replace(/\{\{LEGAL_NOTICE\}\}/g, legalNotice);
    const html = inject([
      '<!DOCTYPE html>',
      '<html lang="en">',
      head.replace('__TITLE__', page.title).replace('__DESCRIPTION__', page.description),
      '<body>',
      topbar,
      header.replace(/\{\{ACTIVE\}\}/g, page.active),
      body,
      modals,
      footer,
      '</body>',
      '</html>',
      '',
    ].join('\n'), data, false);

    fs.writeFileSync(path.join(root, page.file), html);

    // Original destinations preserved as routes handled by server.js; here we
    // also emit a tiny client-side redirect for file:// or static hosts.
    if (legacyRoutes[page.file]) {
      const redirect = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${page.file}"><title>${page.title}</title><script>location.replace('${page.file}' + location.hash);</script></head><body><a href="${page.file}">Continue</a></body></html>\n`;
      fs.writeFileSync(path.join(root, legacyRoutes[page.file]), redirect);
    }
  });

  buildSearchIndex(data);
  console.log(`Built ${pages.length} pages + ${Object.keys(legacyRoutes).length} legacy routes.`);
}

build();
