import { Geist, Geist_Mono } from "next/font/google";
import { site } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — Website Design & Development Studio`,
    template: `%s — ${site.name}`,
  },
  description:
    "Inertia Creations is an independent digital studio designing and building websites, online stores and digital experiences that help businesses communicate clearly and turn attention into action.",
  keywords: [
    "website design",
    "website development",
    "web design studio",
    "e-commerce websites",
    "landing pages",
    "website redesign",
    "digital experience",
    "Inertia Creations",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: site.name,
    title: `${site.name} — Website Design & Development Studio`,
    description:
      "Good businesses deserve better websites. We design and build digital experiences built with intention.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Website Design & Development Studio`,
    description:
      "Good businesses deserve better websites. Independent digital studio for design, development and e-commerce.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "technology",
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  description:
    "Independent digital studio specializing in website design, website development, e-commerce and digital experiences.",
  url: siteUrl,
  email: site.email,
  telephone: site.whatsappLabel,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address[0],
    addressLocality: "Ondipudur",
    postalCode: "641016",
    addressCountry: "IN",
  },
  areaServed: "Worldwide",
  serviceType: [
    "Website Design",
    "Website Development",
    "E-commerce",
    "Landing Pages",
    "Website Redesign",
    "Custom Digital Solutions",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <noscript>
          <style>{`
            .reveal, .mask-reveal > span, .hero-line-text,
            .project-media-inner, .why-title, .why-desc {
              opacity: 1 !important;
              transform: none !important;
              clip-path: none !important;
              animation: none !important;
            }
            .hero-line--last .hero-line-text::after {
              animation: none !important;
              opacity: 1 !important;
            }
            .hero-eyebrow, .hero-actions, .hero-note, .hero-foot {
              opacity: 1 !important;
              animation: none !important;
            }
          `}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
