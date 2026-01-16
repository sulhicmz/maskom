import type { MetadataRoute } from "next"

const SITE_URL = "https://maskom.co.id"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/api"]
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`
  }
}
