import Link from "next/link";
import { ArrowRight, MessageCircle, Star, Sparkles } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";
import { whatsappUrl } from "@/lib/whatsapp";
import { averageRating, reviews } from "@/data/reviews";
import ProductImage from "@/components/ProductImage";
import Reveal from "@/components/Reveal";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24" aria-labelledby="hero-heading">
      {/* soft background shapes */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-blush blur-3xl opacity-70" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-shell blur-3xl opacity-80" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-clay/60 blur-3xl" />
      </div>

      <div className="container-site grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <Reveal>
            <span className="eyebrow">{siteConfig.tagline}</span>
          </Reveal>

          <Reveal delay={80}>
            <h1 id="hero-heading" className="text-[2.75rem] leading-[1.02] sm:text-6xl lg:text-[4.4rem]">
              Handmade with love,
              <br />
              <span className="italic text-rose-deep">one stitch</span> at a time.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="lede text-lg">
              Unique crochet creations made with patience, creativity and love — flowers that never
              wilt, bags you’ll use every day, and gifts that feel personal.
            </p>
          </Reveal>

          <Reveal delay={240} className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href={siteConfig.links.products} className="btn btn-primary">
              Explore Collection
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href={whatsappUrl(`Hello ${siteConfig.name}! I’d like to place an order.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Order via WhatsApp
            </a>
          </Reveal>

          <Reveal delay={320} className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted">
            <span className="flex items-center gap-2">
              <span className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-mustard text-mustard" aria-hidden="true" />
                ))}
              </span>
              <strong className="font-semibold text-ink">{averageRating}</strong>
              <span>from {reviews.length} reviews</span>
            </span>
            <span className="hidden h-4 w-px bg-line sm:block" aria-hidden="true" />
            <span>{siteConfig.location.label}</span>
          </Reveal>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <Reveal effect="fade" delay={120} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line bg-shell shadow-[var(--shadow-lift)]">
              <ProductImage
                src="/images/hero/hero-main.webp"
                alt="Hand-crocheted rose and daisy bouquet wrapped in kraft paper"
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
                priority
              />
            </div>

            {/* floating accent card */}
            <div className="absolute -bottom-6 -left-4 hidden w-44 rounded-2xl border border-line bg-cream/95 p-4 shadow-[var(--shadow-soft)] backdrop-blur sm:block lg:-left-10">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-rose-deep">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Made to order
              </div>
              <p className="mt-2 text-sm leading-snug text-muted">
                Every piece is crocheted by hand after you order.
              </p>
            </div>

            <div className="absolute -right-3 top-6 hidden rounded-2xl border border-line bg-cream/95 px-4 py-3 shadow-[var(--shadow-soft)] backdrop-blur sm:block lg:-right-8">
              <p className="text-xs uppercase tracking-widest text-faint">Ships across</p>
              <p className="font-display text-base font-semibold text-ink">India</p>
            </div>

            <span
              aria-hidden="true"
              className="absolute -left-6 top-10 h-16 w-16 rounded-full border border-rose/40 animate-float"
            />
            <span
              aria-hidden="true"
              className="absolute -right-4 bottom-24 h-10 w-10 rounded-full bg-mustard/50 animate-float-slow"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
