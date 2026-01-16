import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoadingSpinner from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  describe('Rendering', () => {
    it('should render loading spinner with default props', () => {
      render(<LoadingSpinner />)
      
      const spinner = screen.getByRole('status')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('spinner-border', 'text-primary')
      
      const loadingText = screen.getByText('Loading...')
      expect(loadingText).toBeInTheDocument()
      expect(loadingText).toHaveClass('visually-hidden')
    })
    
    it('should render with custom minHeight number', () => {
      const { container } = render(<LoadingSpinner minHeight={300} />)
      
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveStyle({ minHeight: '300px' })
    })
    
    it('should render with custom minHeight string', () => {
      const { container } = render(<LoadingSpinner minHeight="50vh" />)
      
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveStyle({ minHeight: '50vh' })
    })
    
    it('should render with custom text', () => {
      render(<LoadingSpinner text="Please wait..." />)
      
      expect(screen.getByText('Please wait...')).toBeInTheDocument()
    })
    
    it('should render with custom color', () => {
      const { container } = render(<LoadingSpinner color="success" />)
      
      const spinner = container.querySelector('.spinner-border')
      expect(spinner).toHaveClass('text-success')
    })
    
    it('should render with additional className', () => {
      const { container } = render(<LoadingSpinner className="custom-class" />)
      
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('custom-class')
    })
  })
  
  describe('Color Variants', () => {
    it('should apply primary color by default', () => {
      const { container } = render(<LoadingSpinner />)
      
      const spinner = container.querySelector('.spinner-border')
      expect(spinner).toHaveClass('text-primary')
    })
    
    it('should apply secondary color', () => {
      const { container } = render(<LoadingSpinner color="secondary" />)
      
      const spinner = container.querySelector('.spinner-border')
      expect(spinner).toHaveClass('text-secondary')
    })
    
    it('should apply success color', () => {
      const { container } = render(<LoadingSpinner color="success" />)
      
      const spinner = container.querySelector('.spinner-border')
      expect(spinner).toHaveClass('text-success')
    })
    
    it('should apply danger color', () => {
      const { container } = render(<LoadingSpinner color="danger" />)
      
      const spinner = container.querySelector('.spinner-border')
      expect(spinner).toHaveClass('text-danger')
    })
    
    it('should apply warning color', () => {
      const { container } = render(<LoadingSpinner color="warning" />)
      
      const spinner = container.querySelector('.spinner-border')
      expect(spinner).toHaveClass('text-warning')
    })
  })
  
  describe('Accessibility', () => {
    it('should have role="status" attribute', () => {
      render(<LoadingSpinner />)
      
      const spinner = screen.getByRole('status')
      expect(spinner).toBeInTheDocument()
    })
    
    it('should have visually-hidden text for screen readers', () => {
      render(<LoadingSpinner text="Loading content..." />)
      
      const loadingText = screen.getByText('Loading content...')
      expect(loadingText).toHaveClass('visually-hidden')
    })
  })
  
  describe('Props Validation', () => {
    it('should accept minHeight as number', () => {
      const { container } = render(<LoadingSpinner minHeight={150} />)
      
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveStyle({ minHeight: '150px' })
    })
    
    it('should accept minHeight as string with px', () => {
      const { container } = render(<LoadingSpinner minHeight="300px" />)
      
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveStyle({ minHeight: '300px' })
    })
    
    it('should accept minHeight as string with vh', () => {
      const { container } = render(<LoadingSpinner minHeight="100vh" />)
      
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveStyle({ minHeight: '100vh' })
    })
    
    it('should accept minHeight as string with %', () => {
      const { container } = render(<LoadingSpinner minHeight="50%" />)
      
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveStyle({ minHeight: '50%' })
    })
    
    it('should render default text when no text prop provided', () => {
      render(<LoadingSpinner />)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })
    
    it('should render default minHeight when no minHeight prop provided', () => {
      const { container } = render(<LoadingSpinner />)
      
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveStyle({ minHeight: '200px' })
    })
  })
  
  describe('Component Structure', () => {
    it('should have d-flex justify-content-center align-items-center classes', () => {
      const { container } = render(<LoadingSpinner />)
      
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper).toHaveClass('d-flex', 'justify-content-center', 'align-items-center')
    })
    
    it('should render spinner-border inside wrapper', () => {
      const { container } = render(<LoadingSpinner />)
      
      const spinner = container.querySelector('.spinner-border')
      expect(spinner).toBeInTheDocument()
    })
  })
  
  describe('Memoization', () => {
    it('should be memoized with React.memo', () => {
      const TestComponent = React.memo(() => <div>Test</div>)
      TestComponent.displayName = 'TestComponent'
      expect(LoadingSpinner.$$typeof).toEqual(TestComponent.$$typeof)
    })
  })
})
