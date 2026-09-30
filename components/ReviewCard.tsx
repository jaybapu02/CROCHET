import { Star } from "lucide-react";
import type { Review } from "@/data/reviews";

export function ReviewStars({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`h-4 w-4 ${i <= rating ? "fill-mustard text-mustard" : "text-line"}`}
        />
      ))}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ReviewCard({
  review,
  className = "",
}: {
  review: Review;
  className?: string;
}) {
  return (
    <figure
      className={`card flex h-full flex-col gap-4 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] sm:p-7 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <ReviewStars rating={review.rating} />
        <time dateTime={review.isoDate} className="text-xs uppercase tracking-wider text-faint">
          {review.date}
        </time>
      </div>

      <blockquote className="text-[0.98rem] leading-relaxed text-ink/90">
        “{review.text}”
      </blockquote>

      <figcaption className="mt-auto flex items-center gap-3 border-t border-line pt-4">
        <span
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blush font-display text-sm font-semibold text-rose-deep"
        >
          {initials(review.name)}
        </span>
        <span className="flex flex-col">
          <span className="text-sm font-semibold text-ink">{review.name}</span>
          <span className="text-xs text-faint">{review.product}</span>
        </span>
      </figcaption>
    </figure>
  );
}
