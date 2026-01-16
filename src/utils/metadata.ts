import type { Metadata } from "next"
import type { SeoProps } from "@/types/seo"
import type { InnerBlogPost } from "@/types/data"

export function generateMetadataFromProps(props: SeoProps): Metadata {
  const ogImageUrl = typeof props.ogImage === "string" ? props.ogImage : props.ogImage?.src
  
  const metadata: Metadata = {
    title: props.title,
    description: props.description,
    keywords: props.keywords,
    openGraph: {
      title: props.title,
      description: props.description,
      type: props.ogType as "website" | "article",
      images: ogImageUrl ? [{ url: ogImageUrl }] : [],
      url: props.canonicalUrl
    },
    twitter: {
      card: props.twitterCard,
      title: props.title,
      description: props.description,
      images: ogImageUrl ? [ogImageUrl] : []
    },
    robots: {
      index: !props.noIndex,
      follow: !props.noIndex
    }
  }
  
  if (props.canonicalUrl) {
    metadata.alternates = {
      canonical: props.canonicalUrl
    }
  }
  
  if (props.additionalMetaTags) {
    metadata.other = metadata.other || {}
    props.additionalMetaTags.forEach((tag) => {
      const key = tag.name || tag.property
      if (key) {
        metadata.other![key] = tag.content
      }
    })
  }
  
  return metadata
}

export function generateBlogPostMetadata(
  post: InnerBlogPost,
  siteUrl: string = "https://maskom.co.id"
): Metadata {
  const canonicalUrl = `${siteUrl}/blog-details?id=${post.id}`
  const ogImageUrl = post.thumb.src || post.thumb.toString()
  
  return {
    title: `${post.title} | Maskom`,
    description: post.desc,
    keywords: post.category || "Maskom, blog, artikel",
    openGraph: {
      title: post.title,
      description: post.desc,
      type: "article",
      images: [{ url: ogImageUrl }],
      url: canonicalUrl
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.desc,
      images: [ogImageUrl]
    },
    alternates: {
      canonical: canonicalUrl
    },
    robots: {
      index: post.status !== "draft",
      follow: post.status !== "draft"
    }
  }
}
