import { generateBlogPostSchema, generateWebsiteSchema } from "@/utils/seo"
import { type InnerBlogPost } from "@/types/data"
import { type StaticImageData } from "next/image"

describe("SEO Schema Generator", () => {
  const mockPost: InnerBlogPost = {
    id: 1,
    thumb: { src: "/blog/test.jpg" } as StaticImageData,
    title: "Test Blog Post",
    desc: "Test description for blog post",
    date: "2024-01-15",
    user: "Test Author",
    tagId: 1,
    category: "Test Category",
    status: "published"
  }

  describe("generateBlogPostSchema", () => {
    it("generates valid Article schema", () => {
      const canonicalUrl = "https://maskom.co.id/blog-details?id=1"
      const schema = generateBlogPostSchema(mockPost, canonicalUrl)
      
      expect(schema).toEqual({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Test Blog Post",
        description: "Test description for blog post",
        image: ["/blog/test.jpg"],
        author: "Test Author",
        datePublished: "2024-01-15",
        dateModified: "2024-01-15",
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalUrl
        },
        publisher: {
          "@type": "Organization",
          name: "Maskom",
          logo: {
            "@type": "ImageObject",
            url: "https://maskom.co.id/favicon.png"
          }
        }
      })
    })

    it("uses publishDate when available", () => {
      const postWithPublishDate = {
        ...mockPost,
        publishDate: "2024-01-20"
      }
      const schema = generateBlogPostSchema(postWithPublishDate, "https://maskom.co.id/blog-details?id=1")
      
      expect(schema.dateModified).toBe("2024-01-20")
    })

    it("accepts custom site URL", () => {
      const customUrl = "https://custom.example.com"
      const schema = generateBlogPostSchema(mockPost, "https://maskom.co.id/blog-details?id=1", customUrl)
      
      expect(schema.publisher.logo.url).toBe("https://custom.example.com/favicon.png")
    })
  })

  describe("generateWebsiteSchema", () => {
    it("generates valid Organization schema", () => {
      const schema = generateWebsiteSchema("https://maskom.co.id")
      
      expect(schema).toEqual({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Maskom",
        url: "https://maskom.co.id",
        logo: "https://maskom.co.id/favicon.png",
        description: "Maskom menyediakan layanan konektivitas, managed service, dan solusi infrastruktur digital untuk bisnis di seluruh Indonesia.",
        sameAs: []
      })
    })

    it("accepts custom site URL", () => {
      const customUrl = "https://custom.example.com"
      const schema = generateWebsiteSchema(customUrl)
      
      expect(schema.url).toBe(customUrl)
      expect(schema.logo).toBe("https://custom.example.com/favicon.png")
    })
  })
})
