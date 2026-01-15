import { filterBlogPosts, type BlogFilterCriteria } from "@/utils/blogFilters";
import type { InnerBlogPost } from "@/types/data";
import type { StaticImageData } from "next/image";

describe("filterBlogPosts with status filtering", () => {
  const mockPosts: InnerBlogPost[] = [
    {
      id: 1,
      thumb: {} as StaticImageData,
      title: "Published Post 1",
      desc: "Description 1",
      date: "2024-01-15",
      user: "User 1",
      tagId: 1,
      category: "Category 1",
      status: "published",
    },
    {
      id: 2,
      thumb: {} as StaticImageData,
      title: "Draft Post 1",
      desc: "Description 2",
      date: "2024-01-16",
      user: "User 2",
      tagId: 2,
      category: "Category 1",
      status: "draft",
    },
    {
      id: 3,
      thumb: {} as StaticImageData,
      title: "Published Post 2",
      desc: "Description 3",
      date: "2024-01-17",
      user: "User 1",
      tagId: 1,
      category: "Category 2",
      status: "published",
    },
    {
      id: 4,
      thumb: {} as StaticImageData,
      title: "Scheduled Post 1",
      desc: "Description 4",
      date: "2024-01-18",
      user: "User 3",
      tagId: 3,
      category: "Category 2",
      status: "scheduled",
      publishDate: "2024-02-01",
    },
    {
      id: 5,
      thumb: {} as StaticImageData,
      title: "Post without status field",
      desc: "Description 5",
      date: "2024-01-19",
      user: "User 4",
      tagId: 4,
      category: "Category 3",
    },
  ];

  it("should return only published posts when status is 'published'", () => {
    const criteria: BlogFilterCriteria = { status: "published" };
    const result = filterBlogPosts(mockPosts, criteria);

    expect(result.filteredPosts).toHaveLength(3);
    expect(
      result.filteredPosts.every(
        (post) => post.status === "published" || !("status" in post)
      )
    ).toBe(true);
    expect(result.hasFilters).toBe(true);
  });

  it("should return only draft posts when status is 'draft'", () => {
    const criteria: BlogFilterCriteria = { status: "draft" };
    const result = filterBlogPosts(mockPosts, criteria);

    expect(result.filteredPosts).toHaveLength(1);
    expect(result.filteredPosts[0].id).toBe(2);
    expect(result.filteredPosts[0].status).toBe("draft");
    expect(result.hasFilters).toBe(true);
  });

  it("should return only scheduled posts when status is 'scheduled'", () => {
    const criteria: BlogFilterCriteria = { status: "scheduled" };
    const result = filterBlogPosts(mockPosts, criteria);

    expect(result.filteredPosts).toHaveLength(1);
    expect(result.filteredPosts[0].id).toBe(4);
    expect(result.filteredPosts[0].status).toBe("scheduled");
    expect(result.hasFilters).toBe(true);
  });

  it("should treat posts without status field as published", () => {
    const criteria: BlogFilterCriteria = { status: "published" };
    const result = filterBlogPosts(mockPosts, criteria);

    expect(result.filteredPosts).toHaveLength(3);
    expect(result.filteredPosts.find((post) => post.id === 5)).toBeDefined();
    expect(result.hasFilters).toBe(true);
  });

  it("should return all posts when status filter is not provided", () => {
    const criteria: BlogFilterCriteria = {};
    const result = filterBlogPosts(mockPosts, criteria);

    expect(result.filteredPosts).toHaveLength(5);
    expect(result.hasFilters).toBe(false);
  });

  it("should combine status filter with other filters", () => {
    const criteria: BlogFilterCriteria = {
      status: "published",
      tagId: 1,
    };
    const result = filterBlogPosts(mockPosts, criteria);

    expect(result.filteredPosts).toHaveLength(2);
    expect(
      result.filteredPosts.every(
        (post) =>
          (post.status === "published" || !("status" in post)) &&
          post.tagId === 1
      )
    ).toBe(true);
    expect(result.hasFilters).toBe(true);
  });

  it("should combine status filter with search query", () => {
    const criteria: BlogFilterCriteria = {
      status: "published",
      searchQuery: "Post",
    };
    const result = filterBlogPosts(mockPosts, criteria);

    expect(result.filteredPosts).toHaveLength(3);
    expect(
      result.filteredPosts.every(
        (post) =>
          (post.status === "published" || !("status" in post)) &&
          post.title.toLowerCase().includes("post")
      )
    ).toBe(true);
    expect(result.hasFilters).toBe(true);
  });

  it("should combine status filter with category filter", () => {
    const criteria: BlogFilterCriteria = {
      status: "published",
      category: "Category 1",
    };
    const result = filterBlogPosts(mockPosts, criteria);

    expect(result.filteredPosts).toHaveLength(1);
    expect(result.filteredPosts[0].id).toBe(1);
    expect(result.filteredPosts[0].status).toBe("published");
    expect(result.filteredPosts[0].category).toBe("Category 1");
    expect(result.hasFilters).toBe(true);
  });

  it("should return empty array when no posts match status", () => {
    const criteria: BlogFilterCriteria = { status: "scheduled" };
    const result = filterBlogPosts(mockPosts.slice(0, 2), criteria);

    expect(result.filteredPosts).toHaveLength(0);
    expect(result.filterCount).toBe(0);
    expect(result.hasFilters).toBe(true);
  });

  it("should correctly count filtered posts", () => {
    const criteria: BlogFilterCriteria = { status: "published" };
    const result = filterBlogPosts(mockPosts, criteria);

    expect(result.filterCount).toBe(3);
  });

  it("should handle empty post array", () => {
    const criteria: BlogFilterCriteria = { status: "published" };
    const result = filterBlogPosts([], criteria);

    expect(result.filteredPosts).toHaveLength(0);
    expect(result.filterCount).toBe(0);
    expect(result.hasFilters).toBe(true);
  });

  it("should combine all filters together", () => {
    const criteria: BlogFilterCriteria = {
      status: "published",
      tagId: 1,
      category: "Category 1",
      searchQuery: "Published",
    };
    const result = filterBlogPosts(mockPosts, criteria);

    expect(result.filteredPosts).toHaveLength(1);
    expect(result.filteredPosts[0].id).toBe(1);
    expect(result.hasFilters).toBe(true);
  });
});
