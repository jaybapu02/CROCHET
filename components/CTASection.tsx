import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";
import { whatsappUrl } from "@/lib/whatsapp";
import Reveal from "@/components/Reveal";

type CTASectionProps = {
  title?: string;
  text?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
};

export default function CTASection({
  title = "Looking for something special?",
  text = "Tell us the occasion, the colours and the feeling you’re after — we’ll crochet it for you.",
  primaryLabel = "Start Your Order",
  primaryHref = siteConfig.links.order,
  secondaryLabel = "Chat on WhatsApp",
}: CTASectionProps) {
  return (
    <section className="relative overflow-hidden bg-ink text-cream" aria-labelledby="cta-heading">
      <div
        aria-hidden="true"
        className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-rose-deep/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-sage/25 blur-3xl"
      />
      <div className="container-site relative py-20 text-center md:py-28">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-6">
          <span className="eyebrow text-clay">{primaryLabel === "Start Your Order" ? "Let’s begin" : "Get in touch"}</span>
          <h2 id="cta-heading" className="text-4xl leading-tight sm:text-5xl">
            {title}
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-cream/70 sm:text-lg">{text}</p>
          <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
            <Link href={primaryHref} className="btn btn-rose">
              {primaryLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              href={whatsappUrl(`Hello ${siteConfig.name}! I’d like to place a custom order.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-light"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {secondaryLabel}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
