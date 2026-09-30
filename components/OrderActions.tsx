"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle, Minus, Plus } from "lucide-react";
import { formatPrice, formatProductPrice, formatVariantPrice } from "@/lib/format";
import { buildOrderMessage, whatsappUrl } from "@/lib/whatsapp";

type OrderActionsProps = {
  slug: string;
  name: string;
  price: number | null;
  /** Unit/size note shown with the price, e.g. "per tulip". */
  priceNote?: string;
  /** Selectable options — Single / Pair — shown when the product has them. */
  variants?: { label: string; price: number }[];
  available: boolean;
  customisable?: boolean;
  leadTime: string;
};

/**
 * Quantity selector + order CTAs used on the product detail page.
 * "Order Now" continues into the order form (?product=…&qty=…),
 * the secondary action goes straight to WhatsApp.
 */
export default function OrderActions({
  slug,
  name,
  price,
  priceNote,
  variants,
  available,
  customisable,
  leadTime,
}: OrderActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [variantIndex, setVariantIndex] = useState(0);

  const options = variants ?? [];
  const variant =
    options.length > 0 ? options[Math.min(Math.max(variantIndex, 0), options.length - 1)] : undefined;
  /** Price and unit note of the option the customer picked. */
  const unitPrice = variant ? variant.price : price;
  const unitNote = variant ? `— ${variant.label}` : priceNote;

  const orderHref = `/order?product=${slug}&qty=${quantity}${
    variant ? `&variant=${encodeURIComponent(variant.label)}` : ""
  }${note.trim() ? `&note=${encodeURIComponent(note.trim())}` : ""}`;

  const directMessage = buildOrderMessage({
    productName: name,
    price: unitPrice,
    priceNote: unitNote,
    quantity,
    customisation: note.trim() || undefined,
  });

  return (
    <div className="rounded-3xl border border-line bg-card p-6 shadow-[var(--shadow-soft)]">
      {options.length > 0 && (
        <div className="mb-5 border-b border-line pb-5">
          <span className="field-label" id="order-variant-label">
            Choose an option <span aria-hidden="true">*</span>
          </span>
          <div
            role="radiogroup"
            aria-labelledby="order-variant-label"
            className="flex flex-wrap gap-3"
          >
            {options.map((option, index) => (
              <button
                key={option.label}
                type="button"
                role="radio"
                aria-checked={index === variantIndex}
                data-active={index === variantIndex}
                onClick={() => setVariantIndex(index)}
                className="pill font-display text-sm font-semibold"
              >
                {formatVariantPrice(option.price, option.label)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-faint">Quantity</p>
          <div className="mt-2 inline-flex items-center rounded-full border border-line bg-white p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-shell disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span
              className="min-w-10 text-center font-display text-lg font-semibold"
              aria-live="polite"
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              aria-label="Increase quantity"
              className="grid h-10 w-10 place-items-center rounded-full text-ink transition-colors hover:bg-shell"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-faint">
            {unitPrice === null ? "Price" : "Total"}
          </p>
          <p className="font-display text-2xl font-semibold text-rose-deep">
            {unitPrice === null ? "Contact for Price" : formatPrice(unitPrice * quantity)}
          </p>
          {unitNote && unitPrice !== null && (
            <p className="text-xs text-faint">
              {formatProductPrice(unitPrice, unitNote)} × {quantity}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="custom-note" className="field-label">
          Customisation <span className="font-normal text-faint">(optional)</span>
        </label>
        <textarea
          id="custom-note"
          className="field min-h-24 resize-y"
          placeholder="Colours you’d like, a name to add, gift note, delivery date…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={400}
        />
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <Link
          href={orderHref}
          className="btn btn-primary btn-block"
          aria-disabled={!available}
          {...(!available ? { tabIndex: -1, "aria-hidden": true } : {})}
        >
          {available ? "Order Now" : "Currently sold out"}
          {available && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Link>

        {available && (
          <a
            href={whatsappUrl(directMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-block"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Quick order on WhatsApp
          </a>
        )}
      </div>

      <ul className="mt-5 space-y-2 border-t border-line pt-5 text-xs text-muted">
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-sage" aria-hidden="true" />
          {leadTime}
        </li>
        {customisable && (
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-mustard" aria-hidden="true" />
            Colours and details can be personalised
          </li>
        )}
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-rose" aria-hidden="true" />
          Ships across India · order confirmed on WhatsApp
        </li>
      </ul>
    </div>
  );
}
