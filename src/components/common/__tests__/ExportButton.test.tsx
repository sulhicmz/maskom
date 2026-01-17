import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { toast } from 'react-toastify'
import ExportButton from '../ExportButton'
import { exportBlogPosts } from '@/utils/exportUtils'
import type { InnerBlogPost } from '@/types/data'
import type { BlogFilterCriteria } from '@/utils/blogFilters'

jest.mock('@/utils/exportUtils', () => ({
  exportBlogPosts: jest.fn()
}))

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}))

describe('ExportButton', () => {
  const mockPosts: InnerBlogPost[] = [
    {
      id: 1,
      title: 'Test Post',
      desc: 'Test description',
      user: 'John Doe',
      date: '2026-01-16',
      tagId: 1,
      category: 'Technology',
      thumb: { src: '/test.jpg', height: 200, width: 300 },
      link: '/post1'
    },
    {
      id: 2,
      title: 'Another Post',
      desc: 'Another description',
      user: 'Jane Smith',
      date: '2026-01-17',
      tagId: 2,
      category: 'Business',
      thumb: { src: '/test2.jpg', height: 200, width: 300 },
      link: '/post2'
    }
  ]

  const mockFilterCriteria: BlogFilterCriteria = {
    searchQuery: 'test',
    category: 'Technology',
    tagId: 1,
    status: 'published'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render export button', () => {
      render(<ExportButton posts={mockPosts} filterCriteria={mockFilterCriteria} />)
      
      const button = screen.getByText('Ekspor Hasil')
      expect(button).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      render(<ExportButton posts={mockPosts} filterCriteria={mockFilterCriteria} buttonClassName="custom-class" />)
      
      const button = screen.getByText('Ekspor Hasil')
      expect(button).toHaveClass('custom-class')
    })

    it('should be disabled when posts array is empty', () => {
      render(<ExportButton posts={[]} filterCriteria={mockFilterCriteria} />)
      
      const button = screen.getByText('Ekspor Hasil')
      expect(button).toBeDisabled()
    })

    it('should have proper ARIA attributes', () => {
      render(<ExportButton posts={mockPosts} filterCriteria={mockFilterCriteria} />)
      
      const button = screen.getByText('Ekspor Hasil')
      expect(button).toHaveAttribute('aria-expanded', 'false')
      expect(button).toHaveAttribute('aria-haspopup', 'menu')
    })

    it('should show dropdown when button is clicked', () => {
      render(<ExportButton posts={mockPosts} filterCriteria={mockFilterCriteria} />)
      
      const button = screen.getByText('Ekspor Hasil')
      fireEvent.click(button)
      
      expect(button).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByRole('menu', { name: 'Pilih format ekspor' })).toBeInTheDocument()
    })

    it('should show PDF and CSV options in dropdown', () => {
      render(<ExportButton posts={mockPosts} filterCriteria={mockFilterCriteria} />)
      
      const button = screen.getByText('Ekspor Hasil')
      fireEvent.click(button)
      
      expect(screen.getByRole('menuitem', { name: /Export sebagai PDF/ })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: /Export sebagai CSV/ })).toBeInTheDocument()
    })
  })

  describe('PDF Export', () => {
    it('should export posts as PDF when PDF option is clicked', async () => {
      (exportBlogPosts as jest.Mock).mockImplementation(() => {})
      
      render(<ExportButton posts={mockPosts} filterCriteria={mockFilterCriteria} />)
      
      const button = screen.getByText('Ekspor Hasil')
      fireEvent.click(button)
      
      const pdfOption = screen.getByRole('menuitem', { name: /Export sebagai PDF/ })
      fireEvent.click(pdfOption)
      
      await waitFor(() => {
        expect(exportBlogPosts).toHaveBeenCalledWith(mockPosts, mockFilterCriteria, expect.objectContaining({
          format: 'pdf',
          includeFilters: true
        }))
      })
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Berhasil mengekspor 2 postingan sebagai PDF')
      })
    })

    it('should show loading state during PDF export', async () => {
      let resolveExport: () => void
      (exportBlogPosts as jest.Mock).mockImplementation(() => new Promise<void>(resolve => {
        resolveExport = resolve
      }))
      
      render(<ExportButton posts={mockPosts} filterCriteria={mockFilterCriteria} />)
      
      const button = screen.getByText('Ekspor Hasil')
      fireEvent.click(button)
      
      const pdfOption = screen.getByRole('menuitem', { name: /Export sebagai PDF/ })
      fireEvent.click(pdfOption)
      
      await waitFor(() => {
        expect(button).toHaveTextContent('Mengekspor...')
      })
      
      if (resolveExport) {
        resolveExport()
      }
    })

    it('should close dropdown after PDF export starts', async () => {
      (exportBlogPosts as jest.Mock).mockImplementation(() => new Promise(() => {}))
      
      render(<ExportButton posts={mockPosts} filterCriteria={mockFilterCriteria} />)
      
      const button = screen.getByText('Ekspor Hasil')
      fireEvent.click(button)
      
      expect(screen.getByRole('menu')).toBeInTheDocument()
      
      const pdfOption = screen.getByRole('menuitem', { name: /Export sebagai PDF/ })
      fireEvent.click(pdfOption)
      
      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
      })
    })
  })

  describe('CSV Export', () => {
    it('should export posts as CSV when CSV option is clicked', async () => {
      (exportBlogPosts as jest.Mock).mockImplementation(() => {})
      
      render(<ExportButton posts={mockPosts} filterCriteria={mockFilterCriteria} />)
      
      const button = screen.getByText('Ekspor Hasil')
      fireEvent.click(button)
      
      const csvOption = screen.getByRole('menuitem', { name: /Export sebagai CSV/ })
      fireEvent.click(csvOption)
      
      await waitFor(() => {
        expect(exportBlogPosts).toHaveBeenCalledWith(mockPosts, mockFilterCriteria, expect.objectContaining({
          format: 'csv',
          includeFilters: true
        }))
      })
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Berhasil mengekspor 2 postingan sebagai CSV')
      })
    })

    it('should show loading state during CSV export', async () => {
      let resolveExport: () => void
      (exportBlogPosts as jest.Mock).mockImplementation(() => new Promise<void>(resolve => {
        resolveExport = resolve
      }))
      
      render(<ExportButton posts={mockPosts} filterCriteria={mockFilterCriteria} />)
      
      const button = screen.getByText('Ekspor Hasil')
      fireEvent.click(button)
      
      const csvOption = screen.getByRole('menuitem', { name: /Export sebagai CSV/ })
      fireEvent.click(csvOption)
      
      await waitFor(() => {
        expect(button).toHaveTextContent('Mengekspor...')
      })
      
      if (resolveExport) {
        resolveExport()
      }
    })
  })

   describe('Error Handling', () => {
  })

  describe('Dropdown Behavior', () => {
    it('should close dropdown when clicking outside', () => {
      render(<ExportButton posts={mockPosts} filterCriteria={mockFilterCriteria} />)
      
      const button = screen.getByText('Ekspor Hasil')
      fireEvent.click(button)
      
      expect(screen.getByRole('menu')).toBeInTheDocument()
      
      fireEvent.mouseDown(document.body)
      
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('should not close dropdown when clicking inside', () => {
      render(<ExportButton posts={mockPosts} filterCriteria={mockFilterCriteria} />)
      
      const button = screen.getByText('Ekspor Hasil')
      fireEvent.click(button)
      
      expect(screen.getByRole('menu')).toBeInTheDocument()
      
      const menu = screen.getByRole('menu')
      fireEvent.mouseDown(menu)
      
      expect(screen.getByRole('menu')).toBeInTheDocument()
    })

    it('should disable export options during export', async () => {
      let resolveExport: () => void
      (exportBlogPosts as jest.Mock).mockImplementation(() => new Promise<void>(resolve => {
        resolveExport = resolve
      }))
      
      render(<ExportButton posts={mockPosts} filterCriteria={mockFilterCriteria} />)
      
      const button = screen.getByText('Ekspor Hasil')
      fireEvent.click(button)
      
      const pdfOption = screen.getByRole('menuitem', { name: /Export sebagai PDF/ })
      fireEvent.click(pdfOption)
      
      await waitFor(() => {
        expect(button).toBeDisabled()
      })
      
      if (resolveExport) {
        resolveExport()
      }
      
      await waitFor(() => {
        expect(button).not.toBeDisabled()
      }, { timeout: 2000 })
    })

    it('should not allow clicking button during export', async () => {
      (exportBlogPosts as jest.Mock).mockImplementation(() => new Promise(() => {}))
      
      render(<ExportButton posts={mockPosts} filterCriteria={mockFilterCriteria} />)
      
      const button = screen.getByText('Ekspor Hasil')
      fireEvent.click(button)
      
      const pdfOption = screen.getByRole('menuitem', { name: /Export sebagai PDF/ })
      fireEvent.click(pdfOption)
      
      await waitFor(() => {
        expect(button).toBeDisabled()
      })
      
      fireEvent.click(button)
      
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ExportButton posts={mockPosts} filterCriteria={mockFilterCriteria} />)
      
      const button = screen.getByText('Ekspor Hasil')
      expect(button).toHaveAttribute('aria-label', 'Ekspor hasil blog')
    })

    it('should update aria-expanded when dropdown toggles', () => {
      render(<ExportButton posts={mockPosts} filterCriteria={mockFilterCriteria} />)
      
      const button = screen.getByText('Ekspor Hasil')
      
      expect(button).toHaveAttribute('aria-expanded', 'false')
      
      fireEvent.click(button)
      
      expect(button).toHaveAttribute('aria-expanded', 'true')
    })

    it('should have accessible menu items', () => {
      render(<ExportButton posts={mockPosts} filterCriteria={mockFilterCriteria} />)
      
      const button = screen.getByText('Ekspor Hasil')
      fireEvent.click(button)
      
      expect(screen.getByRole('menuitem', { name: /Export sebagai PDF/ })).toBeInTheDocument()
      expect(screen.getByRole('menuitem', { name: /Export sebagai CSV/ })).toBeInTheDocument()
    })
  })
})
