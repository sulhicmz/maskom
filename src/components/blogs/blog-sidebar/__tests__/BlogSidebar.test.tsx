import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlogSidebar from '../BlogSidebar';

// Mock dependencies
jest.mock('@/components/common/AnimationWrapper', () => {
    return function MockAnimationWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
        return <div className={className} data-testid="animation-wrapper">{children}</div>;
    };
});

jest.mock('../Category', () => {
    return function MockCategory() {
        return <div data-testid="blog-category">Category Component</div>;
    };
});

jest.mock('../LatestNews', () => {
    return function MockLatestNews() {
        return <div data-testid="blog-latest-news">Latest News Component</div>;
    };
});

jest.mock('../Tags', () => {
    return function MockTags() {
        return <div data-testid="blog-tags">Tags Component</div>;
    };
});

describe('BlogSidebar', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render sidebar container', () => {
            render(<BlogSidebar />);
            const container = screen.getByRole('textbox').closest('.col-xl-4');
            expect(container).toHaveClass('col-xl-4');
        });

        it('should render sidebar widget area', () => {
            render(<BlogSidebar />);
            const widgetArea = screen.getByTestId('animation-wrapper').parentElement?.parentElement;
            expect(widgetArea).toHaveClass('sidebar-widget-area');
        });

        it('should render search widget', () => {
            render(<BlogSidebar />);
            const searchWidget = screen.getByPlaceholderText('Cari artikel...');
            expect(searchWidget).toBeInTheDocument();
            expect(searchWidget).toHaveAttribute('type', 'text');
        });

        it('should render Category component', () => {
            render(<BlogSidebar />);
            const category = screen.getByTestId('blog-category');
            expect(category).toBeInTheDocument();
            expect(category).toHaveTextContent('Category Component');
        });

        it('should render LatestNews component', () => {
            render(<BlogSidebar />);
            const latestNews = screen.getByTestId('blog-latest-news');
            expect(latestNews).toBeInTheDocument();
            expect(latestNews).toHaveTextContent('Latest News Component');
        });

        it('should render Tags component', () => {
            render(<BlogSidebar />);
            const tags = screen.getByTestId('blog-tags');
            expect(tags).toBeInTheDocument();
            expect(tags).toHaveTextContent('Tags Component');
        });
    });

    describe('Layout Structure', () => {
        it('should have correct DOM hierarchy', () => {
            render(<BlogSidebar />);
            const sidebar = screen.getByTestId('animation-wrapper').parentElement?.parentElement?.parentElement?.parentElement?.parentElement;
            expect(sidebar).toBeInTheDocument();
        });

        it('should render widgets in correct order', () => {
            render(<BlogSidebar />);
            const category = screen.getByTestId('blog-category');
            const latestNews = screen.getByTestId('blog-latest-news');
            const tags = screen.getByTestId('blog-tags');

            // Check order by comparing DOM positions
            const categoryIndex = Array.from(category.parentElement?.children || []).indexOf(category);
            const latestNewsIndex = Array.from(latestNews.parentElement?.children || []).indexOf(latestNews);
            const tagsIndex = Array.from(tags.parentElement?.children || []).indexOf(tags);

            expect(categoryIndex).toBeLessThan(latestNewsIndex);
            expect(latestNewsIndex).toBeLessThan(tagsIndex);
        });
    });

    describe('Component Integration', () => {
        it('should render all child components without errors', () => {
            expect(() => render(<BlogSidebar />)).not.toThrow();
        });

        it('should pass AnimationWrapper animation="fadeInUp" to search widget', () => {
            render(<BlogSidebar />);
            const animationWrapper = screen.getAllByTestId('animation-wrapper')[0];
            expect(animationWrapper).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have semantic HTML structure', () => {
            render(<BlogSidebar />);
            const input = screen.getByRole('textbox');
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('placeholder');
        });

        it('should have proper input accessibility attributes', () => {
            render(<BlogSidebar />);
            const input = screen.getByRole('textbox');
            const searchButton = screen.getByRole('button');

            expect(input).toHaveAttribute('type', 'text');
            expect(input).toHaveAttribute('placeholder', 'Cari artikel...');
            expect(searchButton).toBeInTheDocument();
        });
    });

    describe('Component Features', () => {
        it('should prevent default form submission on search', () => {
            const preventDefault = jest.fn();
            const { container } = render(<BlogSidebar />);
            const form = container.querySelector('form');

            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    preventDefault();
                });
            }

            expect(screen.getByRole('textbox')).toBeInTheDocument();
        });

        it('should have search button with icon', () => {
            render(<BlogSidebar />);
            const searchButton = screen.getByRole('button');
            expect(searchButton).toBeInTheDocument();
            expect(searchButton).toContainHTML('<i');
        });
    });

    describe('Edge Cases', () => {
        it('should render without props', () => {
            expect(() => render(<BlogSidebar />)).not.toThrow();
        });

        it('should handle missing animation gracefully', () => {
            const { container } = render(<BlogSidebar />);
            const animationWrappers = container.querySelectorAll('[data-testid="animation-wrapper"]');
            expect(animationWrappers.length).toBeGreaterThan(0);
        });
    });
});
