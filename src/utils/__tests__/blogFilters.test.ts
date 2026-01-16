import { describe, expect, test } from "@jest/globals"
import { filterBlogPosts, type BlogFilterCriteria } from "../blogFilters"
import type { InnerBlogPost } from "@/types/data"
import type { StaticImageData } from "next/image"

interface InnerBlogPostWithStatus extends InnerBlogPost {
  status?: 'draft' | 'scheduled' | 'published'
}

const mockPosts: InnerBlogPost[] = [
  {
    id:1,
    thumb: "/test1.jpg" as unknown as StaticImageData,
    title: "Test Post 1",
    desc: "This is test description 1",
    date: "2024-01-01",
    user: "Author 1",
    tagId: 1,
    categoryId: 1,
  },
  {
    id: 2,
    thumb: "/test2.jpg" as unknown as StaticImageData,
    title: "Test Post 2",
    desc: "This is test description 2",
    date: "2024-01-02",
    user: "Author 2",
    tagId: 2,
    categoryId: 2,
  },
  {
    id: 3,
    thumb: "/test3.jpg" as unknown as StaticImageData,
    title: "Another Title 3",
    desc: "Description with keyword",
    date: "2024-01-03",
    user: "Author 3",
    tagId: 1,
    categoryId: 1,
  },
]

describe("filterBlogPosts", () => {
  test("returns all posts when no filters provided", () => {
    const criteria: BlogFilterCriteria = {}
    const result = filterBlogPosts(mockPosts, criteria)

    expect(result.filteredPosts).toHaveLength(3)
    expect(result.filterCount).toBe(3)
    expect(result.hasFilters).toBe(false)
  })

  test("filters posts by search query in title", () => {
    const criteria: BlogFilterCriteria = { searchQuery: "Test Post" }
    const result = filterBlogPosts(mockPosts, criteria)

    expect(result.filteredPosts).toHaveLength(2)
    expect(result.filteredPosts[0].title).toBe("Test Post 1")
    expect(result.filteredPosts[1].title).toBe("Test Post 2")
    expect(result.filterCount).toBe(2)
    expect(result.hasFilters).toBe(true)
  })

  test("filters posts by search query in description", () => {
    const criteria: BlogFilterCriteria = { searchQuery: "keyword" }
    const result = filterBlogPosts(mockPosts, criteria)

    expect(result.filteredPosts).toHaveLength(1)
    expect(result.filteredPosts[0].id).toBe(3)
    expect(result.filterCount).toBe(1)
    expect(result.hasFilters).toBe(true)
  })

  test("filters posts by categoryId", () => {
     const criteria: BlogFilterCriteria = { categoryId: 1 }
     const result = filterBlogPosts(mockPosts, criteria)
 
     expect(result.filteredPosts).toHaveLength(2)
     expect(result.filteredPosts.every(post => post.categoryId === 1)).toBe(true)
     expect(result.filterCount).toBe(2)
     expect(result.hasFilters).toBe(true)
   })

  test("filters posts by tag ID", () => {
    const criteria: BlogFilterCriteria = { tagId: 1 }
    const result = filterBlogPosts(mockPosts, criteria)

    expect(result.filteredPosts).toHaveLength(2)
    expect(result.filteredPosts.every(post => post.tagId === 1)).toBe(true)
    expect(result.filterCount).toBe(2)
    expect(result.hasFilters).toBe(true)
  })

  test("filters posts by status (published)", () => {
    const postsWithStatus: InnerBlogPostWithStatus[] = [
      ...mockPosts,
      {
        id: 4,
        thumb: "/test4.jpg" as unknown as StaticImageData,
        title: "Draft Post",
        desc: "Draft description",
        date: "2024-01-04",
        user: "Author 4",
        tagId: 1,
        categoryId: 1,
        status: 'draft',
      },
      {
        id: 5,
        thumb: "/test5.jpg" as unknown as StaticImageData,
        title: "Published Post",
        desc: "Published description",
        date: "2024-01-05",
        user: "Author 5",
        tagId: 2,
        categoryId: 2,
        status: 'published',
      },
    ]

    const criteria: BlogFilterCriteria = { status: 'published' }
    const result = filterBlogPosts(postsWithStatus as InnerBlogPost[], criteria)

    expect(result.filteredPosts).toHaveLength(4)
    expect(result.filteredPosts.every((post) => 
      (!('status' in post) || post.status === 'published')
    )).toBe(true)
    expect(result.filterCount).toBe(4)
    expect(result.hasFilters).toBe(true)
  })

  test("filters posts with combined search and categoryId", () => {
     const criteria: BlogFilterCriteria = { searchQuery: "Test", categoryId: 1 }
     const result = filterBlogPosts(mockPosts, criteria)
 
     expect(result.filteredPosts).toHaveLength(1)
     expect(result.filteredPosts[0].id).toBe(1)
     expect(result.filterCount).toBe(1)
     expect(result.hasFilters).toBe(true)
   })

  test("filters posts with combined search and tag", () => {
    const criteria: BlogFilterCriteria = { searchQuery: "Test", tagId: 1 }
    const result = filterBlogPosts(mockPosts, criteria)

    expect(result.filteredPosts).toHaveLength(1)
    expect(result.filteredPosts[0].id).toBe(1)
    expect(result.filterCount).toBe(1)
    expect(result.hasFilters).toBe(true)
  })

  test("filters posts with combined categoryId and tag", () => {
     const criteria: BlogFilterCriteria = { categoryId: 1, tagId: 1 }
     const result = filterBlogPosts(mockPosts, criteria)
 
     expect(result.filteredPosts).toHaveLength(2)
     expect(result.filteredPosts.every(post => 
       post.categoryId === 1 && post.tagId === 1
     )).toBe(true)
     expect(result.filterCount).toBe(2)
     expect(result.hasFilters).toBe(true)
   })

  test("filters posts with all three filters", () => {
     const criteria: BlogFilterCriteria = { 
       searchQuery: "Post", 
       categoryId: 1, 
       tagId: 1 
     }
     const result = filterBlogPosts(mockPosts, criteria)
 
     expect(result.filteredPosts).toHaveLength(1)
     expect(result.filteredPosts[0].id).toBe(1)
     expect(result.filterCount).toBe(1)
     expect(result.hasFilters).toBe(true)
   })

  test("returns empty array when no posts match filters", () => {
     const criteria: BlogFilterCriteria = { 
       searchQuery: "NonExistent", 
       categoryId: 999, 
       tagId: 999 
     }
     const result = filterBlogPosts(mockPosts, criteria)
 
     expect(result.filteredPosts).toHaveLength(0)
     expect(result.filterCount).toBe(0)
     expect(result.hasFilters).toBe(true)
   })

  test("case insensitive search", () => {
    const criteria: BlogFilterCriteria = { searchQuery: "test post 1" }
    const result = filterBlogPosts(mockPosts, criteria)

    expect(result.filteredPosts).toHaveLength(1)
    expect(result.filteredPosts[0].id).toBe(1)
  })

  test("empty search query returns all posts", () => {
    const criteria: BlogFilterCriteria = { searchQuery: '' }
    const result = filterBlogPosts(mockPosts, criteria)

    expect(result.filteredPosts).toHaveLength(3)
    expect(result.filterCount).toBe(3)
    expect(result.hasFilters).toBe(false)
  })

  test("null categoryId returns all posts", () => {
     const criteria: BlogFilterCriteria = { categoryId: null }
     const result = filterBlogPosts(mockPosts, criteria)
 
     expect(result.filteredPosts).toHaveLength(3)
     expect(result.filterCount).toBe(3)
     expect(result.hasFilters).toBe(false)
   })

  test("null tag ID returns all posts", () => {
    const criteria: BlogFilterCriteria = { tagId: null }
    const result = filterBlogPosts(mockPosts, criteria)

    expect(result.filteredPosts).toHaveLength(3)
    expect(result.filterCount).toBe(3)
    expect(result.hasFilters).toBe(false)
  })

  test("partial search matches", () => {
    const criteria: BlogFilterCriteria = { searchQuery: "test" }
    const result = filterBlogPosts(mockPosts, criteria)

    expect(result.filteredPosts).toHaveLength(2)
    expect(result.filterCount).toBe(2)
  })

  test("filters correctly with empty post array", () => {
    const criteria: BlogFilterCriteria = { searchQuery: "test" }
    const result = filterBlogPosts([], criteria)

    expect(result.filteredPosts).toHaveLength(0)
    expect(result.filterCount).toBe(0)
    expect(result.hasFilters).toBe(true)
  })
})
