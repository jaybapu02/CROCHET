import Link from "next/link";
import { ArrowRight, Eye } from "lucide-react";
import type { Product } from "@/data/products";
import { getCategory } from "@/data/categories";
import { siteConfig } from "@/data/siteConfig";
import { formatProductPrice, formatVariantPrice } from "@/lib/format";
import { buildOrderMessage, whatsappUrl } from "@/lib/whatsapp";
import ProductImage from "@/components/ProductImage";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
  className?: string;
  /**
   * Compact variant used by the home page "Best sellers" row: the price sits
   * under the title, text blocks keep a fixed height so cards line up, and the
   * CTA pair is tightened so it never overruns a narrow card.
   */
  compact?: boolean;
};

export default function ProductCard({
  product,
  priority = false,
  className = "",
  compact = false,
}: ProductCardProps) {
  const category = getCategory(product.category);
  const variants = product.variants ?? [];
  /** Products with variants default to the first option (e.g. "Single"). */
  const defaultVariant = variants[0];
  const orderUrl = whatsappUrl(
    buildOrderMessage({
      productName: product.name,
      price: defaultVariant ? defaultVariant.price : product.price,
      priceNote: defaultVariant ? `— ${defaultVariant.label}` : product.priceNote,
      quantity: 1,
    }),
  );

  const priceNode =
    variants.length > 0 ? (
      <span className="flex flex-col gap-0.5">
        {variants.map((variant) => (
          <span key={variant.label} className="whitespace-nowrap">
            {formatVariantPrice(variant.price, variant.label)}
          </span>
        ))}
      </span>
    ) : (
      formatProductPrice(product.price, product.priceNote)
    );

  return (
    <article className={`card card-hover group flex h-full flex-col overflow-hidden ${className}`}>
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-shell"
        tabIndex={-1}
        aria-hidden="true"
      >
        <ProductImage
          src={product.images[0]}
          alt={`${product.name} — handmade crochet by ${siteConfig.name}`}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-rose-deep backdrop-blur-sm">
          {category?.shortName ?? category?.name ?? product.category}
        </span>
        {!product.available && (
          <span className="absolute right-4 top-4 rounded-full bg-ink/85 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-cream">
            Sold out
          </span>
        )}
        {product.bestSeller && product.available && (
          <span className="absolute right-4 top-4 rounded-full bg-mustard/95 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-ink">
            Best seller
          </span>
        )}
      </Link>

      <div className={`flex flex-1 flex-col ${compact ? "gap-2.5 p-4" : "gap-3 p-5"}`}>
        {compact ? (
          <div className="flex flex-col gap-1.5">
            <h3 className="min-h-[1.65rem] text-lg leading-snug lg:min-h-[3.1rem]">
              <Link
                href={`/products/${product.slug}`}
                className="transition-colors hover:text-rose-deep"
              >
                {product.name}
              </Link>
            </h3>
            <p className="self-end text-right font-display text-lg font-semibold text-rose-deep">
              {priceNode}
            </p>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg leading-snug">
              <Link
                href={`/products/${product.slug}`}
                className="transition-colors hover:text-rose-deep"
              >
                {product.name}
              </Link>
            </h3>
            <p className="shrink-0 text-right font-display text-lg font-semibold text-rose-deep">
              {priceNode}
            </p>
          </div>
        )}

        <p
          className={`line-clamp-2 text-sm leading-relaxed text-muted${
            compact ? " min-h-[2.9rem]" : ""
          }`}
        >
          {product.shortDescription}
        </p>

        <div className={`mt-auto flex items-center pt-2 ${compact ? "gap-1.5" : "gap-2"}`}>
          <Link
            href={`/products/${product.slug}`}
            className={`btn btn-ghost flex-1 ${compact ? "btn-tight" : "btn-sm"}`}
            aria-label={`View details for ${product.name}`}
          >
            <Eye
              className={`h-4 w-4${compact ? " hidden xl:block" : ""}`}
              aria-hidden="true"
            />
            Details
          </Link>
          <a
            href={orderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-primary flex-1 ${compact ? "btn-tight" : "btn-sm"}`}
            aria-label={`Order ${product.name} on WhatsApp`}
          >
            Order Now
            <ArrowRight
              className={`h-4 w-4${compact ? " hidden xl:block" : ""}`}
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </article>
  );
}
