import type { BlogPostSchema } from "@/types/seo"
import type { InnerBlogPost } from "@/types/data"

export function generateBlogPostSchema(
  post: InnerBlogPost,
  canonicalUrl: string,
  siteUrl: string = "https://maskom.co.id"
): BlogPostSchema {
  const imageUrl = post.thumb.src || post.thumb.toString()
  
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.desc,
    image: [imageUrl],
    author: post.user,
    datePublished: post.date,
    dateModified: post.publishDate || post.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    publisher: {
      "@type": "Organization",
      name: "Maskom",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/favicon.png`
      }
    }
  }
}

export function generateWebsiteSchema(
  siteUrl: string = "https://maskom.co.id"
): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Maskom",
    url: siteUrl,
    logo: `${siteUrl}/favicon.png`,
    description: "Maskom menyediakan layanan konektivitas, managed service, dan solusi infrastruktur digital untuk bisnis di seluruh Indonesia.",
    sameAs: []
  }
}
