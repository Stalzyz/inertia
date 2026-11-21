# M-Tel Networks — website redesign

A complete frontend reconstruction of `https://www.mtelnetworks.com/` using the layout language of Make.com as a design reference. The hero composition and two-typeface heading system take visual cues from `https://boomifymedia.com/`; no copy, branding or graphics were copied. All copy, links and forms come from the original website. Brand marks and client logos are unchanged; supporting imagery is custom SVG artwork derived from M-Tel's own service language and the colours in its logo. No stock or AI imagery is used.

## Run

```bash
node server.js
# http://localhost:4173
```

No dependencies, no build step required to view the site. To regenerate the HTML pages from the reusable source partials:

```bash
node src/build.js
```

## Structure

```
index.html / index.php                 Home
about-us.html / about-us.php           About Us
services.html / services.php           Services (anchors preserved)
contact-us.html / contact-us.php       Contact Us + form
clients-list.html / clients-list.php   Clients
src/partials/                          Shared header, topbar, modals, footer
src/pages/                             Page bodies
src/build.js                           Assembles pages + local search index
assets/css/styles.css                  Design system and all responsive styles
assets/js/main.js                      Navigation, modals, forms, scroll motion
assets/images/                         Original assets retained; custom artwork in art/
assets/fonts/                          Local Inter + Playfair Display variable fonts
server.js                              Static routes, legacy .php routes, forms, captcha
ASSET_INVENTORY.md                     Every original asset, source URL and placement
```

## Content map

| Original block | Rebuilt section |
|---|---|
| Top line: tagline, phone, email | Dark utility bar |
| Logo + primary nav + services dropdown | Sticky header with mobile slide-in menu |
| Hero slide 1 — "A Plan to Fit Your Needs" | Two-column hero with custom network artwork |
| Client logos | Compact trust transition row; logos unchanged |
| Hero slide 2 — "Our Plans Give You More Than Ever" | Editorial split section with custom plan artwork |
| About Us (home) | Editorial split section with custom connection artwork |
| What We Offer / Services | Asymmetric service grid with one consistent SVG family |
| Selected Work | Studio-style case study built from M-Tel's own service descriptions |
| Subscription Plan | Three pricing cards with original names/descriptions |
| Exclusive Benefits | Four visual cards on original background |
| Clients | Logo grid |
| Contact page "Get In Touch With Us" | Final conversion panel |
| Footer / copyright / credit | Dark structured footer; credit links to Grekam Tech |

## Design refinement

- Section padding, card gaps and card padding follow one responsive scale: generous on desktop, compact on tablet, and tighter on mobile.
- Emoji-style benefit PNGs and the animated WhatsApp/call GIFs were replaced with inline SVG icons in a shared stroke style; the original files remain in `assets/images/` for reference but are no longer rendered.
- Off-system decorations were removed in favour of rounded white containers, consistent tinted backgrounds and subtle scroll/hover motion.
- The hero is now a centred editorial composition: pill eyebrow, two-typeface headline, accent lead, circular-arrow CTA and restrained orbit/chip details built from original service names.
- Section headings use the same sans/serif contrast with a short accent rule above the eyebrow; Playfair Display is stored locally so there is no runtime font request.
- The Selected Work case study presents “The situation,” “What we did” and “What changed” as an accessible tab set instead of three stacked blocks; keyboard arrow/Home/End navigation is supported.
- Vision and Mission keep their original wording but are split into a serif lead and supporting copy. A six-card Key Factors grid on About and an accessible FAQ accordion on Services are written only from existing M-Tel claims.
- The four homepage benefit tiles now carry one supporting line each, drawn from the original About and Vision copy.
- Services rows use numbered indices, a sticky in-page service rail with an active state, and service-specific fact chips taken from the original copy. The Services banner carries a local topology SVG; redundant icons were removed from the homepage service cards.
- Homepage service cards swap to a red background with white titles, links and matching white line artwork on hover or keyboard focus. The light artwork variants are local SVGs derived from the same six illustrations.
- The homepage card illustrations are animated SVG variants: travelling dots for Fibernet, Broadband, Leased Line and LAN / WAN, full-circle signal ripples for Wireless, and a secure packet/blink for VPN. Reduced-motion users get the static artwork instead.
- The supplied `M-TEL Networks Logo with Tagline.png` replaces the header and footer marks. A recoloured local variant keeps the logo legible on the dark footer; the credit reads “Designed by Grekam Tech” and links to `https://www.grekam.in`.
- The homepage hero is now a CSS 3D flipbook of three local illustrations — family/education, business professionals using the internet, and happy people. It advances automatically, pauses on hover/focus or via the pause control, and supports previous/next and dot controls. Reduced-motion users see a static first frame with instant manual switching.
- A low-opacity red network pattern tiles behind every page. Footer social icons are inline SVGs; Facebook, Instagram, LinkedIn and YouTube are marked as pending links and WhatsApp uses the existing contact number.
- The phone number and `md@mtelnetworks.com` come from one shared `src/partials/contact-details.html` source, used by the Contact Us page and the legal pages, and also appear in the footer.
- The Clients page keeps the original six-logo gallery and adds a four-card “How Clients Benefit” grid plus a static version of the representative leased-line/LAN/WAN/VPN case study, with no client name or invented numbers.
- Three clearly labelled dummy testimonials sit after Selected Work in a horizontal, swipeable strip. The strip auto-scrolls once when it enters view, pauses on hover/focus and stops permanently after manual interaction; each card says “Sample text — replace with an approved quote before publishing” so placeholder quotes are never mistaken for real customer feedback.
- Five legal pages — Privacy Policy, Cookies Policy, Data Deletion, Terms and Conditions and Refund Policy — are linked from the footer and a shared legal sidebar. They are marked “Draft — review before publishing” and describe only the forms, cookie and map behaviour this site actually uses.
- The accent palette was migrated from the logo: red `#d82424`, charcoal `#4d4747`, white and soft red tints. All original files remain in place for reference.
- Heavy raster backdrops (`gif.gif`, `bg-1.jpg`, `banner-1/2/3.png`) were replaced with CSS gradients and dot-grid patterns; hero, plans, about, service and modal imagery now uses lightweight SVG artwork.
- All paragraph copy is justified with hyphenation and widow/orphan control.
- Hover movement is capped at 2px; the sticky header condenses with a layout-neutral margin; scroll reveals travel 12px once with a three-step stagger.

## Functionality

- All original navigation items, dropdown links, CTA destinations and footer links are preserved.
- Original `.php` URLs continue to resolve to the rebuilt pages, along with the new `privacy-policy.php`, `cookies-policy.php`, `data-deletion.php`, `terms-conditions.php` and `refund-policy.php` routes.
- Customer Login modal posts to `customer-login.php`; the sign-up modal and search modal keep their original `action` attributes while submitting/searching locally in the browser.
- Contact form keeps its original fields and captcha step; `captcha_code_file.php` is recreated as a lightweight SVG endpoint.
- Google Maps embed is unchanged.
- The Services FAQ uses an accessible accordion with `aria-expanded`, `aria-controls` and native button keyboard support.
- The sticky service rail tracks the visible service section with a passive scroll handler.
- Motion is CSS/IntersectionObserver based, with `prefers-reduced-motion` support.
