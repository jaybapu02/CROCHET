import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { siteConfig, siteUrl } from "@/data/siteConfig";

const fraunces = localFont({
  src: "./fonts/Fraunces.woff2",
  weight: "400 700",
  variable: "--font-fraunces",
  display: "swap",
});

const inter = localFont({
  src: "./fonts/Inter.woff2",
  weight: "300 700",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name} | Handmade Crochet Studio`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "handmade crochet",
    "crochet flowers",
    "crochet bags",
    "amigurumi",
    "crochet gifts India",
    "custom crochet orders",
    "handmade gifts",
  ],
  authors: [{ name: siteConfig.name }],
  icons: {
    icon: [{ url: "/images/logo/loveloop.jpeg", type: "image/jpeg" }],
    apple: "/images/logo/loveloop.jpeg",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Handmade Crochet Studio`,
    description: siteConfig.description,
    url: siteUrl,
    images: [
      {
        url: "/images/hero/hero-main.webp",
        width: 1600,
        height: 1800,
        alt: `${siteConfig.name} — handmade crochet bouquet`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Handmade Crochet Studio`,
    description: siteConfig.description,
    images: ["/images/hero/hero-main.webp"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#fbf7f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the inline script below adds the `js` class to
    // <html> before React hydrates — React must not treat that as a mismatch.
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js');`,
          }}
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-cream"
        >
          Skip to content
        </a>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
