import type { Metadata } from "next";
import { Suspense } from "react";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import PageHeader from "@/components/PageHeader";
import ProductsExplorer from "@/components/ProductsExplorer";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse handmade crochet flowers, bags, plush toys, keychains, home decor and custom gifts. Order directly on WhatsApp.",
  openGraph: {
    images: ["/images/categories/flowers.webp"],
  },
};

function ExplorerFallback() {
  return (
    <div className="container-site pb-24" aria-busy="true">
      <div className="mb-6 h-11 w-full max-w-md animate-pulse rounded-xl bg-shell" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[26rem] animate-pulse rounded-3xl bg-shell" />
        ))}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        eyebrow="The collection"
        title={
          <>
            Handmade pieces,
            <br />
            ready to become yours
          </>
        }
        description="Every item below is crocheted by hand after you order. Filter by category, search the catalogue, and send your order straight to WhatsApp."
      />

      <div className="pt-8">
        <Suspense fallback={<ExplorerFallback />}>
          <ProductsExplorer products={products} categories={categories} />
        </Suspense>
      </div>
    </>
  );
}
