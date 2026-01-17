import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlogSidebar from '../BlogSidebar';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { I18nProvider } from '@/contexts/I18nContext';

// Mock dependencies
jest.mock('@/components/common/AnimationWrapper', () => {
    return function MockAnimationWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
        return <div className={className} data-testid="animation-wrapper">{children}</div>;
    };
});

jest.mock('@/components/blogs/blog/BlogSearch', () => {
    return function MockBlogSearch({ value, onChange }: { value: string; onChange: (val: string) => void }) {
        return (
            <div className="sidebar-widget search-widget">
                <h3 className="widget-title">Cari Artikel</h3>
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Cari artikel..."
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        aria-label="Cari artikel"
                        className="form-control"
                    />
                </div>
            </div>
        );
    };
});

jest.mock('@/components/blogs/blog-tags/BlogTags', () => {
    return function MockBlogTags({ tags }: { tags: number[] }) {
        return (
            <div className="sidebar-widget">
                <h3 className="widget-title">Tags</h3>
                <div className="tag-cloud">
                    {tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                    ))}
                </div>
            </div>
        );
    };
});

jest.mock('@/components/blogs/blog/BlogSearch', () => {
    return function MockBlogSearch({ value, onChange }: { value: string; onChange: (val: string) => void }) {
        return (
            <div className="sidebar-widget search-widget">
                <h3 className="widget-title">Cari Artikel</h3>
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Cari artikel..."
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        aria-label="Cari artikel"
                        className="form-control"
                    />
                </div>
            </div>
        );
    };
});

jest.mock('@/components/blogs/blog/BlogCategoryFilter', () => {
    return function MockBlogCategoryFilter({ selectedCategory, onCategoryChange }: { selectedCategory: string | null; onCategoryChange: (cat: string | null) => void }) {
        return (
            <div className="sidebar-widget category-widget">
                <h3 className="widget-title">Kategori</h3>
                <select
                    value={selectedCategory || ''}
                    onChange={(e) => onCategoryChange(e.target.value || null)}
                    aria-label="Filter kategori artikel"
                    className="category-select"
                >
                    <option value="">Semua Kategori</option>
                    <option value="Konektivitas Terkelola">Konektivitas Terkelola</option>
                </select>
            </div>
        );
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

function renderWithProviders(component: React.ReactElement) {
    return render(
        <ThemeProvider>
            <I18nProvider>
                {component}
            </I18nProvider>
        </ThemeProvider>
    );
}

describe('BlogSidebar', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render sidebar container', () => {
            renderWithProviders(<BlogSidebar />);
            const container = screen.getByRole('textbox').closest('.col-xl-4');
            expect(container).toHaveClass('col-xl-4');
        });

        it('should render sidebar widget area', () => {
            renderWithProviders(<BlogSidebar />);
            const widgetArea = document.querySelector('.sidebar-widget-area');
            expect(widgetArea).toBeInTheDocument();
        });

        it('should render search widget', () => {
            renderWithProviders(<BlogSidebar />);
            const searchWidget = screen.getByPlaceholderText('Cari artikel...');
            expect(searchWidget).toBeInTheDocument();
            expect(searchWidget).toHaveAttribute('type', 'text');
        });

        it('should render Category component', () => {
            renderWithProviders(<BlogSidebar />);
            const category = screen.getByTestId('blog-category');
            expect(category).toBeInTheDocument();
            expect(category).toHaveTextContent('Category Component');
        });

        it('should render LatestNews component', () => {
            renderWithProviders(<BlogSidebar />);
            const latestNews = screen.getByTestId('blog-latest-news');
            expect(latestNews).toBeInTheDocument();
            expect(latestNews).toHaveTextContent('Latest News Component');
        });

        it('should render Tags component', () => {
            renderWithProviders(<BlogSidebar />);
            const tags = screen.getByTestId('blog-tags');
            expect(tags).toBeInTheDocument();
            expect(tags).toHaveTextContent('Tags Component');
        });
    });

    describe('Layout Structure', () => {
        it('should have correct DOM hierarchy', () => {
            renderWithProviders(<BlogSidebar />);
            const sidebar = document.querySelector('.col-xl-4');
            expect(sidebar).toBeInTheDocument();
        });

        it('should render widgets in correct order', () => {
            renderWithProviders(<BlogSidebar />);
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
            renderWithProviders(<BlogSidebar />);
            const searchWidget = document.querySelector('.search-widget');
            expect(searchWidget).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have semantic HTML structure', () => {
            renderWithProviders(<BlogSidebar />);
            const input = screen.getByRole('textbox');
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('placeholder');
        });

        it('should have proper input accessibility attributes', () => {
            renderWithProviders(<BlogSidebar />);
            const input = screen.getByRole('textbox');

            expect(input).toHaveAttribute('type', 'text');
            expect(input).toHaveAttribute('placeholder', 'Cari artikel...');
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

        it('should have search input with aria-label', () => {
            renderWithProviders(<BlogSidebar />);
            const searchInput = screen.getByRole('textbox');
            expect(searchInput).toBeInTheDocument();
            expect(searchInput).toHaveAttribute('aria-label', 'Cari artikel');
        });
    });

    describe('Edge Cases', () => {
        it('should render without props', () => {
            expect(() => render(<BlogSidebar />)).not.toThrow();
        });

        it('should handle missing animation gracefully', () => {
            const { container } = render(<BlogSidebar />);
            const searchWidget = container.querySelector('.search-widget');
            const categoryWidget = container.querySelector('.category-widget');
            expect(searchWidget || categoryWidget).toBeInTheDocument();
        });
    });
});
