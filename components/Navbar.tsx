"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";

const links = [
  { href: siteConfig.links.home, label: "Home" },
  { href: siteConfig.links.products, label: "Products" },
  { href: siteConfig.links.about, label: "About" },
  { href: siteConfig.links.reviews, label: "Reviews" },
  { href: siteConfig.links.contact, label: "Contact" },
];

function BrandMark({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/images/logo/loveloop.jpeg"
      alt=""
      width={40}
      height={40}
      priority
      className={`h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-line shadow-sm ${className}`}
    />
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const prevPath = useRef(pathname);
  useEffect(() => {
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;
    // close the drawer when the route changes (deferred by a frame so state is
    // never set synchronously inside the effect body)
    const frame = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-line/80 bg-cream/85 backdrop-blur-xl"
            : "border-b border-transparent bg-cream/40 backdrop-blur-md"
        }`}
      >
        <div className="container-site flex h-[72px] items-center justify-between gap-6 md:h-20">
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label={`${siteConfig.name} — home`}
          >
            <BrandMark className="transition-transform duration-500 group-hover:rotate-45" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-semibold tracking-tight text-ink sm:text-xl">
                {siteConfig.name}
              </span>
              <span className="mt-1 hidden text-[0.68rem] uppercase tracking-[0.2em] text-faint sm:block">
                {siteConfig.tagline}
              </span>
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                  isActive(link.href) ? "text-rose-deep" : "text-ink/80 hover:text-ink"
                }`}
              >
                {link.label}
                <span
                  className={`absolute inset-x-4 -bottom-0.5 h-px origin-left bg-rose-deep transition-transform duration-300 ${
                    isActive(link.href) ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={siteConfig.links.order}
              className="btn btn-primary btn-sm btn-hide-below-sm hidden sm:inline-flex"
            >
              Order Now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white/70 text-ink transition-colors hover:border-ink lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/*
        Mobile drawer — deliberately rendered OUTSIDE <header>. The header carries
        `backdrop-blur-*` (backdrop-filter), which makes it the containing block
        for fixed-position descendants: while this overlay was a child of the
        header, `fixed inset-0` resolved to the 72px navbar box instead of the
        viewport, so the panel and its backdrop collapsed and the links were
        clipped/covered by the page underneath.
      */}
      <div id="mobile-menu" className="lg:hidden">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          aria-hidden={!open}
          inert={!open ? true : undefined}
          className={`fixed inset-0 z-50 flex transition-opacity duration-300 ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className={`relative ml-auto flex h-full w-[84%] max-w-sm flex-col overflow-y-auto bg-cream shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              open ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <span className="flex items-center gap-3">
                <Image
                  src="/images/logo/loveloop.jpeg"
                  alt=""
                  width={36}
                  height={36}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-line"
                />
                <span className="font-display text-lg font-semibold">{siteConfig.name}</span>
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-full border border-line"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="Mobile" className="flex flex-col gap-1 px-4 py-6">
              {[...links, { href: siteConfig.links.order, label: "Order" }].map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-lg transition-all duration-500 ${
                    open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                  } ${
                    isActive(link.href)
                      ? "bg-blush text-rose-deep"
                      : "text-ink hover:bg-shell"
                  }`}
                  style={{ transitionDelay: `${80 + i * 55}ms` }}
                >
                  <span className="font-display">{link.label}</span>
                  <ArrowRight className="h-4 w-4 opacity-40" aria-hidden="true" />
                </Link>
              ))}
            </nav>

            <div className="mt-auto space-y-3 border-t border-line px-6 py-6">
              <Link href={siteConfig.links.order} className="btn btn-rose btn-block">
                Order Now
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <p className="text-center text-xs leading-relaxed text-faint">
                Handmade to order · Ships across India
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
