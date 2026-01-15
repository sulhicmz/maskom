"use client"
import React, { useState, useEffect, useMemo } from "react"

interface BlogSearchProps {
   searchQuery: string
   onSearchChange: (query: string) => void
}

const BlogSearch: React.FC<BlogSearchProps> = ({ searchQuery, onSearchChange }) => {
   const [localQuery, setLocalQuery] = useState(searchQuery)

   useEffect(() => {
      setLocalQuery(searchQuery)
   }, [searchQuery])

   const debouncedSearch = useMemo(
      () => {
         let timeoutId: NodeJS.Timeout
         return (value: string) => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
               onSearchChange(value)
            }, 300)
         }
      },
      [onSearchChange]
   )

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setLocalQuery(value)
      debouncedSearch(value)
   }

   const handleClearSearch = () => {
      setLocalQuery("")
      onSearchChange("")
   }

   return (
      <div className="sidebar-widget search-widget">
         <h3 className="widget-title">Cari Artikel</h3>
         <div className="search-form">
            <input
               type="text"
               placeholder="Cari artikel..."
               value={localQuery}
               onChange={handleInputChange}
               aria-label="Cari artikel"
            />
            {localQuery && (
               <button
                  type="button"
                  onClick={handleClearSearch}
                  className="search-clear"
                  aria-label="Hapus pencarian"
               >
                  ✕
               </button>
            )}
         </div>
      </div>
   )
}

BlogSearch.displayName = "BlogSearch"

export default BlogSearch
