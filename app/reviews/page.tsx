import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { averageRating, reviews } from "@/data/reviews";
import { siteConfig } from "@/data/siteConfig";
import { whatsappUrl } from "@/lib/whatsapp";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import ReviewCard from "@/components/ReviewCard";
import CTASection from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Reviews",
  description:
    "Read what customers say about our handmade crochet flowers, bags, toys and gifts.",
  openGraph: { images: ["/images/gallery/g1.webp"] },
};

const stats = [
  { label: "Average rating", value: `${averageRating} / 5` },
  { label: "Reviews", value: `${reviews.length}` },
  { label: "Five star reviews", value: `${reviews.filter((r) => r.rating === 5).length}` },
  { label: "Repeat gift-givers", value: "Most" },
];

export default function ReviewsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Customer reviews"
        title={
          <>
            Kind words from
            <br />
            happy hands
          </>
        }
        description="Every review below comes from someone who ordered a handmade piece — and took the time to tell us how it arrived."
      >
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-line bg-card px-4 py-3">
              <dt className="text-[0.68rem] uppercase tracking-[0.16em] text-faint">{stat.label}</dt>
              <dd className="font-display text-xl font-semibold text-rose-deep">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </PageHeader>

      <section className="section" aria-label="Customer reviews">
        <div className="container-site">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, i) => (
              <Reveal key={review.id} delay={(i % 3) * 70} className="h-full">
                <ReviewCard review={review} className="h-full" />
              </Reveal>
            ))}
          </div>

          <Reveal
            delay={120}
            className="mt-12 flex flex-col items-center gap-4 rounded-3xl border border-line bg-shell/60 px-6 py-10 text-center"
          >
            <span className="flex items-center gap-1" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-5 w-5 fill-mustard text-mustard" />
              ))}
            </span>
            <h2 className="text-2xl sm:text-3xl">Had a lovely experience? Tell us.</h2>
            <p className="max-w-md text-sm text-muted">
              Send us a photo of your piece in its new home — we share a few every month on
              Instagram.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={siteConfig.links.products} className="btn btn-primary btn-sm">
                Shop products
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href={whatsappUrl(`Hello ${siteConfig.name}! I’d like to share a review.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
              >
                Send a review
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection
        title="See what the fuss is about"
        text="Browse the collection, pick your favourite and we’ll start crocheting it today."
        primaryLabel="Explore Collection"
        primaryHref={siteConfig.links.products}
      />
    </>
  );
}
