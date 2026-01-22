"use client"

import React, { memo } from "react"
import Category from "./Category"
import LatestNews from "./LatestNews"
import Tags from "./Tags"
import BlogSearch from "../blog/BlogSearch"
import BlogCategoryFilter from "../blog/BlogCategoryFilter"

interface BlogSidebarProps {
   selectedCategory?: number | null
   onCategoryChange?: (category: number | null) => void
   selectedTagId?: number | null
   onTagClick?: (tagId: number | null) => void
   searchValue?: string
   onSearchChange?: (value: string) => void
}

const BlogSidebar = ({ 
   selectedCategory = null, 
   onCategoryChange, 
   selectedTagId = null, 
   onTagClick,
   searchValue = "",
   onSearchChange 
}: BlogSidebarProps) => {
   return (
      <div className="col-xl-4">
         <div className="sidebar-widget-area mb-30">
            <BlogSearch value={searchValue} onChange={onSearchChange || (() => {})} />
            <BlogCategoryFilter selectedCategory={selectedCategory} onCategoryChange={onCategoryChange || (() => {})} />
            <Category />
            <LatestNews />
            <Tags selectedTagId={selectedTagId} onTagClick={onTagClick || (() => {})} />
         </div>
      </div>
   )
}

BlogSidebar.displayName = "BlogSidebar"

export default memo(BlogSidebar)
