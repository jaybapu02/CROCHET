import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, MessageCircle, ArrowUpRight } from "lucide-react";
import { InstagramIcon } from "@/components/Icons";
import { siteConfig } from "@/data/siteConfig";
import { categories } from "@/data/categories";
import { whatsappUrl } from "@/lib/whatsapp";

const quickLinks = [
  { href: siteConfig.links.home, label: "Home" },
  { href: siteConfig.links.products, label: "Products" },
  { href: siteConfig.links.about, label: "About" },
  { href: siteConfig.links.reviews, label: "Reviews" },
  { href: siteConfig.links.contact, label: "Contact" },
];

const customOrdersLink = { href: siteConfig.links.order, label: "Custom Orders" };

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-shell/70">
      <div className="container-site grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="max-w-sm">
          <Image
            src="/images/logo/loveloop.jpeg"
            alt={`${siteConfig.name} logo`}
            width={64}
            height={64}
            className="h-16 w-16 rounded-full object-cover ring-1 ring-line shadow-sm"
          />
          <p className="mt-4 font-display text-2xl font-semibold text-ink">{siteConfig.name}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted">{siteConfig.taglineFull}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-wine"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp
            </a>
            <a
              href={siteConfig.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink"
            >
              <InstagramIcon className="h-4 w-4" />
              Instagram
            </a>
          </div>
        </div>

        <nav aria-label="Quick links">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-faint">Quick Links</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-muted transition-colors hover:text-rose-deep"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Shop">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-faint">Shop</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {categories.slice(0, 5).map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="text-muted transition-colors hover:text-rose-deep"
                >
                  {category.shortName ?? category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={customOrdersLink.href}
                className="text-muted transition-colors hover:text-rose-deep"
              >
                {customOrdersLink.label}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-faint">Connect</h2>
          <ul className="mt-5 space-y-4 text-sm">
            <li>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted transition-colors hover:text-rose-deep"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Chat on WhatsApp
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-muted transition-colors hover:text-rose-deep"
              >
                <InstagramIcon className="h-4 w-4" />
                {siteConfig.instagramHandle}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${siteConfig.email}`}
                className="inline-flex items-center gap-2 text-muted transition-colors hover:text-rose-deep"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                {siteConfig.email}
              </a>
            </li>
            <li className="inline-flex items-start gap-2 text-muted">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {siteConfig.location.address}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-6 text-xs text-faint sm:flex-row">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p>{siteConfig.location.label}</p>
        </div>
      </div>
    </footer>
  );
}
