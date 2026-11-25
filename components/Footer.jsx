import Image from "next/image";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { nav, site } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-intro">
            <Link href="/" className="wordmark" aria-label={`${site.name} — home`}>
              <Image
                className="footer-logo"
                src={site.logo}
                alt=""
                width={1200}
                height={405}
                sizes="(max-width: 700px) 120px, 180px"
              />
            </Link>
            <p>{site.descriptor}</p>
          </div>

          <div className="footer-col">
            <h2>Explore</h2>
            <div className="footer-links">
              {nav.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
              <Link href="/#contact">Contact</Link>
            </div>
          </div>

          <div className="footer-col">
            <h2>Get in touch</h2>
            <div className="footer-links">
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <a
                href={site.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                {site.whatsappLabel}
              </a>
              <address className="footer-address">
                {site.address.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {site.year} {site.name}. All rights reserved.
          </span>
          <Link className="back-to-top" href="/#top">
            Back to top
            <ArrowUp size={13} strokeWidth={1.7} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
