# Inertia Creations

An editorial website for an independent web design & development studio, with a live portfolio and case studies for 13 published sites. Built with Next.js 16 (App Router), React 19 and Tailwind CSS 4.

**Landing page:** [https://web.inertiacreation.in](https://web.inertiacreation.in)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint   # ESLint
npm run build  # production build
npm start      # serve the production build
```

## Where to edit things

Most studio copy and configuration lives in **`lib/content.js`**:

| Export | Controls |
| --- | --- |
| `site` | Name, logo asset, email, WhatsApp link/label, availability, optional Cal.com/Calendly URL |
| `hero` | Headline lines, subhead, trust signals |
| `nav`, `marquee` | Navigation and service marquee terms |
| `services` | Six service rows and their hover previews |
| `capabilities`, `process`, `purpose`, `whyUs` | Mid-page narrative sections |
| `faqs` | Accordion questions |
| `projectTypes`, `budgets`, `contactPreferences`, `timelines`, `descriptionSuggestions`, `contactDescriptionLimit` | Contact form chip options, quick-add prompts and description limit |

The three capability visuals use real screenshots of **inner pages** from the 12 client sites (not homepages), stored as `public/portfolio/inner-*.webp` and listed per capability in `lib/content.js`.

The hero's decorative screenshot stack uses four of those images and flips through them slowly via CSS in `components/HeroPreview.jsx` (pauses on hover/hidden tab, static under `prefers-reduced-motion`). The headline in `components/Hero.jsx` types in line by line with a stepwise clip reveal and a blinking caret; the text stays a single node per line for screen readers, and both the reveal and caret are disabled under `prefers-reduced-motion` and with JavaScript off.

The supplied Inertia logo lives at `public/inertia-logo.webp` (cropped and optimized from the provided PNG) and renders in both the header and footer.

Portfolio projects and testimonials are managed in the **studio admin at `/admin`**, not in source files. The admin reads and writes two JSON stores:

| File | Controls |
| --- | --- |
| `data/portfolio.json` | Projects: name, live URL, category, screenshot, summary and case-study notes |
| `data/testimonials.json` | Verified client quotes, attribution, project type and publish state |

`lib/portfolio.js` and `lib/testimonials.js` are cached, tagged readers. A save in the admin invalidates those caches immediately, so public pages update without a rebuild. Uploaded screenshots and client photos are written to `data/uploads/` and served through `/api/media/[filename]`, so a new image works without a rebuild or server restart.

Section JSX is in `components/`; routes are in `app/`. Design tokens and all CSS (including motion, responsive rules and admin styles) are in `app/globals.css`.

## Portfolio and case studies

- Homepage: selected featured sites, with thumbnail links to the live site and case study.
- `/work`: all 13 projects, with screenshots, live-site links and case-study links.
- `/work/[slug]`: one case study per site, with overview, structure, approach, interface notes, live-site link and previous/next navigation.
- `app/sitemap.js` includes the homepage, portfolio index and all case-study routes automatically.

Case-study copy documents only what is observable on the published sites — sections, interface details and content structure. It deliberately does **not** invent performance figures, testimonials, client names or outcome claims.

Screenshots are stored in `public/portfolio/`. Upload a replacement in the project editor (PNG, JPEG, WebP or AVIF up to 8 MB), or replace the file on disk and keep the path in `data/portfolio.json` in sync. Thumbnails are cropped from the top so the visible page header stays in frame.

## Studio admin

Set `ADMIN_PASSWORD` in the server environment, then open `/admin`.

- **Sign in:** one shared password, verified with a timing-safe comparison. A successful login sets a 7-day, HttpOnly, SameSite=Lax cookie signed with that password. Changing the password invalidates every session. Failed logins are rate-limited per IP (six attempts per 10 minutes). Admin routes are noindex.
- **Portfolio:** add, edit, feature or delete projects. The form captures the live URL, category, short summary, overview, page structure, up to three approach notes, interface notes and an optional screenshot upload. Slugs are generated from the name unless entered manually.
- **Testimonials:** add, edit, publish or delete quotes and upload an optional client profile photo (PNG, JPEG, WebP or AVIF up to 8 MB). Only published testimonials reach the homepage, where they appear immediately after the hero in a keyboard-accessible horizontal scroll rail with the photo or an initial fallback. The section stays hidden while none are published. Quotes are never invented — enter only approved client words and attribution.
- **Publishing:** saves invalidate the `portfolio` / `testimonials` cache tags and revalidate the home, portfolio, case-study, sitemap and admin list routes. No redeploy is needed on a self-hosted Node server with a persistent filesystem.

Deleting a project removes its record but does not delete its uploaded screenshot file; remove unused files from `data/uploads/` manually.

`ADMIN_PASSWORD=inertia-local-demo` is set in the local `.env.local` for QA only. Replace it before deploying. The JSON data files are intentionally tracked as the initial seed; back them up on the server because admin edits change them in place.

## Before launch

1. **Admin password:** set a long, unique `ADMIN_PASSWORD` on the server (see `.env.example`). The local demo password must not be deployed.
2. **Contact details:** verify `site.email`, `site.whatsapp`, `site.whatsappLabel` and `site.address` in `lib/content.js`. They are currently set to `inertiacreation@gmail.com`, `+91 866-748-6546` and the Ondipudur address supplied by the studio.
3. **Domain:** set `NEXT_PUBLIC_SITE_URL=https://web.inertiacreation.in` in your deployment environment (see `.env.example`). This drives metadata, Open Graph, `robots.txt` and `sitemap.xml`. Configure the `web` DNS subdomain/CNAME with your hosting provider to point at the deployed site.
4. **Form delivery:** configure **one** of:
   - `CONTACT_WEBHOOK_URL` — already set to the studio's public CRM lead endpoint. Enquiries are mapped to its fields (`name`, `email`, `phone`, `company`, `projectType`, `estimatedBudget`, `notes`), with extra details appended to `notes`; or
   - `RESEND_API_KEY` + `CONTACT_TO_EMAIL` (use `inertiacreation@gmail.com`; optional `CONTACT_FROM_EMAIL`).

   Set the same webhook URL in the production environment. With no delivery config, production requests return `503` and the form shows an honest error with a direct-email fallback — it never fakes success.
5. **Proof:** add only verified numbers or client quotes in `/admin`. Published testimonials appear on the homepage; drafts stay hidden. Case studies avoid unverified result claims.
6. **Quick call CTA:** set `site.calendly` to reveal the “Book a 15-min call” button.

`.env.local` currently points `NEXT_PUBLIC_SITE_URL` at localhost and sets a demo `ADMIN_PASSWORD` for local QA. It is gitignored and should not be deployed.

## Design / motion notes

- Palette: ivory `#F5F4F0`, ink `#151515`, muted gray (slightly deepened from `#777` for WCAG contrast), border `#DAD9D4`, primary yellow `#FFDB09` used sparingly. On light surfaces, accent text/rules use the contrast-safe `#8A6200` (4.98:1 on ivory); on dark surfaces the bright `#FFDB09` is used (13.38:1 on ink).
- Typography: Geist via `next/font`. Fluid `clamp()` headings, uppercase micro-labels.
- Motion: CSS keyframes + a lightweight `IntersectionObserver` reveal component. No animation library.
- Honours `prefers-reduced-motion` and includes a no-JS readable fallback.
- Subtle SVG paper grain is a fixed, non-interactive overlay at ~3% opacity.

## Verified

`npm run lint` and `npm run build` pass. Lighthouse scores **100 / 100 / 100** for accessibility, best practices and SEO on the production build of `/`, `/work` and a case study, with no console errors. The contact form was exercised end-to-end including validation, chip selection, suggestion chips, submission and success state.

The admin was exercised end-to-end: unauthenticated redirect, wrong and correct passwords, sign-out, project creation with screenshot upload, immediate public revalidation, published versus draft testimonials, and deletion. Uploaded images were confirmed to load through `/api/media/[filename]` without a rebuild. Responsive QA at 320/360/390/800/1440px found no horizontal overflow on the admin forms, admin lists or public pages.
