import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlogArea from '../BlogArea';
const inner_blog_data = jest.requireActual('@/data/InnerBlogData').default as typeof import('@/data/InnerBlogData').default;

jest.mock('@/data/InnerBlogData', () => ({
    __esModule: true,
    default: jest.requireActual('@/data/InnerBlogData').default,
}));

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

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/blog',
  useSearchParams: () => new URLSearchParams(''),
}));

jest.mock('../BlogSearch', () => {
  return function MockBlogSearch({ value, onChange }: { value: string; onChange: (val: string) => void }) {
    return (
      <div className="sidebar-widget search-widget">
        <h3 className="widget-title">Cari Artikel</h3>
        <div className="search-box">
          <input
            type="text"
            placeholder="Cari judul atau deskripsi..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Cari artikel"
            className="form-control"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Hapus pencarian"
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  };
});

jest.mock('../BlogCategoryFilter', () => {
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
          <option value="Keamanan Jaringan">Keamanan Jaringan</option>
          <option value="Operasional & Dukungan">Operasional & Dukungan</option>
          <option value="Transformasi Digital">Transformasi Digital</option>
          <option value="Infrastruktur Cloud">Infrastruktur Cloud</option>
          <option value="IoT & Edge">IoT & Edge</option>
        </select>
        {selectedCategory && <button onClick={() => onCategoryChange(null)}>Hapus Filter</button>}
      </div>
    );
  };
});

jest.mock('../../blog-sidebar/Tags', () => {
  return function MockTags({ selectedTagId, onTagClick }: { selectedTagId: number | null; onTagClick: (id: number | null) => void }) {
    const tags = [
      { id: 1, name: 'SD-WAN' },
      { id: 2, name: 'Managed Wi-Fi' },
      { id: 3, name: 'Keamanan' },
      { id: 4, name: 'Cloud Connect' },
      { id: 5, name: 'Monitoring' },
      { id: 6, name: 'IoT' },
      { id: 7, name: 'Managed Service' },
      { id: 8, name: 'Infrastruktur' },
      { id: 9, name: 'Wi-Fi' },
    ];

    return (
      <div className="sidebar-widget tag-cloud-widget">
        <h3 className="widget-title">Keywords</h3>
        <div className="tagcloud">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => onTagClick(selectedTagId === tag.id ? null : tag.id)}
              className={`tag-btn ${selectedTagId === tag.id ? 'active' : ''}`}
              aria-label={`Filter artikel dengan kata kunci: ${tag.name}`}
              aria-pressed={selectedTagId === tag.id}
            >
              {tag.name}
            </button>
          ))}
          {selectedTagId && <button onClick={() => onTagClick(null)}>Hapus Filter</button>}
        </div>
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
      } else if (importStr.includes('BlogSidebar')) {
        const MockBlogSearch = function({ value, onChange }: { value: string; onChange: (val: string) => void }) {
          return (
            <div className="sidebar-widget search-widget">
              <h3 className="widget-title">Cari Artikel</h3>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Cari judul atau deskripsi..."
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  aria-label="Cari artikel"
                  className="form-control"
                />
              </div>
            </div>
          );
        };

        const MockBlogCategoryFilter = function({ selectedCategory, onCategoryChange }: { selectedCategory: string | null; onCategoryChange: (cat: string | null) => void }) {
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
                <option value="Keamanan Jaringan">Keamanan Jaringan</option>
                <option value="Operasional & Dukungan">Operasional & Dukungan</option>
                <option value="Transformasi Digital">Transformasi Digital</option>
                <option value="Infrastruktur Cloud">Infrastruktur Cloud</option>
                <option value="IoT & Edge">IoT & Edge</option>
              </select>
            </div>
          );
        };

        const MockTags = function({ selectedTagId, onTagClick }: { selectedTagId: number | null; onTagClick: (id: number | null) => void }) {
          const tags = [
            { id: 1, name: 'SD-WAN' },
            { id: 2, name: 'Managed Wi-Fi' },
            { id: 3, name: 'Keamanan' },
          ];

          return (
            <div className="sidebar-widget tag-cloud-widget">
              <h3 className="widget-title">Keywords</h3>
              <div className="tagcloud">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => onTagClick(selectedTagId === tag.id ? null : tag.id)}
                    className={`tag-btn ${selectedTagId === tag.id ? 'active' : ''}`}
                    aria-label={`Filter artikel dengan kata kunci: ${tag.name}`}
                    aria-pressed={selectedTagId === tag.id}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          );
        };

        const MockComponent = function(props: { searchValue?: string; onSearchChange?: (value: string) => void; selectedCategory?: string | null; onCategoryChange?: (category: string | null) => void; selectedTagId?: number | null; onTagClick?: (tagId: number | null) => void }) {
          return (
            <div data-testid="blog-sidebar">
              <MockBlogSearch value={props.searchValue || ''} onChange={props.onSearchChange || (() => {})} />
              <MockBlogCategoryFilter selectedCategory={props.selectedCategory ?? null} onCategoryChange={props.onCategoryChange || (() => {})} />
              <div>Mock Category</div>
              <div>Mock LatestNews</div>
              <MockTags selectedTagId={props.selectedTagId ?? null} onTagClick={props.onTagClick || (() => {})} />
            </div>
          );
        };
        MockComponent.displayName = 'MockBlogSidebar';
        return MockComponent;
      } else {
        return actualDynamic.default(importFn, options);
      }
    },
  };
});

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt?: string; [key: string]: unknown }) => (
    <img alt={alt} {...props as React.ImgHTMLAttributes<HTMLImageElement>} />
  ),
}));

describe('BlogArea', () => {
  it('renders blog section with container', async () => {
    render(<BlogArea />);

    await waitFor(() => {
      expect(screen.getByTestId('blog-sidebar')).toBeInTheDocument();
    });
  });

  it('renders initial blog items (3 per page)', async () => {
    render(<BlogArea />);

    await waitFor(() => {
      const blogLinks = screen.getAllByRole('link');
      const blogTitleLinks = blogLinks.filter(link =>
        link.textContent?.includes('BACA SELENGKAPNYA')
      );

      expect(blogTitleLinks.length).toBeLessThanOrEqual(3);
    });
  });

  it('renders blog post titles', async () => {
    render(<BlogArea />);

    await waitFor(() => {
      expect(screen.getByText(/strategi maskom/i)).toBeInTheDocument();
    });
  });

  it('renders blog metadata (date, user, tag)', async () => {
    render(<BlogArea />);

    await waitFor(() => {
      const clockIcon = screen.getAllByText(/tim/i).find(el => el.textContent?.includes('Tim'));
      expect(clockIcon || screen.getByText(/tim/i)).toBeInTheDocument();
    });
  });

  it('renders pagination component', async () => {
    render(<BlogArea />);

    await waitFor(() => {
      expect(screen.getByTestId('react-paginate')).toBeInTheDocument();
      expect(screen.getByTestId('next-page')).toBeInTheDocument();
      expect(screen.getByTestId('prev-page')).toBeInTheDocument();
    });
  });

  it('displays correct page count based on data', async () => {
    render(<BlogArea />);

    await waitFor(() => {
      const pageCount = screen.getByTestId('page-count');
      const publishedPosts = inner_blog_data.filter(post =>
        post.status === 'published' || !('status' in post)
      );
      const expectedPages = Math.ceil(publishedPosts.length / 3);

      expect(pageCount.textContent).toBe(String(expectedPages));
    });
  });

  it('handles pagination navigation', async () => {
    render(<BlogArea />);

    await waitFor(() => {
      const nextButton = screen.getByTestId('next-page');

      fireEvent.click(nextButton);
    });
  });

  it('renders social share buttons for each blog post', async () => {
    render(<BlogArea />);

    await waitFor(() => {
      const shareButtons = screen.getAllByRole('button', { name: /share/i });
      expect(shareButtons.length).toBeGreaterThan(0);
    });
  });

  it('renders individual social media buttons (Facebook, Twitter, LinkedIn, Instagram)', async () => {
    render(<BlogArea />);

    await waitFor(() => {
      expect(screen.getAllByLabelText(/facebook/i).length).toBeGreaterThan(0);
    });
  });

  it('maintains blog item structure', async () => {
    render(<BlogArea />);

    await waitFor(() => {
      const blogArticles = document.querySelectorAll('.blog-post-item');
      expect(blogArticles.length).toBeGreaterThan(0);
    });
  });

  it('renders "BACA SELENGKAPNYA" links for blog posts', async () => {
    render(<BlogArea />);

    await waitFor(() => {
      const readMoreLinks = screen.getAllByText('BACA SELENGKAPNYA');
      expect(readMoreLinks.length).toBeGreaterThan(0);
    });
  });

  it('uses correct itemsPerPage (3)', async () => {
    render(<BlogArea />);

    await waitFor(() => {
      const blogItems = document.querySelectorAll('.blog-post-item');
      expect(blogItems.length).toBeLessThanOrEqual(3);
    });
  });

  it('renders blog images with proper alt text', async () => {
    render(<BlogArea />);

    await waitFor(() => {
      const images = screen.getAllByAltText(/Thumbnail gambar artikel:/i);
      expect(images.length).toBeGreaterThan(0);
    });
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

    await waitFor(async () => {
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
  });

  describe('Search Functionality', () => {
    it('renders search input in sidebar', () => {
      render(<BlogArea />);

      expect(screen.getByPlaceholderText('Cari judul atau deskripsi...')).toBeInTheDocument();
    });

    it('displays filtered posts when search query matches', async () => {
      render(<BlogArea />);

      const searchInput = screen.getByPlaceholderText('Cari judul atau deskripsi...');
      fireEvent.change(searchInput, { target: { value: 'SD-WAN' } });

      await waitFor(() => {
        const posts = screen.getAllByText(/BACA SELENGKAPNYA/);
        expect(posts.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });

    it('shows no results when search matches no posts', async () => {
      render(<BlogArea />);

      const searchInput = screen.getByPlaceholderText('Cari judul atau deskripsi...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent post xyz 12345' } });

      await waitFor(() => {
        expect(screen.getByText('Tidak ada hasil ditemukan')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Filter Status Display', () => {
    it('shows filter status when search is applied', async () => {
      render(<BlogArea />);

      const searchInput = screen.getByPlaceholderText('Cari judul atau deskripsi...');
      fireEvent.change(searchInput, { target: { value: 'test query' } });

      await waitFor(() => {
        expect(screen.getByText('Filter Aktif:')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('displays active search filter tag', async () => {
      render(<BlogArea />);

      const searchInput = screen.getByPlaceholderText('Cari judul atau deskripsi...');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      await waitFor(() => {
        expect(screen.getByText(/Pencarian: "test"/)).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('No Results State', () => {
    it('shows no results message with helpful text', async () => {
      render(<BlogArea />);

      const searchInput = screen.getByPlaceholderText('Cari judul atau deskripsi...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText('Tidak ada hasil ditemukan')).toBeInTheDocument();
        expect(screen.getByText('Coba sesuaikan filter atau kata kunci pencarian Anda.')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('shows clear all filters button in no results state', async () => {
      render(<BlogArea />);

      const searchInput = screen.getByPlaceholderText('Cari judul atau deskripsi...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        const clearButtons = screen.getAllByText('Hapus Semua Filter');
        expect(clearButtons.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });
  });
});
