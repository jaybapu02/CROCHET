# LOVELOOP — Handmade Crochet Website

A premium, responsive, multi-page marketing + showcase site for a handmade crochet
brand. Front-end only (Next.js App Router, TypeScript, Tailwind CSS) with orders
sent through **WhatsApp** — no database, no backend, no payment gateway.

## Stack

- Next.js (App Router, Turbopack) + React + TypeScript
- Tailwind CSS v4 (design tokens in `app/globals.css`)
- lucide-react icons
- Self-hosted fonts (Fraunces + Inter) via `next/font/local`
- Static rendering for every route; images optimised through `next/image`

## Pages

| Route             | Purpose                                              |
| ----------------- | ---------------------------------------------------- |
| `/`               | Landing page (hero, featured, categories, process, reviews, gallery, CTA) |
| `/products`       | Catalogue with search, category filter and sorting   |
| `/products/[slug]`| Product gallery, details, quantity, order actions    |
| `/order`          | Order form → pre-filled WhatsApp message             |
| `/about`          | Story, why crochet, process, values                  |
| `/reviews`        | Customer reviews                                     |
| `/contact`        | WhatsApp / Instagram / email / location + hours      |
| `404`             | Custom not-found page                                |

Also included: `sitemap.xml`, `robots.txt`, per-page metadata + Open Graph tags.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

## Configuration (important)

All business information lives in **one file**: `data/siteConfig.ts`

- brand name, tagline, description
- WhatsApp number (read from `NEXT_PUBLIC_WHATSAPP_NUMBER`)
- Instagram URL, email, location, studio hours
- canonical site URL (`NEXT_PUBLIC_SITE_URL`)

Environment variables — copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_WHATSAPP_NUMBER=917853081934   # digits only, country code included
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Replacing demo content

| What                     | Where                      |
| ------------------------ | -------------------------- |
| Products (29 samples)    | `data/products.ts`         |
| Categories               | `data/categories.ts`       |
| Reviews (samples)        | `data/reviews.ts`          |
| Business details         | `data/siteConfig.ts`       |
| Product photography      | `public/images/products/…` |

Product images live in `public/images/products/<category>/` and are referenced
by name from each product's `images` array in `data/products.ts`. Drop a new
photo in, point the product at it, and run `node scripts/check-images.mjs`.

## Deploying to Vercel

1. Push the repository to GitHub.
2. Import it in Vercel — framework preset **Next.js** (auto-detected).
3. Add the environment variables above in *Project → Settings → Environment Variables*.
4. Deploy. `npm run build` is the default build command; no server or database is required.

## Scripts

```bash
npm run lint        # ESLint (flat config)
npm run typecheck   # tsc --noEmit
node scripts/generate-art.mjs   # regenerate placeholder artwork (needs: npm i -D sharp)
node scripts/check-images.mjs   # verify every referenced image exists
node scripts/check-coverage.mjs # verify every photo on disk is used by a product/category
node scripts/qa.mjs             # crawl routes, catch console/404/overflow issues (needs: npm i -D playwright)
```

## Notes

- Orders are **never** sent to a server: the form only builds a `wa.me` link with a
  URL-encoded message, and the UI tells the customer to send it to confirm.
- Animations respect `prefers-reduced-motion`; content stays visible without JavaScript.
- WhatsApp number, Instagram and email are not hard-coded anywhere outside
  `data/siteConfig.ts`.
