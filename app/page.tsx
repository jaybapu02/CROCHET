import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  HeartHandshake,
  PackageCheck,
  Palette,
  PencilRuler,
  Scissors,
  Sparkles,
  Star,
} from "lucide-react";
import { categories } from "@/data/categories";
import { bestSellers, featuredProducts } from "@/data/products";
import { reviews } from "@/data/reviews";
import { siteConfig } from "@/data/siteConfig";
import Hero from "@/components/Hero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import CTASection from "@/components/CTASection";
import { ReviewStars } from "@/components/ReviewCard";
import ProductImage from "@/components/ProductImage";

const whyUs = [
  {
    icon: HeartHandshake,
    title: "Handmade with care",
    text: "Every loop is crocheted by hand — no machines, no shortcuts, no rushed work.",
  },
  {
    icon: BadgeCheck,
    title: "Premium materials",
    text: "Soft, durable yarns chosen for their feel, colour fastness and longevity.",
  },
  {
    icon: Palette,
    title: "Custom designs",
    text: "Pick the colours, size and details — we’ll make a piece that’s truly yours.",
  },
  {
    icon: Sparkles,
    title: "Made with love",
    text: "Packed with a handwritten note, because small details make gifts memorable.",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose Your Product",
    text: "Browse the collection and pick a piece you love — or ask for something custom.",
    icon: PencilRuler,
  },
  {
    number: "02",
    title: "Place Your Order",
    text: "Send your details on WhatsApp. We’ll confirm price, timeline and colours.",
    icon: Scissors,
  },
  {
    number: "03",
    title: "Receive Your Creation",
    text: "We crochet it, quality check it, pack it and ship it to your door.",
    icon: PackageCheck,
  },
];

const galleryImages = [
  { src: "/images/gallery/g1.webp", alt: "Crochet rose bouquet in dusty rose tones" },
  { src: "/images/gallery/g2.webp", alt: "Handmade crochet bunny with long ears" },
  { src: "/images/gallery/g3.webp", alt: "Set of pastel crochet coasters" },
  { src: "/images/gallery/g4.webp", alt: "Crochet tote bag with flower detail" },
  { src: "/images/gallery/g5.webp", alt: "Crochet tulip bouquet in a kraft wrap" },
  { src: "/images/gallery/g6.webp", alt: "Amigurumi crochet teddy bear" },
  { src: "/images/gallery/g7.webp", alt: "Crochet gift box with ribbon" },
  { src: "/images/gallery/g8.webp", alt: "Crochet table centrepiece with flowers" },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Featured products */}
      <section className="section border-t border-line" aria-labelledby="featured-heading">
        <div className="container-site">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Featured"
              title={
                <span id="featured-heading">Little things, made slowly and beautifully</span>
              }
              description="A few of the pieces our customers come back for — each one crocheted to order in our studio."
            />
            <Reveal delay={120}>
              <Link href={siteConfig.links.products} className="btn btn-ghost btn-sm">
                View all products
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.slice(0, 6).map((product, i) => (
              <Reveal key={product.id} delay={i * 70} className="h-full">
                <ProductCard product={product} priority={i < 3} className="h-full" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section bg-shell/50" aria-labelledby="categories-heading">
        <div className="container-site">
          <SectionHeading
            eyebrow="Shop by category"
            title={<span id="categories-heading">Find your kind of handmade</span>}
            description="Bouquets, bags, hair clips, baby clothes, plushies and custom gifts — every category is stitched with the same attention to detail."
            className="mb-10"
          />
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {categories.map((category, i) => (
              <Reveal key={category.slug} delay={i * 60} className="h-full">
                <CategoryCard category={category} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="section" aria-labelledby="why-heading">
        <div className="container-site">
          <SectionHeading
            eyebrow="Why choose us"
            title={<span id="why-heading">The difference is in the details</span>}
            description="We treat every order like a gift we’re making for someone we love."
            align="center"
            className="mb-12"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyUs.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={i * 80} className="h-full">
                  <article className="card card-hover flex h-full flex-col gap-4 p-7">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blush text-rose-deep">
                      <Icon className="h-6 w-6" strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <h3 className="text-xl">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted">{item.text}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section bg-ink text-cream" aria-labelledby="how-heading">
        <div className="container-site">
          <div className="mb-14 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4">
              <span className="eyebrow text-clay">How it works</span>
              <h2 id="how-heading" className="max-w-xl text-3xl text-cream sm:text-4xl lg:text-[2.6rem]">
                From our hooks to your hands, in three simple steps
              </h2>
            </div>
            <Reveal delay={100}>
              <Link href={siteConfig.links.order} className="btn btn-light btn-sm">
                Start your order
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>

          <ol className="grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.number} delay={i * 100} className="h-full">
                  <li className="relative h-full overflow-hidden rounded-3xl border border-white/15 bg-white/5 p-7 backdrop-blur transition-colors duration-300 hover:border-white/30">
                    <span className="pointer-events-none absolute -right-3 -top-5 font-display text-[7rem] leading-none text-white/5">
                      {step.number}
                    </span>
                    <span className="relative flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-clay">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      Step {step.number}
                    </span>
                    <h3 className="relative mt-5 text-2xl text-cream">{step.title}</h3>
                    <p className="relative mt-3 text-sm leading-relaxed text-cream/70">{step.text}</p>
                  </li>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Best sellers */}
      <section className="section" aria-labelledby="best-heading">
        <div className="container-site">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Best sellers"
              title={<span id="best-heading">The ones everyone asks for</span>}
              description="Fan favourites that have found their way into homes across India."
            />
            <Reveal delay={120}>
              <Link href={siteConfig.links.products} className="btn btn-ghost btn-sm">
                Shop the collection
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>

          <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellers.slice(0, 4).map((product, i) => (
              <Reveal key={product.id} delay={i * 70} className="h-full">
                <ProductCard product={product} compact priority={i < 4} className="h-full" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews preview */}
      <section className="section bg-shell/50" aria-labelledby="reviews-heading">
        <div className="container-site">
          <SectionHeading
            eyebrow="Kind words"
            title={<span id="reviews-heading">Loved by thoughtful gift-givers</span>}
            description="Real notes from people who ordered a little handmade joy."
            className="mb-10"
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {reviews.slice(0, 4).map((review, i) => (
              <Reveal
                key={review.id}
                delay={i * 80}
                className="flex h-full flex-col rounded-3xl border border-line bg-card p-6 shadow-[var(--shadow-soft)]"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <ReviewStars rating={review.rating} />
                  <span className="text-xs uppercase tracking-wider text-faint">{review.date}</span>
                </div>
                <blockquote className="text-sm leading-relaxed text-ink/90">
                  “{review.text}”
                </blockquote>
                <figcaption className="mt-5 border-t border-line pt-4 text-sm">
                  <span className="font-semibold text-ink">— {review.name}</span>
                  <span className="block text-xs text-faint">{review.product}</span>
                </figcaption>
              </Reveal>
            ))}
          </div>

          <Reveal delay={160} className="mt-10 flex justify-center">
            <Link href={siteConfig.links.reviews} className="btn btn-ghost btn-sm">
              View all reviews
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Gallery */}
      <section className="section" aria-labelledby="gallery-heading">
        <div className="container-site">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Studio journal"
              title={<span id="gallery-heading">Fresh off the hook</span>}
              description="A peek at what’s currently on our hooks and tables."
            />
            <Reveal delay={120}>
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
              >
                Follow us on Instagram
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {galleryImages.map((image, i) => (
              <Reveal
                key={image.src}
                delay={i * 50}
                effect="fade"
                className="group relative aspect-square overflow-hidden rounded-2xl border border-line bg-shell"
              >
                <ProductImage
                  src={image.src}
                  alt={image.alt}
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/25" />
              </Reveal>
            ))}
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-sm text-faint">
            <Star className="h-4 w-4 fill-mustard text-mustard" aria-hidden="true" />
            Follow {siteConfig.instagramHandle} for new drops.
          </p>
        </div>
      </section>

      <CTASection />
    </>
  );
}
