"use client";

import Image from "next/image";
import { useState } from "react";

type ProductImageProps = {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

/**
 * Next.js Image with a graceful fallback: if the file is missing or fails to
 * load, a soft on-brand placeholder is shown instead of a broken image.
 */
export default function ProductImage({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, 33vw",
  className = "",
  priority = false,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-shell via-blush to-clay ${className}`}
      >
        <span className="font-display text-sm tracking-wide text-rose-deep opacity-80">
          Handmade crochet
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
