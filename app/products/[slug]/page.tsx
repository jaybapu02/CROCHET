import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Box, Heart, Ruler, Sparkles } from "lucide-react";
import { getCategory } from "@/data/categories";
import { getProductBySlug, products, type Product } from "@/data/products";
import { siteConfig } from "@/data/siteConfig";
import { formatProductPrice, formatVariantPrice } from "@/lib/format";
import Breadcrumbs from "@/components/Breadcrumbs";
import ProductGallery from "@/components/ProductGallery";
import OrderActions from "@/components/OrderActions";
import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return { title: "Product not found", description: "This product could not be found." };
  }
  const category = getCategory(product.category);
  return {
    title: `${product.name} | Handmade Crochet ${category?.shortName ?? ""}`.trim(),
    description: `${product.shortDescription} ${product.description}`.slice(0, 155),
    openGraph: {
      images: [product.images[0]],
      type: "website",
    },
  };
}

function RelatedProducts({ product }: { product: Product }) {
  const sameCategory = products.filter(
    (p) => p.slug !== product.slug && p.category === product.category,
  );
  const others = products.filter(
    (p) => p.slug !== product.slug && p.category !== product.category && p.featured,
  );
  const related = [...sameCategory, ...others].slice(0, 4);
  if (related.length === 0) return null;

  return (
    <section className="mt-20 border-t border-line pt-14" aria-labelledby="related-heading">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow="You may also like"
          title={<span id="related-heading">More handmade pieces</span>}
        />
        <Reveal delay={80}>
          <Link href={siteConfig.links.products} className="btn btn-ghost btn-sm">
            All products
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((item, i) => (
          <Reveal key={item.id} delay={i * 60} className="h-full">
            <ProductCard product={item} className="h-full" />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default async function ProductDetailPage({ params }: Params) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategory(product.category);

  return (
    <div className="container-site pb-24 pt-28 md:pt-36">
      <Breadcrumbs
        items={[
          { label: "Products", href: siteConfig.links.products },
          ...(category ? [{ label: category.name, href: `/products?category=${category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal effect="fade">
          <ProductGallery images={product.images} productName={product.name} />
        </Reveal>

        <div className="flex flex-col gap-6">
          <Reveal className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-blush px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-rose-deep">
                {category?.name ?? product.category}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] ${
                  product.available
                    ? "border-sage/40 bg-sage/10 text-sage-deep"
                    : "border-line bg-shell text-faint"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${product.available ? "bg-sage" : "bg-faint"}`}
                  aria-hidden="true"
                />
                {product.available ? "Available to order" : "Sold out"}
              </span>
            </div>

            <h1 className="text-4xl leading-tight sm:text-5xl">{product.name}</h1>

            <div className="flex flex-wrap items-baseline gap-4">
              <p className="font-display text-3xl font-semibold text-rose-deep">
                {product.variants && product.variants.length > 0 ? (
                  <span className="flex flex-col gap-1">
                    {product.variants.map((variant) => (
                      <span key={variant.label}>
                        {formatVariantPrice(variant.price, variant.label)}
                      </span>
                    ))}
                  </span>
                ) : (
                  formatProductPrice(product.price, product.priceNote)
                )}
              </p>
              <p className="text-sm text-faint">{product.leadTime}</p>
            </div>

            <p className="lede">{product.description}</p>
          </Reveal>

          <Reveal delay={80}>
            <dl className="grid gap-3 rounded-3xl border border-line bg-shell/50 p-6 sm:grid-cols-1">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4.5 w-4.5 shrink-0 text-rose-deep" aria-hidden="true" />
                <div>
                  <dt className="text-sm font-semibold">Materials</dt>
                  <dd className="text-sm text-muted">{product.materials}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Ruler className="mt-0.5 h-4.5 w-4.5 shrink-0 text-rose-deep" aria-hidden="true" />
                <div>
                  <dt className="text-sm font-semibold">Approximate size</dt>
                  <dd className="text-sm text-muted">{product.size}</dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Box className="mt-0.5 h-4.5 w-4.5 shrink-0 text-rose-deep" aria-hidden="true" />
                <div>
                  <dt className="text-sm font-semibold">Care instructions</dt>
                  <dd className="text-sm text-muted">{product.care}</dd>
                </div>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={140}>
            <OrderActions
              slug={product.slug}
              name={product.name}
              price={product.price}
              priceNote={product.priceNote}
              variants={product.variants}
              available={product.available}
              customisable={product.customisable}
              leadTime={product.leadTime}
            />
          </Reveal>

          <Reveal delay={200} className="flex items-center gap-3 text-sm text-muted">
            <Heart className="h-4 w-4 text-rose-deep" aria-hidden="true" />
            Handmade to order — each piece is crocheted just for you.
          </Reveal>
        </div>
      </div>

      <RelatedProducts product={product} />
    </div>
  );
}
