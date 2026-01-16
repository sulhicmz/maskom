import type { MetadataRoute } from "next"
import inner_blog_data from "@/data/InnerBlogData"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://maskom.co.id"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7
    },
    {
      url: `${SITE_URL}/team`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6
    },
    {
      url: `${SITE_URL}/use-cases`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "never",
      priority: 0.3
    },
    {
      url: `${SITE_URL}/sign-up`,
      lastModified: new Date(),
      changeFrequency: "never",
      priority: 0.3
    }
  ]

  const blogPosts: MetadataRoute.Sitemap = inner_blog_data
    .filter((post) => post.status === "published")
    .map((post) => ({
      url: `${SITE_URL}/blog-details?id=${post.id}`,
      lastModified: new Date(post.publishDate || post.date),
      changeFrequency: "monthly" as const,
      priority: 0.8
    }))

  return [...staticPages, ...blogPosts]
}
