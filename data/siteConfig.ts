/**
 * Central business configuration.
 *
 * 👉 Everything the owner may want to change (brand name, WhatsApp number,
 * Instagram, email, location...) lives in THIS file only. No other file in
 * the project hard-codes business details.
 */

const envWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");

/**
 * Canonical site URL — used for SEO/Open Graph tags.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://your-domain.com).
 * On Vercel the deployment URL is picked up automatically.
 */
const envUrl = process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

export const siteUrl = envUrl || "https://stitchandbloom.in";

export const siteConfig = {
  /** Replace with your own brand name. Used in titles, footer, navbar, SEO. */
  name: "LOVELOOP",

  /** Short line under the logo / in the footer. */
  tagline: "Handmade with Love in Odisha",

  /** Tagline shown in the footer under the brand name. */
  taglineFull: "Handmade with Love in Odisha",

  description:
    "Thoughtfully handmade crochet flowers, bags, hair accessories, clothes and gifts — crafted with patience, premium yarn and a lot of love. Order directly on WhatsApp.",

  /**
   * Owner’s WhatsApp number in international format (digits only).
   * Set NEXT_PUBLIC_WHATSAPP_NUMBER in .env.local / Vercel env vars.
   * The fallback below is the business number — every wa.me link on the site
   * is generated from this single value (see lib/whatsapp.ts).
   */
  whatsappNumber: envWhatsApp || "917853081934",

  /** Pretty-printed version of the number, for showing it as text. */
  whatsappDisplay: "+91 78530 81934",

  email: "hello@stitchandbloom.in",

  /** Official Instagram profile (clean URL — no tracking parameters). */
  instagram: "https://www.instagram.com/loveloop144/",

  /** Human-readable Instagram handle for labels/links in the UI. */
  instagramHandle: "instagram.com/loveloop144",

  location: {
    label: "Handmade with Love in Odisha",
    address: "Studio pickup by appointment · Ships across India",
  },

  hours: [
    { days: "Monday – Saturday", time: "10:00 AM – 7:00 PM" },
    { days: "Sunday", time: "Messages answered after 11:00 AM" },
  ],

  currency: "INR" as const,

  /** Links used by the navbar + footer. */
  links: {
    home: "/",
    products: "/products",
    order: "/order",
    about: "/about",
    reviews: "/reviews",
    contact: "/contact",
  },
} as const;

export type SiteConfig = typeof siteConfig;
