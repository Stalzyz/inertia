"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight scroll reveal. Adds `is-visible` once when the element enters
 * the viewport. All motion itself lives in CSS, so reduced-motion users and
 * no-JS visitors still get readable content.
 */
export default function Reveal({
  as: Tag = "div",
  className = "",
  delay = 0,
  style,
  children,
  ...rest
}) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      element.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // `passedAbove` catches elements skipped by very fast scrolling.
        const passedAbove = entry.boundingClientRect.bottom < 0;
        if (entry.isIntersecting || passedAbove) {
          element.classList.add("is-visible");
          observer.unobserve(element);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`.trim()}
      style={{ "--delay": `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
