"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Minus,
  Pencil,
  Plus,
  ShieldCheck,
} from "lucide-react";
import type { Product } from "@/data/products";
import { formatPrice, formatProductPrice, formatVariantPrice } from "@/lib/format";
import { buildOrderMessage, hasWhatsAppNumber, whatsappUrl } from "@/lib/whatsapp";

type FormState = {
  productSlug: string;
  /** Chosen option label for products with variants (Single / Pair). */
  variant: string;
  quantity: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  customisation: string;
  delivery: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const emptyForm: FormState = {
  productSlug: "",
  variant: "",
  quantity: 1,
  name: "",
  phone: "",
  email: "",
  address: "",
  customisation: "",
  delivery: "",
};

export default function OrderForm({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const availableProducts = useMemo(() => products.filter((p) => p.available), [products]);

  const [form, setForm] = useState<FormState>(() => {
    const requestedSlug = searchParams.get("product") ?? "";
    const slug = availableProducts.some((p) => p.slug === requestedSlug) ? requestedSlug : "";
    const qty = Number(searchParams.get("qty"));
    return {
      ...emptyForm,
      productSlug: slug,
      variant: searchParams.get("variant") ?? "",
      quantity: Number.isFinite(qty) && qty > 0 ? Math.min(20, Math.round(qty)) : 1,
      customisation: searchParams.get("note") ?? "",
    };
  });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [lastUrl, setLastUrl] = useState("");

  const selected = products.find((p) => p.slug === form.productSlug);
  const options = selected?.variants ?? [];
  /** The picked option — an unknown label from the URL falls back to the first. */
  const selectedVariant =
    options.find((option) => option.label === form.variant) ?? options[0];
  /** Price and unit note of the chosen option (Single / Pair), else the product. */
  const unitPrice = selectedVariant ? selectedVariant.price : (selected?.price ?? null);
  const unitNote = selectedVariant ? `— ${selectedVariant.label}` : selected?.priceNote;
  const total = unitPrice !== null ? unitPrice * form.quantity : null;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!form.productSlug) next.productSlug = "Please choose a product.";
    if (form.quantity < 1) next.quantity = "Quantity must be at least 1.";
    if (!form.name.trim()) next.name = "Please tell us your name.";
    const digits = form.phone.replace(/\D/g, "");
    if (!digits) next.phone = "A phone number helps us confirm your order.";
    else if (digits.length < 10 || digits.length > 15) next.phone = "Enter a valid phone number.";
    if (!form.address.trim()) next.address = "Please add a delivery address.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "That email doesn’t look right.";
    return next;
  };

  const openWhatsApp = (url: string) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const firstKey = Object.keys(found)[0];
      document.getElementById(`order-${firstKey}`)?.focus();
      return;
    }
    if (!hasWhatsAppNumber()) {
      setErrors({ productSlug: "WhatsApp ordering is temporarily unavailable." });
      return;
    }
    if (!selected) return;

    const message = buildOrderMessage({
      productName: selected.name,
      price: unitPrice,
      priceNote: unitNote,
      quantity: form.quantity,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      customisation: form.customisation.trim(),
      delivery: form.delivery.trim(),
    });

    const url = whatsappUrl(message);
    setLastUrl(url);
    openWhatsApp(url);
    setSent(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (sent && selected) {
    return (
      <div className="flex flex-col gap-6 rounded-3xl border border-line bg-card p-7 shadow-[var(--shadow-soft)] sm:p-9">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-sage/15 text-sage-deep">
          <CheckCircle2 className="h-7 w-7" strokeWidth={1.7} aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-3">
          <h2 className="text-3xl">Your order details are ready</h2>
          <p className="text-sm leading-relaxed text-muted">
            We’ve opened WhatsApp with your message.{" "}
            <strong className="text-ink">Please send the message</strong> to confirm your order —
            nothing is confirmed until we reply on WhatsApp.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-shell/60 p-5 text-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-faint">Order summary</p>
          <ul className="mt-3 space-y-1.5 text-muted">
            <li>
              <span className="text-ink">Product:</span> {selected.name}
            </li>
            {selectedVariant && (
              <li>
                <span className="text-ink">Option:</span>{" "}
                {formatVariantPrice(selectedVariant.price, selectedVariant.label)}
              </li>
            )}
            <li>
              <span className="text-ink">Quantity:</span> {form.quantity}
            </li>
            <li>
              <span className="text-ink">Estimated total:</span>{" "}
              {total === null ? "Contact for Price" : formatPrice(total)}
            </li>
            <li>
              <span className="text-ink">Name:</span> {form.name}
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={lastUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-block"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Open WhatsApp again
          </a>
          <button type="button" className="btn btn-ghost btn-block" onClick={() => setSent(false)}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit my order
          </button>
        </div>

        <p className="text-xs text-faint">
          Changed your mind?{" "}
          <Link href="/products" className="underline decoration-line underline-offset-4 hover:text-rose-deep">
            Continue browsing the collection
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-6 rounded-3xl border border-line bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8"
    >
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl sm:text-3xl">Order details</h2>
        <p className="text-sm text-muted">
          Fill this in and we’ll prepare your WhatsApp message — you stay in control of what gets
          sent.
        </p>
      </div>

      {/* Product + quantity */}
      <div className="grid gap-5 sm:grid-cols-[1.6fr_1fr]">
        <div>
          <label htmlFor="order-productSlug" className="field-label">
            Product <span aria-hidden="true">*</span>
          </label>
          <select
            id="order-productSlug"
            className="field cursor-pointer"
            value={form.productSlug}
            onChange={(e) => {
              update("productSlug", e.target.value);
              update("variant", "");
            }}
            aria-invalid={errors.productSlug ? "true" : undefined}
            aria-describedby={errors.productSlug ? "order-productSlug-error" : undefined}
            required
          >
            <option value="">Choose a product…</option>
            {availableProducts.map((product) => (
              <option key={product.slug} value={product.slug}>
                {product.name} —{" "}
                {product.variants && product.variants.length > 0
                  ? product.variants
                      .map((option) => formatVariantPrice(option.price, option.label))
                      .join(" / ")
                  : formatProductPrice(product.price, product.priceNote)}
              </option>
            ))}
          </select>
          {errors.productSlug && (
            <p className="field-error" id="order-productSlug-error">
              {errors.productSlug}
            </p>
          )}
        </div>

        <div>
          <span className="field-label" id="order-quantity-label">
            Quantity
          </span>
          <div className="inline-flex items-center rounded-xl border border-line bg-white p-1">
            <button
              type="button"
              onClick={() => update("quantity", Math.max(1, form.quantity - 1))}
              aria-label="Decrease quantity"
              className="grid h-10 w-10 place-items-center rounded-lg transition-colors hover:bg-shell"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              id="order-quantity"
              type="number"
              min={1}
              max={20}
              value={form.quantity}
              onChange={(e) => update("quantity", Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
              aria-labelledby="order-quantity-label"
              className="w-12 border-0 bg-transparent py-2 text-center font-display text-lg font-semibold focus:outline-none"
            />
            <button
              type="button"
              onClick={() => update("quantity", Math.min(20, form.quantity + 1))}
              aria-label="Increase quantity"
              className="grid h-10 w-10 place-items-center rounded-lg transition-colors hover:bg-shell"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {options.length > 0 && (
        <div>
          <span className="field-label" id="order-variant-label">
            Option <span aria-hidden="true">*</span>
          </span>
          <div
            role="radiogroup"
            aria-labelledby="order-variant-label"
            className="flex flex-wrap gap-3"
          >
            {options.map((option) => {
              const active = selectedVariant?.label === option.label;
              return (
                <button
                  key={option.label}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-active={active}
                  onClick={() => update("variant", option.label)}
                  className="pill font-display text-sm font-semibold"
                >
                  {formatVariantPrice(option.price, option.label)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selected && (
        <div className="flex items-center justify-between rounded-2xl bg-shell/70 px-5 py-4 text-sm">
          <span className="text-muted">
            {formatProductPrice(unitPrice, unitNote)} × {form.quantity}
          </span>
          <span className="font-display text-lg font-semibold text-rose-deep">
            {total === null ? "Contact for Price" : formatPrice(total)}
          </span>
        </div>
      )}

      {/* Customer */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="order-name" className="field-label">
            Your name <span aria-hidden="true">*</span>
          </label>
          <input
            id="order-name"
            className="field"
            autoComplete="name"
            placeholder="Ananya Sharma"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={errors.name ? "true" : undefined}
            aria-describedby={errors.name ? "order-name-error" : undefined}
            required
          />
          {errors.name && (
            <p className="field-error" id="order-name-error">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="order-phone" className="field-label">
            Phone number <span aria-hidden="true">*</span>
          </label>
          <input
            id="order-phone"
            type="tel"
            inputMode="tel"
            className="field"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            aria-invalid={errors.phone ? "true" : undefined}
            aria-describedby={errors.phone ? "order-phone-error" : undefined}
            required
          />
          {errors.phone && (
            <p className="field-error" id="order-phone-error">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="order-email" className="field-label">
          Email <span className="font-normal text-faint">(optional)</span>
        </label>
        <input
          id="order-email"
          type="email"
          className="field"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          aria-invalid={errors.email ? "true" : undefined}
          aria-describedby={errors.email ? "order-email-error" : undefined}
        />
        {errors.email && (
          <p className="field-error" id="order-email-error">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="order-address" className="field-label">
          Delivery address <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="order-address"
          className="field min-h-24 resize-y"
          autoComplete="street-address"
          placeholder="House / flat, street, landmark, city, PIN code"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          aria-invalid={errors.address ? "true" : undefined}
          aria-describedby={errors.address ? "order-address-error" : undefined}
          required
        />
        {errors.address && (
          <p className="field-error" id="order-address-error">
            {errors.address}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="order-customisation" className="field-label">
          Customisation requirements <span className="font-normal text-faint">(optional)</span>
        </label>
        <textarea
          id="order-customisation"
          className="field min-h-24 resize-y"
          placeholder="Colours, size, name to add, gift note, occasion…"
          value={form.customisation}
          onChange={(e) => update("customisation", e.target.value)}
          maxLength={600}
        />
      </div>

      <div>
        <label htmlFor="order-delivery" className="field-label">
          Preferred delivery information <span className="font-normal text-faint">(optional)</span>
        </label>
        <input
          id="order-delivery"
          className="field"
          placeholder="Needed before 14 Oct, gift wrap, weekend delivery…"
          value={form.delivery}
          onChange={(e) => update("delivery", e.target.value)}
          maxLength={200}
        />
      </div>

      <button type="submit" className="btn btn-primary btn-block">
        Send Order via WhatsApp
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-faint">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        No payment is taken here. Your details are only used to build the WhatsApp message — they
        are never sent to a server.
      </p>
    </form>
  );
}
