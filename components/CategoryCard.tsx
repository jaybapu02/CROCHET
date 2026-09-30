import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/data/categories";
import ProductImage from "@/components/ProductImage";

export default function CategoryCard({ category, index = 0 }: { category: Category; index?: number }) {
  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-shell shadow-[var(--shadow-soft)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)] sm:aspect-square"
    >
      <ProductImage
        src={category.image}
        alt={category.name}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
        priority={index < 2}
      />
      <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/5 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
        <span className="flex flex-col">
          <span className="font-display text-lg font-semibold text-white">{category.name}</span>
          <span className="line-clamp-1 text-xs text-white/75">{category.description}</span>
        </span>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-transform duration-300 group-hover:rotate-45 group-hover:bg-white/35">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </span>
    </Link>
  );
}
