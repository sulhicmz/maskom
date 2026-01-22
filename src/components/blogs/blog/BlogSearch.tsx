"use client"
import React, { useState, useEffect, memo } from "react"
import Input from "@/components/ui/Input"

interface BlogSearchProps {
  value: string
  onChange: (value: string) => void
}

const BlogSearch: React.FC<BlogSearchProps> = ({ value, onChange }) => {
  const [searchQuery, setSearchQuery] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, onChange])

  useEffect(() => {
    setSearchQuery(value)
  }, [value])

  const handleClear = () => {
    setSearchQuery("")
    onChange("")
  }

  return (
    <div className="sidebar-widget search-widget">
      <h3 className="widget-title">Cari Artikel</h3>
      <div className="search-box">
        <Input
          type="text"
          placeholder="Cari judul atau deskripsi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          ariaLabel="Cari artikel"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="search-clear"
            aria-label="Hapus pencarian"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

BlogSearch.displayName = "BlogSearch"

export default memo(BlogSearch)
