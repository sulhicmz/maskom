import type { InnerBlogPost } from "@/types/data"

export interface BlogFilterCriteria {
  searchQuery?: string
  category?: string | null
  tagId?: number | null
  status?: 'draft' | 'scheduled' | 'published'
}

export interface BlogFilterResult {
  filteredPosts: InnerBlogPost[]
  filterCount: number
  hasFilters: boolean
}

export function filterBlogPosts(
  posts: InnerBlogPost[],
  criteria: BlogFilterCriteria
): BlogFilterResult {
  const { searchQuery = '', category = null, tagId = null, status } = criteria

  const hasFilters = Boolean(searchQuery || category || tagId || status)

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.desc.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = !category || post.category === category
    const matchesTag = !tagId || post.tagId === tagId

    const matchesStatus = !status || 
      (status === 'published' && (!('status' in post) || post.status === 'published')) ||
      ('status' in post && post.status === status)

    return matchesSearch && matchesCategory && matchesTag && matchesStatus
  })

  return {
    filteredPosts,
    filterCount: filteredPosts.length,
    hasFilters
  }
}
