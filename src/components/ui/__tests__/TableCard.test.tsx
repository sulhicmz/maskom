import React from 'react'
import { render, screen } from '@testing-library/react'
import TableCard from '../TableCard'

describe('TableCard', () => {
  it('renders title correctly', () => {
    render(<TableCard title="Test Title">test content</TableCard>)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders children content', () => {
    render(<TableCard title="Test"><div>test content</div></TableCard>)
    expect(screen.getByText('test content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<TableCard title="Test" className="custom-class"><div>content</div></TableCard>)
    const card = screen.getByText('content').closest('.card')
    expect(card).toHaveClass('custom-class')
  })

  it('includes shadow-sm class by default', () => {
    render(<TableCard title="Test"><div>content</div></TableCard>)
    const card = screen.getByText('content').closest('.card')
    expect(card).toHaveClass('shadow-sm')
  })

  it('renders card-header with bg-white class', () => {
    render(<TableCard title="Test Title"><div>content</div></TableCard>)
    const header = screen.getByText('Test Title')
    expect(header).toBeInTheDocument()
    expect(header.closest('.card-header')).toHaveClass('bg-white')
  })

  it('renders card-body wrapper', () => {
    render(<TableCard title="Test"><div>content</div></TableCard>)
    const card = screen.getByText('content').closest('.card')
    expect(card.querySelector('.card-body')).toBeInTheDocument()
  })

  it('renders table-responsive wrapper', () => {
    render(<TableCard title="Test"><div>content</div></TableCard>)
    const tableResponsive = screen.getByText('content').closest('.table-responsive')
    expect(tableResponsive).toBeInTheDocument()
  })
})
