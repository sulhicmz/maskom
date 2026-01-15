"use client"
import React from "react"
import categories from "@/data/BlogCategoryData"

interface BlogCategoryFilterProps {
   selectedCategory: string
   onCategoryChange: (category: string) => void
}

const BlogCategoryFilter: React.FC<BlogCategoryFilterProps> = ({
   selectedCategory,
   onCategoryChange
}) => {
   const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onCategoryChange(e.target.value)
   }

   const handleClearFilter = () => {
      onCategoryChange("")
   }

   return (
      <div className="sidebar-widget category-widget">
         <h3 className="widget-title">Kategori</h3>
         <div className="category-form">
            <select
               value={selectedCategory}
               onChange={handleCategoryChange}
               aria-label="Filter kategori artikel"
            >
               <option value="">Semua Kategori</option>
               {categories.map((category) => (
                  <option key={category} value={category}>
                     {category}
                  </option>
               ))}
            </select>
            {selectedCategory && (
               <button
                  type="button"
                  onClick={handleClearFilter}
                  className="category-clear"
                  aria-label="Hapus filter kategori"
               >
                  Reset
               </button>
            )}
         </div>
      </div>
   )
}

BlogCategoryFilter.displayName = "BlogCategoryFilter"

export default BlogCategoryFilter
