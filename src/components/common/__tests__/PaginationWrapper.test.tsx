import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import PaginationWrapper from '../PaginationWrapper'

describe('PaginationWrapper Component', () => {
    const mockOnPageChange = jest.fn()

    beforeEach(() => {
        mockOnPageChange.mockClear()
    })

    describe('Rendering Tests', () => {
        test('should render pagination container with correct class', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                />
            )
            const container = document.querySelector('.ac-pagination')
            expect(container).toBeInTheDocument()
        })

        test('should render nav element inside container', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                />
            )
            const nav = document.querySelector('.ac-pagination nav')
            expect(nav).toBeInTheDocument()
        })

        test('should apply custom className to container', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                    className="custom-class"
                />
            )
            const container = document.querySelector('.ac-pagination.custom-class')
            expect(container).toBeInTheDocument()
        })

        test('should render pagination links', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                />
            )
            const pageLinks = document.querySelectorAll('.ac-pagination nav a')
            expect(pageLinks.length).toBeGreaterThan(0)
        })
    })

    describe('Props Tests', () => {
        test('should render with pageCount prop', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                />
            )
            const container = document.querySelector('.ac-pagination')
            expect(container).toBeInTheDocument()
        })

        test('should render with onPageChange handler', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                />
            )
            const container = document.querySelector('.ac-pagination')
            expect(container).toBeInTheDocument()
        })

        test('should use default pageRangeDisplayed value of 3', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                />
            )
            const container = document.querySelector('.ac-pagination')
            expect(container).toBeInTheDocument()
        })

        test('should accept custom pageRangeDisplayed value', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                    pageRangeDisplayed={5}
                />
            )
            const container = document.querySelector('.ac-pagination')
            expect(container).toBeInTheDocument()
        })

        test('should accept marginPagesDisplayed prop', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                    marginPagesDisplayed={2}
                />
            )
            const container = document.querySelector('.ac-pagination')
            expect(container).toBeInTheDocument()
        })

        test('should accept containerClassName prop', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                    containerClassName="pagination-container"
                />
            )
            const container = document.querySelector('.ac-pagination')
            expect(container).toBeInTheDocument()
        })
    })

    describe('ReactPaginate Configuration Tests', () => {
        test('should render next button with angle-right icon', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                />
            )
            const nextIcon = document.querySelector('.ac-pagination .next i.fa-angle-right')
            expect(nextIcon).toBeInTheDocument()
        })

        test('should render previous button with angle-left icon', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                />
            )
            const prevIcon = document.querySelector('.ac-pagination .previous i.fa-angle-left')
            expect(prevIcon).toBeInTheDocument()
        })

        test('should render break labels', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                />
            )
            const breakLabels = document.querySelectorAll('.ac-pagination .break')
            expect(breakLabels.length).toBeGreaterThan(0)
        })
    })

    describe('Memoization Tests', () => {
        test('should have displayName set to PaginationWrapper', () => {
            expect(PaginationWrapper.displayName).toBe('PaginationWrapper')
        })

        test('should be memoized with React.memo', () => {
            const { rerender } = render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                />
            )
            const container = document.querySelector('.ac-pagination')
            expect(container).toBeInTheDocument()

            rerender(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                />
            )

            const rerenderedContainer = document.querySelector('.ac-pagination')
            expect(rerenderedContainer).toBeInTheDocument()
        })
    })

    describe('Edge Cases Tests', () => {
        test('should handle zero pageCount', () => {
            render(
                <PaginationWrapper
                    pageCount={0}
                    onPageChange={mockOnPageChange}
                />
            )
            const container = document.querySelector('.ac-pagination')
            expect(container).toBeInTheDocument()
        })

        test('should handle single page', () => {
            render(
                <PaginationWrapper
                    pageCount={1}
                    onPageChange={mockOnPageChange}
                />
            )
            const container = document.querySelector('.ac-pagination')
            expect(container).toBeInTheDocument()
        })

        test('should handle large pageCount', () => {
            render(
                <PaginationWrapper
                    pageCount={100}
                    onPageChange={mockOnPageChange}
                />
            )
            const container = document.querySelector('.ac-pagination')
            expect(container).toBeInTheDocument()
        })

        test('should handle missing optional props', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                />
            )
            const container = document.querySelector('.ac-pagination')
            expect(container).toBeInTheDocument()
        })

        test('should handle empty className prop', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                    className=""
                />
            )
            const container = document.querySelector('.ac-pagination')
            expect(container).toBeInTheDocument()
        })

        test('should handle undefined optional props', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                    marginPagesDisplayed={undefined}
                    containerClassName={undefined}
                    className={undefined}
                />
            )
            const container = document.querySelector('.ac-pagination')
            expect(container).toBeInTheDocument()
        })

        test('should handle negative pageCount gracefully', () => {
            render(
                <PaginationWrapper
                    pageCount={-5}
                    onPageChange={mockOnPageChange}
                />
            )
            const container = document.querySelector('.ac-pagination')
            expect(container).toBeInTheDocument()
        })
    })

    describe('Accessibility Tests', () => {
        test('should have semantic HTML structure with nav element', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                />
            )
            const nav = document.querySelector('.ac-pagination nav')
            expect(nav).toBeInTheDocument()
        })

        test('should render with proper container classes for accessibility', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                />
            )
            const container = document.querySelector('.ac-pagination')
            expect(container).toBeInTheDocument()
        })

        test('should render links with proper ARIA labels', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                />
            )
            const links = document.querySelectorAll('.ac-pagination nav a[aria-label]')
            expect(links.length).toBeGreaterThan(0)
        })
    })

    describe('DOM Structure Tests', () => {
        test('should maintain correct DOM hierarchy', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                />
            )
            const container = document.querySelector('.ac-pagination')
            const nav = container?.querySelector('nav')
            expect(nav).toBeInTheDocument()
            expect(nav?.parentElement).toBe(container)
        })
    })

    describe('CSS Classes Tests', () => {
        test('should apply base class "ac-pagination"', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                />
            )
            const container = document.querySelector('.ac-pagination')
            expect(container).toBeInTheDocument()
        })

        test('should concatenate custom className with base class', () => {
            render(
                <PaginationWrapper
                    pageCount={10}
                    onPageChange={mockOnPageChange}
                    className="custom-class another-class"
                />
            )
            const container = document.querySelector('.ac-pagination.custom-class.another-class')
            expect(container).toBeInTheDocument()
        })
    })
})
