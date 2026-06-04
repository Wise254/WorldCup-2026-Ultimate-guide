import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fifa-worldcup-2026.vercel.app";

  const staticRoutes = [
    { path: "/", priority: 1.0, changefreq: "daily" as const },
    { path: "/schedule", priority: 0.9, changefreq: "daily" as const },
    { path: "/teams", priority: 0.9, changefreq: "weekly" as const },
    { path: "/bracket", priority: 0.9, changefreq: "daily" as const },
    { path: "/venues", priority: 0.8, changefreq: "weekly" as const },
    { path: "/predictions", priority: 0.7, changefreq: "weekly" as const },
    { path: "/facts", priority: 0.6, changefreq: "monthly" as const },
  ];

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changefreq,
    priority: route.priority,
  }));
}