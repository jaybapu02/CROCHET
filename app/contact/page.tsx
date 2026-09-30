import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, ArrowRight } from "lucide-react";
import { InstagramIcon } from "@/components/Icons";
import { siteConfig } from "@/data/siteConfig";
import { whatsappUrl } from "@/lib/whatsapp";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";
import CTASection from "@/components/CTASection";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Questions about an order, a custom piece or delivery? Talk to us on WhatsApp, Instagram or email.",
  openGraph: { images: ["/images/about/studio-detail.webp"] },
};

const channels = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: `${siteConfig.whatsappDisplay} — fastest reply, usually within a few hours`,
    action: "Chat on WhatsApp",
    href: () => whatsappUrl(`Hello ${siteConfig.name}! I have a question about your crochet products.`),
    external: true,
  },
  {
    icon: InstagramIcon,
    title: "Instagram",
    value: siteConfig.instagramHandle,
    action: "Follow us on Instagram",
    href: () => siteConfig.instagram,
    external: true,
  },
  {
    icon: Mail,
    title: "Email",
    value: siteConfig.email,
    action: "Send an email",
    href: () => `mailto:${siteConfig.email}`,
    external: false,
  },
  {
    icon: MapPin,
    title: "Studio",
    value: siteConfig.location.address,
    action: "Ask for pickup details",
    href: () => whatsappUrl(`Hello ${siteConfig.name}! I’d like to visit the studio.`),
    external: true,
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title={
          <>
            Have a question?
            <br />
            Talk to us.
          </>
        }
        description="Whether it’s a custom colour, a delivery deadline or a gift idea — message us and we’ll get back to you personally."
      />

      <section className="section" aria-label="Contact options">
        <div className="container-site grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-14">
          <div className="grid gap-6 sm:grid-cols-2">
            {channels.map((channel, i) => {
              const Icon = channel.icon;
              return (
                <Reveal key={channel.title} delay={i * 70} className="h-full">
                  <article className="card card-hover flex h-full flex-col gap-4 p-6 sm:p-7">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blush text-rose-deep">
                      <Icon className="h-6 w-6" strokeWidth={1.7} aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="text-xl">{channel.title}</h2>
                      <p className="mt-1 break-words text-sm text-muted">{channel.value}</p>
                    </div>
                    <a
                      href={channel.href()}
                      {...(channel.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="btn btn-ghost btn-sm mt-auto self-start"
                    >
                      {channel.action}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <Reveal delay={120} className="flex flex-col gap-6">
            <div className="rounded-3xl border border-line bg-shell/60 p-6 sm:p-8">
              <span className="eyebrow">Business hours</span>
              <ul className="mt-5 space-y-4">
                {siteConfig.hours.map((line) => (
                  <li key={line.days} className="flex items-start justify-between gap-4 text-sm">
                    <span className="flex items-center gap-2 font-medium text-ink">
                      <Clock className="h-4 w-4 text-rose-deep" aria-hidden="true" />
                      {line.days}
                    </span>
                    <span className="text-right text-muted">{line.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-line bg-ink p-6 text-cream sm:p-8">
              <h2 className="text-2xl text-cream">Have a question?</h2>
              <p className="mt-3 text-sm leading-relaxed text-cream/70">
                Talk to us on WhatsApp — share a screenshot, a colour reference or just an idea and
                we’ll take it from there.
              </p>
              <a
                href={whatsappUrl(`Hello ${siteConfig.name}! I have a question for you.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-rose mt-5"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Talk to us on WhatsApp
              </a>
            </div>

            <div className="rounded-3xl border border-line bg-card p-6 text-sm text-muted shadow-[var(--shadow-soft)] sm:p-8">
              <p className="text-xs uppercase tracking-[0.16em] text-faint">Good to know</p>
              <ul className="mt-4 space-y-3">
                <li>· Orders are confirmed only after we reply on WhatsApp.</li>
                <li>· Custom pieces take 4–14 days depending on the design.</li>
                <li>· We ship across India; pickup is available by appointment.</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection
        title="Ready to order something lovely?"
        text="Send us your details on WhatsApp and we’ll confirm everything — no accounts, no checkout forms."
        primaryLabel="Start Your Order"
      />
    </>
  );
}
