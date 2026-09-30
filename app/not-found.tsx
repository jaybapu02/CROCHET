import Link from "next/link";
import { ArrowRight, Home, PackageSearch, Search } from "lucide-react";
import { siteConfig } from "@/data/siteConfig";
import { whatsappUrl } from "@/lib/whatsapp";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-44">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blush blur-3xl opacity-70" />
        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-shell blur-3xl" />
      </div>

      <div className="container-site flex flex-col items-center gap-7 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-blush text-rose-deep">
          <PackageSearch className="h-9 w-9" strokeWidth={1.5} aria-hidden="true" />
        </span>

        <span className="eyebrow">404 · Lost a stitch</span>

        <h1 className="max-w-2xl text-4xl leading-tight sm:text-5xl">
          This page seems to have unravelled
        </h1>

        <p className="lede text-center">
          The link you followed doesn’t exist — but the collection does. Head back home, browse the
          products, or send us a message and we’ll help you find what you were looking for.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={siteConfig.links.home} className="btn btn-primary">
            <Home className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
          <Link href={siteConfig.links.products} className="btn btn-ghost">
            <Search className="h-4 w-4" aria-hidden="true" />
            Browse products
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <a
          href={whatsappUrl(`Hello ${siteConfig.name}! I was looking for something on your website.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted underline decoration-line underline-offset-4 transition-colors hover:text-rose-deep"
        >
          Or ask us on WhatsApp
        </a>
      </div>
    </section>
  );
}
