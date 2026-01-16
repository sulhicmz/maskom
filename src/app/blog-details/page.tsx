import { type InnerBlogPost } from "@/types/data"
import { type StaticImageData } from "next/image"
import { generateBlogPostMetadata } from "@/utils/metadata"
import { generateBlogPostSchema } from "@/utils/seo"
import JsonLd from "@/components/common/JsonLd"

export const runtime = 'nodejs';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://maskom.co.id"

interface BlogDetailsPageProps {
  searchParams: Promise<{ id?: string }>
}

async function getBlogPost(id: string): Promise<InnerBlogPost | null> {
  const inner_blog_data = await import("@/data/InnerBlogData")
  const post = inner_blog_data.default.find((p: InnerBlogPost) => p.id === parseInt(id))
  return post || null
}

export async function generateMetadata({ searchParams }: BlogDetailsPageProps) {
  const params = await searchParams
  const postId = params.id || "1"
  const post = await getBlogPost(postId)
  
  if (!post) {
    return generateBlogPostMetadata({
      id: 0,
      thumb: { src: "/assets/images/blog/blog-3.jpg" } as StaticImageData,
      title: "Artikel Tidak Ditemukan",
      desc: "Artikel yang Anda cari tidak tersedia.",
      date: new Date().toISOString().split("T")[0],
      user: "Maskom",
      tagId: 0
    }, SITE_URL)
  }

  return generateBlogPostMetadata(post, SITE_URL)
}

const BlogDetailsPage = async ({ searchParams }: BlogDetailsPageProps) => {
  const params = await searchParams
  const postId = params.id || "1"
  const post = await getBlogPost(postId)
  const BlogDetails = (await import("@/components/blogs/blog-details")).default
  const canonicalUrl = `${SITE_URL}/blog-details?id=${postId}`

  const schema = post ? generateBlogPostSchema(post, canonicalUrl, SITE_URL) : null
  
  return (
    <>
      {schema && <JsonLd data={schema} />}
      <BlogDetails />
    </>
  )
}

export default BlogDetailsPage
