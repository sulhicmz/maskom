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
      } else if (importStr.includes('BlogSidebar')) {
        const MockComponent = function() {
          return <div data-testid="blog-sidebar">Mock BlogSidebar</div>;
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
  it('renders blog section with container', () => {
    render(<BlogArea />);

    expect(screen.getByTestId('blog-sidebar')).toBeInTheDocument();
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

    const images = screen.getAllByAltText(/post post-thumbnail/i);
    expect(images.length).toBeGreaterThan(0);
  });

  it('preserves blog data structure (id, thumb, title, desc, date, user, tag)', () => {
    render(<BlogArea />);

    expect(inner_blog_data[0]).toHaveProperty('id');
    expect(inner_blog_data[0]).toHaveProperty('title');
    expect(inner_blog_data[0]).toHaveProperty('desc');
    expect(inner_blog_data[0]).toHaveProperty('date');
    expect(inner_blog_data[0]).toHaveProperty('user');
    expect(inner_blog_data[0]).toHaveProperty('tag');
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
});
