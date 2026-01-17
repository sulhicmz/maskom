import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import StatusBadge from '../StatusBadge'

describe('StatusBadge', () => {
  describe('Rendering', () => {
    it('renders with success type', () => {
      render(<StatusBadge type="success">Success</StatusBadge>)
      const badge = screen.getByText('Success')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('text-success')
    })

    it('renders with danger type', () => {
      render(<StatusBadge type="danger">Error</StatusBadge>)
      const badge = screen.getByText('Error')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('text-danger')
    })

    it('renders with warning type', () => {
      render(<StatusBadge type="warning">Warning</StatusBadge>)
      const badge = screen.getByText('Warning')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('text-warning')
    })

    it('renders with info type', () => {
      render(<StatusBadge type="info">Info</StatusBadge>)
      const badge = screen.getByText('Info')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('text-info')
    })

    it('renders with custom className', () => {
      render(<StatusBadge type="success" className="ms-2">Custom</StatusBadge>)
      const badge = screen.getByText('Custom')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('text-success', 'status-badge', 'ms-2')
    })

    it('renders children correctly', () => {
      render(<StatusBadge type="info">123</StatusBadge>)
      const badge = screen.getByText('123')
      expect(badge).toBeInTheDocument()
    })

    it('renders complex children', () => {
      render(
        <StatusBadge type="success">
          <span>Icon</span> Success
        </StatusBadge>
      )
      expect(screen.getByText('Icon')).toBeInTheDocument()
      expect(screen.getByText('Success')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('applies status-badge class by default', () => {
      render(<StatusBadge type="success">Badge</StatusBadge>)
      const badge = screen.getByText('Badge')
      expect(badge).toHaveClass('status-badge')
    })

    it('preserves custom className with status-badge class', () => {
      render(<StatusBadge type="danger" className="fw-bold">Badge</StatusBadge>)
      const badge = screen.getByText('Badge')
      expect(badge).toHaveClass('status-badge', 'text-danger', 'fw-bold')
    })

    it('handles empty className prop', () => {
      render(<StatusBadge type="success" className="">Badge</StatusBadge>)
      const badge = screen.getByText('Badge')
      expect(badge).toHaveClass('status-badge', 'text-success')
    })

    it('handles undefined className prop', () => {
      render(<StatusBadge type="warning">Badge</StatusBadge>)
      const badge = screen.getByText('Badge')
      expect(badge).toHaveClass('status-badge', 'text-warning')
    })
  })

  describe('Memoization', () => {
    it('memo prevents unnecessary re-renders', () => {
      const { rerender } = render(<StatusBadge type="success">Initial</StatusBadge>)
      const badge = screen.getByText('Initial')
      expect(badge).toBeInTheDocument()

      rerender(<StatusBadge type="success">Initial</StatusBadge>)
      expect(badge).toBeInTheDocument()

      rerender(<StatusBadge type="danger">Updated</StatusBadge>)
      expect(screen.getByText('Updated')).toBeInTheDocument()
      expect(screen.queryByText('Initial')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('renders empty children', () => {
      render(<StatusBadge type="info"></StatusBadge>)
      const badge = document.querySelector('.status-badge')
      expect(badge).toBeInTheDocument()
    })

    it('renders null children', () => {
      render(<StatusBadge type="success">{null}</StatusBadge>)
      const badge = document.querySelector('.status-badge')
      expect(badge).toBeInTheDocument()
    })

    it('handles whitespace in children', () => {
      render(<StatusBadge type="warning">  Spaced  </StatusBadge>)
      const badge = screen.getByText(/Spaced/)
      expect(badge).toBeInTheDocument()
    })

    it('handles special characters in children', () => {
      const specialText = 'Test & < > " \''
      render(<StatusBadge type="info">{specialText}</StatusBadge>)
      const badge = screen.getByText('Test & < > " \'')
      expect(badge).toBeInTheDocument()
    })

    it('handles numeric children', () => {
      render(<StatusBadge type="success">100%</StatusBadge>)
      const badge = screen.getByText('100%')
      expect(badge).toBeInTheDocument()
    })

    it('handles zero as children', () => {
      render(<StatusBadge type="danger">0</StatusBadge>)
      const badge = document.querySelector('.status-badge')
      expect(badge).toBeInTheDocument()
    })
  })
})
