import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://samary.catpad.shop";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const activeProducts = await db.select({
    slug: products.slug,
    updatedAt: products.updatedAt,
  }).from(products).where(eq(products.isActive, true));

  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: siteUrl + "/help", changeFrequency: "monthly", priority: 0.6 },
    { url: siteUrl + "/policies", changeFrequency: "monthly", priority: 0.4 },
    { url: siteUrl + "/orders/track", changeFrequency: "monthly", priority: 0.4 },
    ...activeProducts.map((product) => ({
      url: siteUrl + "/products/" + product.slug,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
