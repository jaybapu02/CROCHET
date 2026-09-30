"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import ProductImage from "@/components/ProductImage";

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

/**
 * Image gallery with thumbnails, touch swiping, a full-screen lightbox
 * and click-to-zoom inside the lightbox.
 */
export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const touchStart = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const count = images.length;
  const go = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, index, go]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > 45) go(delta < 0 ? index + 1 : index - 1);
    touchStart.current = null;
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-line bg-shell shadow-[var(--shadow-soft)]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <ProductImage
          src={images[index]}
          alt={`${productName} — view ${index + 1} of ${count}`}
          sizes="(max-width: 1024px) 100vw, 45vw"
          className="object-cover"
          priority={index === 0}
        />

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open image gallery"
          className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-cream/90 text-ink backdrop-blur transition-transform hover:scale-105"
        >
          <Maximize2 className="h-4.5 w-4.5" aria-hidden="true" />
        </button>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cream/90 text-ink backdrop-blur transition-transform hover:scale-105"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next image"
              className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-cream/90 text-ink backdrop-blur transition-transform hover:scale-105"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}

        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-ink/70 px-3 py-1 text-xs text-cream">
          {index + 1} / {count}
        </span>
      </div>

      {count > 1 && (
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Product images">
          {images.map((image, i) => (
            <button
              key={image}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show image ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 sm:h-28 sm:w-24 ${
                i === index
                  ? "border-rose-deep shadow-[var(--shadow-soft)]"
                  : "border-transparent opacity-75 hover:opacity-100"
              }`}
            >
              <ProductImage
                src={image}
                alt=""
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} images`}
          className="fixed inset-0 z-[60] flex flex-col bg-ink/95 backdrop-blur"
        >
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <p className="text-sm text-cream/80">
              {productName} · {index + 1}/{count}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close gallery"
              className="grid h-11 w-11 place-items-center rounded-full border border-white/30 text-cream transition-colors hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-6">
            <div
              className={`relative h-full w-full max-w-4xl cursor-zoom-in overflow-hidden rounded-2xl transition-transform duration-500 ${
                zoomed ? "scale-150 cursor-zoom-out" : "scale-100"
              }`}
              onClick={() => setZoomed((z) => !z)}
            >
              <ProductImage
                src={images[index]}
                alt={`${productName} — enlarged view ${index + 1}`}
                sizes="90vw"
                className="object-contain"
              />
            </div>

            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(index - 1)}
                  aria-label="Previous image"
                  className="absolute left-3 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-cream transition-colors hover:bg-white/20 sm:left-6"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => go(index + 1)}
                  aria-label="Next image"
                  className="absolute right-3 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-cream transition-colors hover:bg-white/20 sm:right-6"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          <p className="pb-5 text-center text-xs text-cream/50">Tap the image to zoom</p>
        </div>
      )}
    </div>
  );
}
