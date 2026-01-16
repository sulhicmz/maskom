import { generateBlogPostMetadata, generateMetadataFromProps } from "@/utils/metadata"
import { type InnerBlogPost } from "@/types/data"
import { type StaticImageData } from "next/image"

describe("Metadata Generator", () => {
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

  describe("generateBlogPostMetadata", () => {
    it("generates metadata for published post", () => {
      const metadata = generateBlogPostMetadata(mockPost)
      
      expect(metadata.title).toBe("Test Blog Post | Maskom")
      expect(metadata.description).toBe("Test description for blog post")
      expect(metadata.keywords).toBe("Test Category")
      expect(metadata.openGraph?.title).toBe("Test Blog Post")
      expect(metadata.openGraph?.type).toBe("article")
      expect(metadata.openGraph?.images).toHaveLength(1)
      expect(metadata.twitter?.card).toBe("summary_large_image")
      expect(metadata.twitter?.title).toBe("Test Blog Post")
      expect(metadata.alternates?.canonical).toContain("blog-details?id=1")
      expect(metadata.robots?.index).toBe(true)
      expect(metadata.robots?.follow).toBe(true)
    })

    it("generates metadata for draft post with noindex", () => {
      const draftPost = { ...mockPost, status: "draft" as const }
      const metadata = generateBlogPostMetadata(draftPost)
      
      expect(metadata.robots?.index).toBe(false)
      expect(metadata.robots?.follow).toBe(false)
    })

    it("uses default keywords when category is not provided", () => {
      const postWithoutCategory = { ...mockPost, category: undefined }
      const metadata = generateBlogPostMetadata(postWithoutCategory)
      
      expect(metadata.keywords).toBe("Maskom, blog, artikel")
    })

    it("accepts custom site URL", () => {
      const customUrl = "https://custom.example.com"
      const metadata = generateBlogPostMetadata(mockPost, customUrl)
      
      expect(metadata.alternates?.canonical).toBe("https://custom.example.com/blog-details?id=1")
      expect(metadata.openGraph?.url).toBe("https://custom.example.com/blog-details?id=1")
    })
  })

  describe("generateMetadataFromProps", () => {
    it("generates basic metadata with required props", () => {
      const props = {
        title: "Test Title",
        description: "Test description"
      }
      const metadata = generateMetadataFromProps(props)
      
      expect(metadata.title).toBe("Test Title")
      expect(metadata.description).toBe("Test description")
      expect(metadata.robots?.index).toBe(true)
      expect(metadata.robots?.follow).toBe(true)
    })

    it("generates Open Graph metadata", () => {
      const props = {
        title: "Test Title",
        description: "Test description",
        ogImage: "/og-image.jpg",
        ogType: "website"
      }
      const metadata = generateMetadataFromProps(props)
      
      expect(metadata.openGraph?.title).toBe("Test Title")
      expect(metadata.openGraph?.description).toBe("Test description")
      expect(metadata.openGraph?.type).toBe("website")
      expect(metadata.openGraph?.images).toHaveLength(1)
      expect(metadata.openGraph?.images[0].url).toBe("/og-image.jpg")
    })

    it("generates Twitter Card metadata", () => {
      const props = {
        title: "Test Title",
        description: "Test description",
        ogImage: "/og-image.jpg",
        twitterCard: "summary" as const
      }
      const metadata = generateMetadataFromProps(props)
      
      expect(metadata.twitter?.card).toBe("summary")
      expect(metadata.twitter?.title).toBe("Test Title")
      expect(metadata.twitter?.description).toBe("Test description")
      expect(metadata.twitter?.images).toHaveLength(1)
      expect(metadata.twitter?.images[0]).toBe("/og-image.jpg")
    })

    it("includes keywords when provided", () => {
      const props = {
        title: "Test Title",
        description: "Test description",
        keywords: "keyword1, keyword2, keyword3"
      }
      const metadata = generateMetadataFromProps(props)
      
      expect(metadata.keywords).toBe("keyword1, keyword2, keyword3")
    })

    it("sets canonical URL when provided", () => {
      const props = {
        title: "Test Title",
        description: "Test description",
        canonicalUrl: "https://example.com/page"
      }
      const metadata = generateMetadataFromProps(props)
      
      expect(metadata.alternates?.canonical).toBe("https://example.com/page")
    })

    it("sets noindex when specified", () => {
      const props = {
        title: "Test Title",
        description: "Test description",
        noIndex: true
      }
      const metadata = generateMetadataFromProps(props)
      
      expect(metadata.robots?.index).toBe(false)
      expect(metadata.robots?.follow).toBe(false)
    })

    it("includes additional meta tags", () => {
      const props = {
        title: "Test Title",
        description: "Test description",
        additionalMetaTags: [
          { name: "author", content: "Test Author" },
          { property: "article:published_time", content: "2024-01-15" }
        ]
      }
      const metadata = generateMetadataFromProps(props)
      
      expect(metadata.other).toBeDefined()
      expect(metadata.other?.author).toBe("Test Author")
      expect(metadata.other?.["article:published_time"]).toBe("2024-01-15")
    })
  })
})
