"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** animation style */
  as?: "div" | "section" | "article" | "li" | "figure";
  delay?: number;
  effect?: "rise" | "fade";
  className?: string;
};

/**
 * Lightweight scroll-reveal wrapper (IntersectionObserver + CSS).
 * Content stays visible when JavaScript is unavailable (the CSS that hides it
 * is gated on the `js` class) and animation is skipped for users who prefer
 * reduced motion.
 *
 * Server and client must render identical markup on hydration: both start
 * hidden (`is-visible` is only added after the IntersectionObserver fires, or
 * immediately in an effect when the observer is unavailable).
 */
export default function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  effect = "rise",
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // No browser that runs React 19 lacks IntersectionObserver, but if we
      // ever get here, reveal immediately by updating the DOM (an effect may
      // mutate the DOM; React only rewrites className when the prop changes).
      el.classList.add("is-visible");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-reveal={effect}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
      className={`${className ?? ""} ${visible ? "is-visible" : ""}`}
    >
      {children}
    </Tag>
  );
}
