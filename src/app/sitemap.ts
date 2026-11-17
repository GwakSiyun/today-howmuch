import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** 페이지가 하나뿐 — 유입 경로(?from=)는 넣지 않는다 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE_URL, changeFrequency: "weekly", priority: 1 }];
}
