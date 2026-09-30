import Link from "next/link";
import { MessageCircle } from "lucide-react";

/**
 * Persistent floating order button (mobile + desktop).
 * It opens the order form (/order) instead of jumping straight into a chat —
 * the form then composes the message and hands it over to WhatsApp.
 */
export default function FloatingWhatsApp() {
  return (
    <Link
      href="/order"
      aria-label="Order on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full border border-white/40 bg-[#1F7A5A] py-3.5 pl-4 pr-4 text-white shadow-[0_18px_40px_-18px_rgba(31,122,90,0.9)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#186348] sm:bottom-8 sm:right-8 sm:pr-5"
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center">
        <MessageCircle className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className="hidden text-sm font-medium sm:block">Order on WhatsApp</span>
      <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[#7BD8B0] opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}
