import React from 'react'
import { render, screen } from '@testing-library/react'
import PageViewsTable from '../PageViewsTable'

const mockPageViewData = [
  {
    pagePath: '/',
    pageTitle: 'Home',
    totalViews: 1000,
    uniqueViews: 800,
    avgTimeOnPage: 45,
    bounceRate: 0.35
  },
  {
    pagePath: '/about',
    pageTitle: 'About',
    totalViews: 500,
    uniqueViews: 450,
    avgTimeOnPage: 60,
    bounceRate: 0.25
  }
]

describe('PageViewsTable', () => {
  it('renders table title', () => {
    render(<PageViewsTable data={mockPageViewData} />)
    expect(screen.getByText('Page Views Breakdown')).toBeInTheDocument()
  })

  it('renders all table headers', () => {
    render(<PageViewsTable data={mockPageViewData} />)
    expect(screen.getByText('Page')).toBeInTheDocument()
    expect(screen.getByText('Total Views')).toBeInTheDocument()
    expect(screen.getByText('Unique Views')).toBeInTheDocument()
    expect(screen.getByText('Avg Time on Page')).toBeInTheDocument()
    expect(screen.getByText('Bounce Rate')).toBeInTheDocument()
  })

  it('renders page view data', () => {
    render(<PageViewsTable data={mockPageViewData} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('1000')).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()
  })

  it('renders bounce rate as percentage', () => {
    render(<PageViewsTable data={mockPageViewData} />)
    expect(screen.getByText('35.0%')).toBeInTheDocument()
    expect(screen.getByText('25.0%')).toBeInTheDocument()
  })

  it('renders avg time on page with seconds', () => {
    render(<PageViewsTable data={mockPageViewData} />)
    expect(screen.getByText('45s')).toBeInTheDocument()
    expect(screen.getByText('60s')).toBeInTheDocument()
  })

  it('renders links for page paths', () => {
    render(<PageViewsTable data={mockPageViewData} />)
    const homeLink = screen.getByText('Home')
    expect(homeLink.tagName).toBe('A')
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('handles empty data array', () => {
    render(<PageViewsTable data={[]} />)
    expect(screen.getByText('Page Views Breakdown')).toBeInTheDocument()
  })

  it('renders multiple page entries', () => {
    render(<PageViewsTable data={mockPageViewData} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
  })
})
