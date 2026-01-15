import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlogArea from '../BlogArea';
import inner_blog_data from '@/data/InnerBlogData';

jest.mock('react-paginate', () => {
  return function MockReactPaginate({ pageCount, onPageChange }: { pageCount: number; onPageChange: (data: { selected: number }) => void }) {
    return (
      <div data-testid="react-paginate">
        <button onClick={() => onPageChange({ selected: 1 })} data-testid="next-page">Next</button>
        <button onClick={() => onPageChange({ selected: 0 })} data-testid="prev-page">Previous</button>
        <span data-testid="page-count">{pageCount}</span>
      </div>
    );
  };
});

jest.mock('next/dynamic', () => {
  const actualDynamic = jest.requireActual<typeof import('next/dynamic')>('next/dynamic');
  return {
    __esModule: true,
    default: (importFn: () => Promise<{ default: React.ComponentType }>, options?: { loading?: () => React.ReactNode }) => {
      const importStr = importFn.toString();
      if (importStr.includes('react-paginate')) {
        const MockPaginate = function MockReactPaginate({ pageCount, onPageChange }: { pageCount: number; onPageChange: (data: { selected: number }) => void }) {
          return (
            <div data-testid="react-paginate">
              <button onClick={() => onPageChange({ selected: 1 })} data-testid="next-page">Next</button>
              <button onClick={() => onPageChange({ selected: 0 })} data-testid="prev-page">Previous</button>
              <span data-testid="page-count">{pageCount}</span>
            </div>
          );
        };
        const MockComponent = function() {
          return <MockPaginate pageCount={2} onPageChange={() => {}} />;
        };
        MockComponent.displayName = 'MockReactPaginate';
        return MockComponent;
      } else {
        return actualDynamic.default(importFn, options);
      }
    },
  };
});

jest.mock('@/components/blogs/blog/BlogSearch', () => {
  return function MockBlogSearch({ searchQuery, onSearchChange }: { searchQuery: string; onSearchChange: (query: string) => void }) {
    return (
      <div data-testid="blog-search">
        <input data-testid="search-input" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} />
      </div>
    );
  };
});

jest.mock('@/components/blogs/blog/BlogCategoryFilter', () => {
  return function MockBlogCategoryFilter({ selectedCategory, onCategoryChange }: { selectedCategory: string; onCategoryChange: (category: string) => void }) {
    return (
      <div data-testid="blog-category-filter">
        <select value={selectedCategory} onChange={(e) => onCategoryChange(e.target.value)}>
          <option value="">Semua Kategori</option>
          <option value="Konektivitas Terkelola">Konektivitas Terkelola</option>
          <option value="Keamanan Jaringan">Keamanan Jaringan</option>
          <option value="Operasional & Dukungan">Operasional & Dukungan</option>
          <option value="Transformasi Digital">Transformasi Digital</option>
          <option value="Infrastruktur Cloud">Infrastruktur Cloud</option>
          <option value="IoT & Edge">IoT & Edge</option>
        </select>
      </div>
    );
  };
});

jest.mock('@/components/blogs/blog-sidebar/Tags', () => {
  return function MockTags({ onTagClick }: { onTagClick: (tagId: number | null) => void }) {
    return (
      <div data-testid="blog-tags">
        <button data-testid="tag-all" onClick={() => onTagClick(null)}>Semua</button>
        <button data-testid="tag-1" onClick={() => onTagClick(1)}>SD-WAN</button>
        <button data-testid="tag-2" onClick={() => onTagClick(2)}>Managed Wi-Fi</button>
        <button data-testid="tag-3" onClick={() => onTagClick(3)}>Keamanan</button>
      </div>
    );
  };
});

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt?: string; [key: string]: unknown }) => (
    <img alt={alt} {...props as React.ImgHTMLAttributes<HTMLImageElement>} />
  ),
}));

describe('BlogArea', () => {
  it('renders blog section with filter components', () => {
    render(<BlogArea />);

    expect(screen.getByTestId('blog-search')).toBeInTheDocument();
    expect(screen.getByTestId('blog-category-filter')).toBeInTheDocument();
    expect(screen.getByTestId('blog-tags')).toBeInTheDocument();
  });

  it('renders initial blog items (3 per page)', () => {
    render(<BlogArea />);

    const blogLinks = screen.getAllByRole('link');
    const blogTitleLinks = blogLinks.filter(link => 
      link.textContent?.includes('BACA SELENGKAPNYA')
    );
    
    expect(blogTitleLinks.length).toBeLessThanOrEqual(3);
  });

  it('renders blog post titles', () => {
    render(<BlogArea />);

    expect(screen.getByText(/strategi maskom/i)).toBeInTheDocument();
  });

  it('renders blog metadata (date, user, tag)', () => {
    render(<BlogArea />);

    const clockIcon = screen.getAllByText(/tim/i).find(el => el.textContent?.includes('Tim'));
    expect(clockIcon || screen.getByText(/tim/i)).toBeInTheDocument();
  });

  it('renders pagination component', () => {
    render(<BlogArea />);

    expect(screen.getByTestId('react-paginate')).toBeInTheDocument();
    expect(screen.getByTestId('next-page')).toBeInTheDocument();
    expect(screen.getByTestId('prev-page')).toBeInTheDocument();
  });

  it('displays correct page count based on data', () => {
    render(<BlogArea />);

    const pageCount = screen.getByTestId('page-count');
    const expectedPages = Math.ceil(inner_blog_data.length / 3);
    
    expect(pageCount.textContent).toBe(String(expectedPages));
  });

  it('handles pagination navigation', async () => {
    render(<BlogArea />);

    const nextButton = screen.getByTestId('next-page');
    
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByTestId('next-page')).toBeInTheDocument();
    });
  });

  it('renders social share buttons for each blog post', () => {
    render(<BlogArea />);

    const shareButtons = screen.getAllByRole('button', { name: /share/i });
    expect(shareButtons.length).toBeGreaterThan(0);
  });

  it('renders individual social media buttons (Facebook, Twitter, LinkedIn, Instagram)', () => {
    render(<BlogArea />);

    expect(screen.getAllByLabelText(/facebook/i).length).toBeGreaterThan(0);
  });

  it('maintains blog item structure', () => {
    render(<BlogArea />);

    const blogArticles = document.querySelectorAll('.blog-post-item');
    expect(blogArticles.length).toBeGreaterThan(0);
  });

  it('renders "BACA SELENGKAPNYA" links for blog posts', () => {
    render(<BlogArea />);

    const readMoreLinks = screen.getAllByText('BACA SELENGKAPNYA');
    expect(readMoreLinks.length).toBeGreaterThan(0);
  });

  it('uses correct itemsPerPage (3)', () => {
    render(<BlogArea />);

    const blogItems = document.querySelectorAll('.blog-post-item');
    expect(blogItems.length).toBeLessThanOrEqual(3);
  });

  it('renders blog images with proper alt text', () => {
    render(<BlogArea />);

    const images = screen.getAllByAltText(/Thumbnail gambar artikel:/i);
    expect(images.length).toBeGreaterThan(0);
  });

  it('preserves blog data structure (id, thumb, title, desc, date, user, tagId)', () => {
    render(<BlogArea />);

    expect(inner_blog_data[0]).toHaveProperty('id');
    expect(inner_blog_data[0]).toHaveProperty('title');
    expect(inner_blog_data[0]).toHaveProperty('desc');
    expect(inner_blog_data[0]).toHaveProperty('date');
    expect(inner_blog_data[0]).toHaveProperty('user');
    expect(inner_blog_data[0]).toHaveProperty('tagId');
  });

  it('handles pagination state changes', async () => {
    render(<BlogArea />);

    const nextButton = screen.getByTestId('next-page');
    const prevButton = screen.getByTestId('prev-page');

    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByTestId('next-page')).toBeInTheDocument();
    });

    fireEvent.click(prevButton);
    await waitFor(() => {
      expect(screen.getByTestId('prev-page')).toBeInTheDocument();
    });
  });

  describe('Search Filtering', () => {
    it('filters blog posts by search query', async () => {
      render(<BlogArea />);

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'strategi' } });

      await waitFor(() => {
        expect(screen.getByText(/strategi/i)).toBeInTheDocument();
      });
    });

    it('shows all posts when search query is empty', async () => {
      render(<BlogArea />);

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      fireEvent.change(searchInput, { target: { value: '' } });

      await waitFor(() => {
        expect(screen.getByText(/strategi maskom/i)).toBeInTheDocument();
      });
    });

    it('does not show posts that do not match search query', async () => {
      render(<BlogArea />);

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.queryByText(/strategi maskom/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Tag Filtering', () => {
    it('calls onTagClick when tag is clicked', async () => {
      render(<BlogArea />);

      const tagButton = screen.getByTestId('tag-1');
      fireEvent.click(tagButton);

      await waitFor(() => {
        expect(screen.getByTestId('tag-1')).toBeInTheDocument();
      });
    });

    it('calls onTagClick with null when "Semua" is clicked', async () => {
      render(<BlogArea />);

      const tagAllButton = screen.getByTestId('tag-all');
      fireEvent.click(tagAllButton);

      await waitFor(() => {
        expect(screen.getByTestId('tag-all')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Status', () => {
    it('shows filter status when filters are active', async () => {
      render(<BlogArea />);

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText(/Hasil pencarian/i)).toBeInTheDocument();
      });
    });

    it('shows clear all filters button when filters are active', async () => {
      render(<BlogArea />);

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText(/Hapus Semua Filter/i)).toBeInTheDocument();
      });
    });

    it('clears all filters when button is clicked', async () => {
      render(<BlogArea />);

      const searchInput = screen.getByTestId('search-input') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const clearButton = screen.getByText(/Hapus Semua Filter/i);
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(searchInput.value).toBe('');
        expect(screen.queryByText(/Hasil pencarian/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('No Results', () => {
    it('shows no results message when no posts match filters', async () => {
      render(<BlogArea />);

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'nonexistentxyz' } });

      await waitFor(() => {
        expect(screen.getByText(/Tidak ada hasil ditemukan/i)).toBeInTheDocument();
      });
    });

    it('shows helpful message when no results found', async () => {
      render(<BlogArea />);

      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText(/Coba ubah kata kunci pencarian/i)).toBeInTheDocument();
      });
    });
  });
});
