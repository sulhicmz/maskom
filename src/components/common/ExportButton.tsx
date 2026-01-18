"use client"
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
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
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pdfButtonRef = useRef<HTMLButtonElement>(null)
  const csvButtonRef = useRef<HTMLButtonElement>(null)

  const menuItemsRef = useMemo(() => [
    pdfButtonRef,
    csvButtonRef
  ], [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
        setFocusedIndex(-1)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!showDropdown && (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown')) {
      event.preventDefault()
      setShowDropdown(true)
      setFocusedIndex(0)
      setTimeout(() => menuItemsRef[0]?.current?.focus(), 0)
    } else if (showDropdown) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setShowDropdown(false)
        setFocusedIndex(-1)
        buttonRef.current?.focus()
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        const newIndex = focusedIndex === menuItemsRef.length - 1 ? 0 : focusedIndex + 1
        setFocusedIndex(newIndex)
        setTimeout(() => menuItemsRef[newIndex]?.current?.focus(), 0)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        const newIndex = focusedIndex <= 0 ? menuItemsRef.length - 1 : focusedIndex - 1
        setFocusedIndex(newIndex)
        setTimeout(() => menuItemsRef[newIndex]?.current?.focus(), 0)
      }
    }
  }, [showDropdown, focusedIndex, menuItemsRef])

  const handleExport = async (format: 'pdf' | 'csv') => {
    if (posts.length === 0) {
      toast.warn('Tidak ada postingan untuk diekspor')
      return
    }

    setIsExporting(true)
    setShowDropdown(false)
    setFocusedIndex(-1)

    try {
      const config: ExportConfig = {
        format,
        includeFilters: true
      }

      await exportBlogPosts(posts, filterCriteria, config)

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
        ref={buttonRef}
        onClick={() => !isExporting && setShowDropdown(!showDropdown)}
        onKeyDown={handleKeyDown}
        disabled={isExporting || posts.length === 0}
        className={`export-button ${buttonClassName}`}
        aria-expanded={showDropdown}
        aria-haspopup="menu"
        aria-label="Ekspor hasil blog"
      >
        {isExporting ? 'Mengekspor...' : 'Ekspor Hasil'}
        <span className="export-icon" aria-hidden="true">↓</span>
      </button>

      {showDropdown && (
        <div className="export-dropdown" role="menu" aria-label="Pilih format ekspor">
          <button
            ref={pdfButtonRef}
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="export-option"
            role="menuitem"
            tabIndex={focusedIndex === 0 ? 0 : -1}
          >
            <span className="format-icon" aria-hidden="true">📄</span>
            <span>Export sebagai PDF</span>
            <span className="format-description">Format dokumen dengan styling</span>
          </button>
          <button
            ref={csvButtonRef}
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            className="export-option"
            role="menuitem"
            tabIndex={focusedIndex === 1 ? 0 : -1}
          >
            <span className="format-icon" aria-hidden="true">📊</span>
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
