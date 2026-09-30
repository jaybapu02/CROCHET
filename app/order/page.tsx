import type { Metadata } from "next";
import { Suspense } from "react";
import { Clock, MessageCircle, PackageSearch, Sparkles } from "lucide-react";
import { products } from "@/data/products";
import { siteConfig } from "@/data/siteConfig";
import { whatsappUrl } from "@/lib/whatsapp";
import PageHeader from "@/components/PageHeader";
import OrderForm from "@/components/OrderForm";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Place an Order",
  description:
    "Send your crochet order straight to WhatsApp — choose a product, add your details and we’ll confirm everything personally.",
  openGraph: { images: ["/images/hero/cta-bg.webp"] },
};

const howItWorks = [
  {
    step: "01",
    title: "Fill in your details",
    text: "Pick your product, quantity and tell us where it’s going.",
  },
  {
    step: "02",
    title: "Send on WhatsApp",
    text: "We prepare the message for you — one tap and it’s on its way.",
  },
  {
    step: "03",
    title: "We confirm & crochet",
    text: "We reply with timeline and payment details, then start crafting.",
  },
];

function FormFallback() {
  return (
    <div className="flex flex-col gap-5 rounded-3xl border border-line bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8" aria-busy="true">
      <div className="h-8 w-52 animate-pulse rounded-lg bg-shell" />
      <div className="h-11 w-full animate-pulse rounded-xl bg-shell" />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="h-11 animate-pulse rounded-xl bg-shell" />
        <div className="h-11 animate-pulse rounded-xl bg-shell" />
      </div>
      <div className="h-24 animate-pulse rounded-xl bg-shell" />
      <div className="h-24 animate-pulse rounded-xl bg-shell" />
      <div className="h-12 animate-pulse rounded-full bg-shell" />
    </div>
  );
}

export default function OrderPage() {
  return (
    <>
      <PageHeader
        eyebrow="Place an order"
        title={
          <>
            Let’s make something
            <br />
            just for you
          </>
        }
        description="No checkout, no account — just a quick WhatsApp message. Fill in the form and we’ll confirm availability, timeline and delivery personally."
      />

      <section className="container-site grid gap-8 py-12 md:py-16 lg:grid-cols-[1.45fr_1fr] lg:gap-12">
        <Suspense fallback={<FormFallback />}>
          <OrderForm products={products} />
        </Suspense>

        <aside className="flex flex-col gap-6">
          <Reveal className="rounded-3xl border border-line bg-shell/60 p-6 sm:p-7">
            <span className="eyebrow">How ordering works</span>
            <ol className="mt-5 space-y-5">
              {howItWorks.map((item) => (
                <li key={item.step} className="flex gap-4">
                  <span className="font-display text-xl font-semibold text-rose-deep">{item.step}</span>
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold text-ink">{item.title}</span>
                    <span className="text-sm text-muted">{item.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={80} className="rounded-3xl border border-line bg-card p-6 shadow-[var(--shadow-soft)] sm:p-7">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blush text-rose-deep">
              <MessageCircle className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl">Rather just chat?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Message us directly — we usually reply within a few hours during business hours.
            </p>
            <a
              href={whatsappUrl(`Hello ${siteConfig.name}! I’d like to place an order.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm mt-4"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Open WhatsApp
            </a>
          </Reveal>

          <Reveal delay={140} className="rounded-3xl border border-line bg-card p-6 shadow-[var(--shadow-soft)] sm:p-7">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sage/15 text-sage-deep">
              <PackageSearch className="h-5 w-5" strokeWidth={1.7} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl">Looking for something custom?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Name a colour, a size or an occasion — we’ll design it with you before we start.
            </p>
            <a
              href={whatsappUrl(
                `Hello ${siteConfig.name}! I’d like to request a custom crochet piece.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm mt-4"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Request a custom piece
            </a>
          </Reveal>

          <Reveal delay={200} className="flex items-start gap-3 rounded-3xl border border-line bg-shell/40 p-6 text-sm text-muted">
            <Clock className="mt-0.5 h-4.5 w-4.5 shrink-0 text-rose-deep" aria-hidden="true" />
            <div>
              <p className="font-semibold text-ink">Studio hours</p>
              {siteConfig.hours.map((line) => (
                <p key={line.days}>
                  {line.days}: {line.time}
                </p>
              ))}
            </div>
          </Reveal>
        </aside>
      </section>
    </>
  );
}
