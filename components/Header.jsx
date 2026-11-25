"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { nav, site } from "@/lib/content";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`site-header${scrolled ? " is-scrolled" : ""}${
          menuOpen ? " menu-open" : ""
        }`}
      >
        <div className="container header-inner">
          <Link
            href="/"
            className="wordmark"
            aria-label={`${site.name} — home`}
            onClick={() => setMenuOpen(false)}
          >
            <Image
              className="header-logo"
              src={site.logo}
              alt=""
              width={1200}
              height={405}
              sizes="(max-width: 700px) 120px, 180px"
              priority
            />
          </Link>

          <nav className="nav" aria-label="Primary navigation">
            {nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <Link className="header-cta" href="/#contact">
            Let&apos;s talk <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
          </Link>

          <button
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X size={20} strokeWidth={1.6} aria-hidden="true" />
            ) : (
              <Menu size={20} strokeWidth={1.6} aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`mobile-menu${menuOpen ? " is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {nav.map((item, index) => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
              <span>0{index + 1}</span>
            </Link>
          ))}
        </nav>
        <div className="mobile-menu-foot">
          <Link href="/#contact" onClick={() => setMenuOpen(false)}>
            Start a project ↗
          </Link>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </div>
      </div>
    </>
  );
}
