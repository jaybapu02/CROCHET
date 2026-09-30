import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart, Leaf, Palette, Recycle, Star, Wand2 } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import CTASection from "@/components/CTASection";
import ProductImage from "@/components/ProductImage";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story behind our handmade crochet studio — why we crochet, how every piece is made and what we value.",
  openGraph: { images: ["/images/about/studio-table.webp"] },
};

const process = [
  { step: "01", title: "Idea", text: "A colour, a season, a customer request — every piece starts with a spark." },
  { step: "02", title: "Design", text: "We sketch the shape, size and stitch pattern until it feels right." },
  { step: "03", title: "Choosing Yarn", text: "Only soft, colourfast yarns that wash well and last make the cut." },
  { step: "04", title: "Hand Crochet", text: "Hook, hands and time. A single piece can take several quiet hours." },
  { step: "05", title: "Quality Check", text: "Stitches, seams, shape and finish are checked piece by piece." },
  { step: "06", title: "Packaging", text: "Wrapped in tissue, tied with ribbon and sent with a handwritten note." },
];

const values = [
  {
    icon: Heart,
    title: "Handmade",
    text: "Made by people, not machines — small variations are part of the charm.",
  },
  {
    icon: Star,
    title: "Quality",
    text: "Reinforced seams, colourfast yarn and finishes that survive everyday life.",
  },
  {
    icon: Palette,
    title: "Creativity",
    text: "Fresh palettes and new designs added through the year, never mass-produced.",
  },
  {
    icon: Wand2,
    title: "Personalisation",
    text: "Colours, names and sizes adapted to the person receiving the gift.",
  },
  {
    icon: Recycle,
    title: "Sustainability",
    text: "Made to order, so there’s no dead stock — just thoughtful, unhurried craft.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title={
          <>
            Every stitch
            <br />
            tells a story
          </>
        }
        description="We’re a small crochet studio making slow, thoughtful pieces for people who’d rather give something made by hand than something made by machine."
      />

      {/* Our story */}
      <section className="section" aria-labelledby="story-heading">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal effect="fade" className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-shell shadow-[var(--shadow-soft)]">
              <ProductImage
                src="/images/about/studio-table.webp"
                alt="Crochet studio table with yarn balls, crochet hook and a cup of tea"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-2 hidden w-44 overflow-hidden rounded-2xl border border-line shadow-[var(--shadow-soft)] sm:block lg:-right-6">
              <div className="aspect-[4/5]">
                <ProductImage
                  src="/images/about/studio-detail.webp"
                  alt="Detail of yarn balls and handmade crochet flowers"
                  sizes="176px"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>

          <div className="flex flex-col gap-5">
            <SectionHeading
              eyebrow="How it began"
              title={<span id="story-heading">A hook, a ball of yarn, and a lot of patience</span>}
            />
            <Reveal delay={80} className="flex flex-col gap-4 text-[0.98rem] leading-relaxed text-muted">
              <p>
                What started as a way to slow down became a small studio. We taught ourselves the
                stitches from inherited patterns and patient YouTube tutorials, unpicked more than we
                kept, and slowly found our own style — soft palettes, tidy finishes and shapes that
                feel warm rather than mass-made.
              </p>
              <p>
                Today, every order is still crocheted by hand after it’s placed. We don’t hold stock
                or rush the work. A bouquet takes the time a bouquet takes, and that’s exactly the
                point.
              </p>
              <p className="rounded-2xl border border-line bg-shell/60 p-5 font-display text-lg italic leading-relaxed text-ink">
                “We’d rather make fewer things, made properly, than lots of things made quickly.”
              </p>
              <p className="text-sm font-medium text-ink">
                {"Priyanka Das — Owner & Creative Heart of LOVELOOP."}
              </p>
            </Reveal>
            <Reveal delay={140}>
              <Link href={siteConfig.links.products} className="btn btn-primary btn-sm self-start">
                Explore Collection
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Why crochet */}
      <section className="section bg-shell/50" aria-labelledby="why-crochet-heading">
        <div className="container-site grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <SectionHeading
              eyebrow="Why crochet?"
              title={<span id="why-crochet-heading">Why we chose this craft</span>}
            />
            <Reveal delay={80} className="flex flex-col gap-4 text-[0.98rem] leading-relaxed text-muted">
              <p>
                Knitting machines can’t do what crochet does. Every loop is placed by hand, which is
                why crochet fabric has that unmistakable texture — and why no two pieces are ever
                truly identical.
              </p>
              <p>
                It also means our pieces hold emotional weight. A crocheted flower doesn’t wilt. A
                little dress becomes the one thing a child wants to wear. That’s the value of
                handmade: objects that collect memories.
              </p>
              <p>
                And because everything is made to order, colours and details can be tuned to the
                person receiving it — something no shelf in a shop can offer.
              </p>
            </Reveal>
          </div>

          <Reveal delay={120} effect="fade">
            <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-shell shadow-[var(--shadow-soft)]">
              <ProductImage
                src="/images/about/story.webp"
                alt="Handmade crochet flowers and yarn arranged on a studio table"
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Process */}
      <section className="section" aria-labelledby="process-heading">
        <div className="container-site">
          <SectionHeading
            eyebrow="Our process"
            title={<span id="process-heading">From first sketch to final ribbon</span>}
            description="Six steps stand between an idea and the parcel at your door."
            align="center"
            className="mb-12"
          />

          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {process.map((item, i) => (
              <Reveal key={item.step} delay={i * 70} className="h-full">
                <li className="card card-hover relative h-full overflow-hidden p-7">
                  <span className="font-display text-4xl font-semibold text-clay">{item.step}</span>
                  <h3 className="mt-3 text-xl">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Values */}
      <section className="section bg-ink text-cream" aria-labelledby="values-heading">
        <div className="container-site">
          <div className="mb-12 flex flex-col gap-4">
            <span className="eyebrow text-clay">Our values</span>
            <h2 id="values-heading" className="max-w-2xl text-3xl text-cream sm:text-4xl">
              What we promise with every order
            </h2>
          </div>

          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value, i) => {
              const Icon = value.icon;
              return (
                <Reveal key={value.title} delay={i * 70} className="h-full">
                  <li className="flex h-full flex-col gap-3 rounded-3xl border border-white/12 bg-white/5 p-6 transition-colors duration-300 hover:border-white/25">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-deep/25 text-clay">
                      <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <h3 className="text-xl text-cream">{value.title}</h3>
                    <p className="text-sm leading-relaxed text-cream/70">{value.text}</p>
                  </li>
                </Reveal>
              );
            })}
            <Reveal delay={350} className="h-full">
              <li className="flex h-full flex-col justify-center gap-3 rounded-3xl border border-white/12 bg-gradient-to-br from-rose-deep/30 to-transparent p-6">
                <Leaf className="h-6 w-6 text-clay" aria-hidden="true" />
                <p className="font-display text-xl leading-snug text-cream">
                  Made slowly, kept for years — that’s how we think about waste.
                </p>
              </li>
            </Reveal>
          </ul>
        </div>
      </section>

      <CTASection
        title="Want something made just for you?"
        text="Tell us the colours, the occasion and the feeling you’re after — we’ll crochet the rest."
        primaryLabel="Start Your Order"
      />
    </>
  );
}
