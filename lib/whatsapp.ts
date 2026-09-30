import { siteConfig } from "@/data/siteConfig";
import { formatPrice, formatProductPrice } from "@/lib/format";

/**
 * Single source of truth for the WhatsApp number.
 * The number comes from data/siteConfig.ts (which reads
 * NEXT_PUBLIC_WHATSAPP_NUMBER). It is never duplicated in components.
 */
export const whatsappNumber: string = siteConfig.whatsappNumber;

export const hasWhatsAppNumber = (): boolean => Boolean(whatsappNumber);

/** Builds a wa.me deep link with a pre-filled, URL-encoded message. */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${whatsappNumber}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export type ProductOrderMessage = {
  productName: string;
  price: number | null;
  /** Unit/size note shown with the price, e.g. "per tulip", "(Big Size)". */
  priceNote?: string;
  quantity: number;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  customisation?: string;
  delivery?: string;
};

/** Pre-filled order message for the WhatsApp checkout flow. */
export function buildOrderMessage(order: ProductOrderMessage): string {
  const lines: string[] = [
    "Hello! I would like to place an order.",
    "",
    `Product: ${order.productName}`,
    `Quantity: ${order.quantity}`,
  ];

  if (order.price === null) {
    lines.push("Price: Contact for Price — please confirm on WhatsApp");
  } else {
    const total = order.price * order.quantity;
    const label = formatProductPrice(order.price, order.priceNote);
    const note = order.priceNote ?? "";
    // Unit notes ("per pair") and size notes ("— Medium Size") already read
    // naturally after the price, so they skip the trailing " each".
    const perUnit = /\bper\b/i.test(note) || note.startsWith("—") ? "" : " each";
    lines.push(`Price: ${label}${perUnit} — ${formatPrice(total)} total`);
  }
  lines.push("");

  if (order.name || order.phone || order.address || order.email) {
    lines.push(`Name: ${order.name ?? ""}`);
    lines.push(`Phone: ${order.phone ?? ""}`);
    if (order.email) lines.push(`Email: ${order.email}`);
    lines.push(`Address: ${order.address ?? ""}`);
    lines.push("");
  }

  lines.push(`Additional Requirements: ${order.customisation || "None"}`);
  if (order.delivery) {
    lines.push(`Delivery Notes: ${order.delivery}`);
  }
  lines.push("");
  lines.push("Please confirm availability and delivery time. Thank you!");

  return lines.join("\n");
}
