import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { siteUrl } from "@/data/siteConfig";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/products", "/order", "/about", "/reviews", "/contact"].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const productRoutes = products.map((product) => ({
    url: `${siteUrl}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...routes, ...productRoutes];
}
