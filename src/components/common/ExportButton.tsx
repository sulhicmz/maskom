"use client"
import React, { useState, useRef, useEffect } from 'react'
import { exportBlogPosts, type ExportConfig } from '@/utils/exportUtils'
import type { InnerBlogPost } from '@/types/data'
import type { BlogFilterCriteria } from '@/utils/blogFilters'
import { toast } from 'react-toastify'

export interface ExportButtonProps {
  posts: InnerBlogPost[]
  filterCriteria: BlogFilterCriteria
  buttonClassName?: string
}

const ExportButton = React.memo<ExportButtonProps>(({
  posts,
  filterCriteria,
  buttonClassName = ''
}) => {
  const [isExporting, setIsExporting] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const handleExport = async (format: 'pdf' | 'csv') => {
    if (posts.length === 0) {
      toast.warn('Tidak ada postingan untuk diekspor')
      return
    }

    setIsExporting(true)
    setShowDropdown(false)

    try {
      const config: ExportConfig = {
        format,
        includeFilters: true
      }

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          exportBlogPosts(posts, filterCriteria, config)
          resolve()
        }, 100)
      })

      toast.success(`Berhasil mengekspor ${posts.length} postingan sebagai ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Gagal mengekspor postingan')
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="export-wrapper" ref={dropdownRef}>
      <button
        onClick={() => !isExporting && setShowDropdown(!showDropdown)}
        disabled={isExporting || posts.length === 0}
        className={`export-button ${buttonClassName}`}
        aria-expanded={showDropdown}
        aria-haspopup="menu"
        aria-label="Ekspor hasil blog"
      >
        {isExporting ? 'Mengekspor...' : 'Ekspor Hasil'}
        <span className="export-icon">↓</span>
      </button>

      {showDropdown && (
        <div className="export-dropdown" role="menu" aria-label="Pilih format ekspor">
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="export-option"
            role="menuitem"
          >
            <span className="format-icon">📄</span>
            <span>Export sebagai PDF</span>
            <span className="format-description">Format dokumen dengan styling</span>
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="export-option"
            role="menuitem"
          >
            <span className="format-icon">📊</span>
            <span>Export sebagai CSV</span>
            <span className="format-description">Format data untuk analisis</span>
          </button>
        </div>
      )}
    </div>
  )
})

ExportButton.displayName = 'ExportButton'

export default ExportButton
