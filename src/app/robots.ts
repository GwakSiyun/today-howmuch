import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // /dev/ 는 개발용 미리보기(배포에선 404)라 수집 제외
    rules: { userAgent: "*", allow: "/", disallow: "/dev/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
