import type { StaticImageData } from "next/image"

export interface SeoProps {
  title: string
  description: string
  keywords?: string
  ogImage?: string | StaticImageData
  ogType?: string
  twitterCard?: "summary" | "summary_large_image" | "app" | "player"
  canonicalUrl?: string
  noIndex?: boolean
  structuredData?: object
  additionalMetaTags?: Array<{
    name?: string
    property?: string
    content: string
  }>
}

export interface BlogPostSchema {
  "@context": string
  "@type": string
  headline: string
  description: string
  image: string[]
  author: string
  datePublished: string
  dateModified?: string
  mainEntityOfPage?: {
    "@type": string
    "@id": string
  }
  publisher?: {
    "@type": string
    name: string
    logo?: {
      "@type": string
      url: string
    }
  }
}

export interface SitemapEntry {
  url: string
  lastModified?: Date | string
  changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority?: number
}
