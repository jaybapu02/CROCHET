"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search, SlidersHorizontal, PackageX, X } from "lucide-react";
import type { Product } from "@/data/products";
import type { Category } from "@/data/categories";
import ProductCard from "@/components/ProductCard";

type SortKey = "featured" | "price-asc" | "price-desc" | "name-asc";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "name-asc", label: "Name: A – Z" },
];

type ExplorerProps = {
  products: Product[];
  categories: Category[];
};

export default function ProductsExplorer({ products, categories }: ExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [category, setCategory] = useState(() => searchParams.get("category") ?? "all");
  const [sort, setSort] = useState<SortKey>("featured");
  const [inStockOnly, setInStockOnly] = useState(false);

  const setCategoryAndUrl = (next: string) => {
    setCategory(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("category");
    else params.set("category", next);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      const matchesCategory = category === "all" || p.category === category;
      const matchesStock = !inStockOnly || p.available;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchesCategory && matchesStock && matchesQuery;
    });

    list = [...list];
    /** Products without a price sort last in both directions. */
    const priceOf = (p: Product) => (p.price === null ? Number.MAX_SAFE_INTEGER : p.price);
    if (sort === "price-asc") list.sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "price-desc") list.sort((a, b) => priceOf(b) - priceOf(a));
    if (sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "featured") list.sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [products, category, query, sort, inStockOnly]);

  const resetFilters = () => {
    setQuery("");
    setInStockOnly(false);
    setSort("featured");
    setCategoryAndUrl("all");
  };

  const activeCategory = categories.find((c) => c.slug === category);
  const hasFilters = query.trim() !== "" || inStockOnly || category !== "all";

  return (
    <div className="container-site pb-24">
      {/* Controls — static card: scrolls away with the page so it never
          covers the product grid or adds backdrop-blur scroll jank. */}
      <div className="mb-8 rounded-3xl border border-line bg-cream px-4 py-4 shadow-[var(--shadow-soft)] md:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
            <div className="relative w-full lg:max-w-sm">
              <label htmlFor="product-search" className="sr-only">
                Search products
              </label>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
                aria-hidden="true"
              />
              <input
                id="product-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search bouquets, bags, toys…"
                className={`field field-icon cursor-text${query ? " field-icon-right" : ""}`}
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-faint transition-colors hover:bg-shell"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="product-sort" className="sr-only">
                Sort products
              </label>
              <div className="relative w-full shrink-0 sm:w-60">
                <SlidersHorizontal
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
                  aria-hidden="true"
                />
                <select
                  id="product-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="field field-select cursor-pointer appearance-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
                  aria-hidden="true"
                />
              </div>

              <label className="flex shrink-0 cursor-pointer select-none items-center gap-2 whitespace-nowrap text-sm text-muted">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="h-4 w-4 shrink-0 accent-[var(--color-rose-deep)]"
                />
                In stock
              </label>
            </div>
          </div>

          <div className="-mx-1 flex flex-wrap items-center gap-2 px-1 pb-1">
            {[{ slug: "all", shortName: "All", name: "All products" }, ...categories].map((c) => (
              <button
                key={c.slug}
                type="button"
                className="pill shrink-0"
                data-active={category === c.slug}
                aria-pressed={category === c.slug}
                onClick={() => setCategoryAndUrl(c.slug)}
              >
                {c.shortName ?? c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result meta */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <p aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
          {activeCategory ? ` in ${activeCategory.name}` : ""}
          {query.trim() ? ` for “${query.trim()}”` : ""}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 font-medium text-rose-deep transition-colors hover:text-wine"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-line bg-shell/40 px-6 py-20 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-blush text-rose-deep">
            <PackageX className="h-7 w-7" strokeWidth={1.6} aria-hidden="true" />
          </span>
          <h2 className="text-2xl">No matches just yet</h2>
          <p className="max-w-md text-sm text-muted">
            Try a different search, browse another category — or tell us what you’re looking for and
            we’ll crochet it for you.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <button type="button" className="btn btn-ghost btn-sm" onClick={resetFilters}>
              Reset filters
            </button>
            <a href="/order" className="btn btn-primary btn-sm">
              Request a custom piece
            </a>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i < 4} className="h-full" />
          ))}
        </div>
      )}
    </div>
  );
}
