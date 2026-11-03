import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://julianv.dev";
  return ["", "/vault", "/work", "/lab", "/about", "/contact", ...projects.map(({ id }) => `/work/${id}`)].map((path) => ({ url: `${base}${path}`, lastModified: new Date("2026-11-02"), changeFrequency: "monthly", priority: path === "" ? 1 : .7 }));
}
