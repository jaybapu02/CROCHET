/** Formats a number as Indian Rupees, e.g. 799 -> "₹799". */
export const formatPrice = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

/** Plain number with Indian grouping, e.g. 1499 -> "1,499". */
export const formatNumber = (value: number): string =>
  new Intl.NumberFormat("en-IN").format(value);

/**
 * Human-readable price for a product, including any unit/size note.
 * 160 + "per tulip" -> "₹160 per tulip" · 499 + "(Big Size)" -> "₹499 (Big Size)"
 * A missing price renders as "Contact for Price" instead of a made-up amount.
 */
export const formatProductPrice = (
  price: number | null | undefined,
  priceNote?: string,
): string => {
  if (price === null || price === undefined) return "Contact for Price";
  const base = formatPrice(price);
  return priceNote ? `${base} ${priceNote}` : base;
};

/**
 * One selectable variant price, e.g. 160 + "Single" -> "₹160 — Single".
 * Used for products sold as Single / Pair.
 */
export const formatVariantPrice = (price: number, label: string): string =>
  `${formatPrice(price)} — ${label}`;
