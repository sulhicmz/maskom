"use client"
import React from "react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import categories from "@/data/BlogCategoryData"
import Button from "@/components/ui/Button"

interface BlogCategoryFilterProps {
   selectedCategory: number | null
   onCategoryChange: (categoryId: number | null) => void
}

const BlogCategoryFilter: React.FC<BlogCategoryFilterProps> = React.memo(({
  selectedCategory,
  onCategoryChange,
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleCategoryChange = (categoryId: number | null) => {
     const params = new URLSearchParams(searchParams.toString())

     if (categoryId) {
       params.set("category", categoryId.toString())
     } else {
       params.delete("category")
     }

     const queryString = params.toString()
     const url = queryString ? `${pathname}?${queryString}` : pathname
     router.push(url)
     onCategoryChange(categoryId)
   }

  return (
    <div className="sidebar-widget category-widget">
      <h3 className="widget-title">Kategori</h3>
      <div className="category-filter">
        <select
          value={selectedCategory?.toString() || ""}
          onChange={(e) => handleCategoryChange(e.target.value ? parseInt(e.target.value, 10) : null)}
          aria-label="Filter kategori artikel"
          className="category-select"
        >
          <option value="">Semua Kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id.toString()}>
              {category.name}
            </option>
          ))}
        </select>
        {selectedCategory && (
          <Button
            variant="text"
            onClick={() => handleCategoryChange(null)}
            className="clear-filter-btn"
          >
            Hapus Filter
          </Button>
        )}
      </div>
    </div>
  )
})

BlogCategoryFilter.displayName = "BlogCategoryFilter"

export default BlogCategoryFilter
