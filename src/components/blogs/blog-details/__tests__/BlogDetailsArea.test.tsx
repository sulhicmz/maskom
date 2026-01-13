import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlogDetailsArea from '../BlogDetailsArea';
import { InnerBlogPost } from '@/types/data';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => <img alt={alt} {...props} />,
}));

jest.mock('next/dynamic', () => () => {
  const MockComponent = () => <div data-testid="blog-form">Mock BlogForm</div>;
  MockComponent.displayName = 'MockComponent';
  return MockComponent;
});

jest.mock('../../blog-sidebar/BlogSidebar', () => {
  const MockSidebar = () => <div data-testid="blog-sidebar">Mock BlogSidebar</div>;
  MockSidebar.displayName = 'MockBlogSidebar';
  return MockSidebar;
});

const createMockStaticImageData = () => ({
  src: '/test-image.jpg',
  height: 1000,
  width: 1000,
  blurDataURL: '',
}) as const;

describe('BlogDetailsArea', () => {
  const mockBlogPost: InnerBlogPost = {
    id: 1,
    thumb: createMockStaticImageData(),
    title: 'Test Blog Post Title',
    desc: 'Test description',
    date: '15 Mar 2024',
    user: 'Test Author',
    tagId: 7,
  };

  it('renders blog details section with proper structure', () => {
    const { container } = render(<BlogDetailsArea />);
    
    const section = container.querySelector('.blog-details-section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('pt-120');
    expect(section).toHaveClass('pb-80');
  });

  it('renders blog details wrapper', () => {
    const { container } = render(<BlogDetailsArea />);
    
    const wrapper = container.querySelector('.blog-details-wrapper');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('mb-30');
  });

  it('renders blog post item', () => {
    const { container } = render(<BlogDetailsArea />);
    
    const blogPost = container.querySelector('.blog-post-item');
    expect(blogPost).toBeInTheDocument();
    expect(blogPost).toHaveClass('mb-60');
  });

  it('renders default title when no single_blog prop', () => {
    render(<BlogDetailsArea />);
    
    const title = screen.getByText('Strategi Maskom menjaga pengalaman pelanggan omni-channel');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H3');
  });

  it('renders custom title from single_blog prop', () => {
    render(<BlogDetailsArea single_blog={mockBlogPost} />);
    
    const title = screen.getByText('Test Blog Post Title');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H3');
  });

  it('renders post meta information with default values', () => {
    render(<BlogDetailsArea />);
    
    expect(screen.getByText('15 Mar 2024')).toBeInTheDocument();
    expect(screen.getByText('Tim Editorial Maskom')).toBeInTheDocument();
    expect(screen.getByText('Managed Service')).toBeInTheDocument();
  });

  it('renders post meta information from single_blog prop', () => {
    render(<BlogDetailsArea single_blog={mockBlogPost} />);
    
    expect(screen.getByText('15 Mar 2024')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
    expect(screen.getByText('Managed Service')).toBeInTheDocument();
  });

  it('renders post content paragraphs', () => {
    render(<BlogDetailsArea />);
    
    expect(screen.getByText(/Maskom mendampingi jaringan retail nasional/)).toBeInTheDocument();
    expect(screen.getByText(/Dengan pendekatan tersebut, tim IT pelanggan/)).toBeInTheDocument();
  });

  it('renders blockquote with citation', () => {
    render(<BlogDetailsArea />);
    
    const blockquote = screen.getByRole('blockquote');
    expect(blockquote).toBeInTheDocument();
    expect(screen.getByText(/Transparansi monitoring Maskom membuat tim kami/)).toBeInTheDocument();
    expect(screen.getByText('Head of IT Operations, Klien Retail')).toBeInTheDocument();
  });

  it('renders check list items', () => {
    render(<BlogDetailsArea />);
    
    const checkList = screen.getByText(/Menjamin konektivitas utama dan cadangan/);
    expect(checkList).toBeInTheDocument();
    expect(screen.getByText(/Menerapkan kebijakan keamanan berlapis/)).toBeInTheDocument();
    expect(screen.getByText(/Menyediakan dukungan operasional terukur/)).toBeInTheDocument();
  });

  it('renders heading four element', () => {
    render(<BlogDetailsArea />);
    
    const heading = screen.getByText('Tiga fokus utama dalam menjaga pengalaman omni-channel');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H4');
  });

  it('renders images with alt text', () => {
    render(<BlogDetailsArea />);

    const thumbnail = screen.getByAltText('Thumbnail gambar placeholder: Artikel Maskom');
    expect(thumbnail).toBeInTheDocument();

    const quoteImage = screen.getByAltText('Tanda kutip dekoratif');
    expect(quoteImage).toBeInTheDocument();
  });

  it('renders post navigation buttons', () => {
    render(<BlogDetailsArea />);
    
    expect(screen.getByText('Previous Post')).toBeInTheDocument();
    expect(screen.getByText('Next Post')).toBeInTheDocument();
  });

  it('renders post navigation with proper links', () => {
    const { container } = render(<BlogDetailsArea />);
    
    const links = container.querySelectorAll('.post-nav a');
    expect(links.length).toBe(2);
    links.forEach(link => {
      expect(link).toHaveAttribute('href', '/blog-details');
    });
  });

  it('renders comments section heading', () => {
    render(<BlogDetailsArea />);
    
    const heading = screen.getByText('Leave a Reply');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H3');
  });

  it('renders BlogForm component', () => {
    render(<BlogDetailsArea />);
    
    const form = screen.getByTestId('blog-form');
    expect(form).toBeInTheDocument();
  });

  it('renders BlogSidebar component', () => {
    render(<BlogDetailsArea />);
    
    const sidebar = screen.getByTestId('blog-sidebar');
    expect(sidebar).toBeInTheDocument();
  });

  it('renders layout with proper grid columns', () => {
    const { container } = render(<BlogDetailsArea />);
    
    const blogColumn = container.querySelector('.col-xl-8');
    expect(blogColumn).toBeInTheDocument();
  });

  it('renders social share buttons', () => {
    render(<BlogDetailsArea />);
    
    expect(screen.getByLabelText('Share on Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Share on Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('Share on LinkedIn')).toBeInTheDocument();
    expect(screen.getByLabelText('Share on Instagram')).toBeInTheDocument();
  });

  it('renders tags and categories', () => {
    render(<BlogDetailsArea />);
    
    expect(screen.getByText('Managed Service,')).toBeInTheDocument();
    expect(screen.getByText('Konektivitas')).toBeInTheDocument();
  });

  it('renders post meta with icons', () => {
    const { container } = render(<BlogDetailsArea />);
    
    expect(container.querySelector('.fa-calendar-alt')).toBeInTheDocument();
    expect(container.querySelector('.fa-user-circle')).toBeInTheDocument();
    expect(container.querySelector('.fa-tag')).toBeInTheDocument();
  });

  it('renders check list with icons', () => {
    const { container } = render(<BlogDetailsArea />);
    
    const checkIcons = container.querySelectorAll('.flaticon-check');
    expect(checkIcons.length).toBe(3);
  });

  it('renders figure element for thumbnail', () => {
    const { container } = render(<BlogDetailsArea />);
    
    const figure = container.querySelector('figure');
    expect(figure).toBeInTheDocument();
  });

  it('renders article element for blog post', () => {
    const { container } = render(<BlogDetailsArea />);
    
    const article = container.querySelector('article');
    expect(article).toBeInTheDocument();
  });

  it('renders time element for date', () => {
    const { container } = render(<BlogDetailsArea />);
    
    const timeElement = container.querySelector('time');
    expect(timeElement).toBeInTheDocument();
  });

  it('renders cite element for blockquote', () => {
    const { container } = render(<BlogDetailsArea />);
    
    const citeElement = container.querySelector('cite');
    expect(citeElement).toBeInTheDocument();
  });

  it('renders gradient-btn class on navigation buttons', () => {
    const { container } = render(<BlogDetailsArea />);
    
    const buttons = container.querySelectorAll('.gradient-btn');
    expect(buttons.length).toBe(2);
  });

  it('renders theme-btn class on navigation buttons', () => {
    const { container } = render(<BlogDetailsArea />);
    
    const buttons = container.querySelectorAll('.theme-btn');
    expect(buttons.length).toBe(2);
  });

  it('renders share icon', () => {
    const { container } = render(<BlogDetailsArea />);
    
    const shareIcon = container.querySelector('.flaticon-share');
    expect(shareIcon).toBeInTheDocument();
  });

  it('renders post thumbnail with wow animation', () => {
    const { container } = render(<BlogDetailsArea />);
    
    const thumbnail = container.querySelector('.post-thumbnail');
    expect(thumbnail).toBeInTheDocument();
    expect(thumbnail).toHaveClass('wow');
    expect(thumbnail).toHaveClass('fadeInDown');
  });

  it('renders post content with wow animation', () => {
    const { container } = render(<BlogDetailsArea />);
    
    const content = container.querySelector('.post-content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass('wow');
    expect(content).toHaveClass('fadeInUp');
  });

  it('renders comments section with wow animation', () => {
    const { container } = render(<BlogDetailsArea />);
    
    const comments = container.querySelector('.ac-comments_respond');
    expect(comments).toBeInTheDocument();
    expect(comments).toHaveClass('wow');
    expect(comments).toHaveClass('fadeInUp');
  });

  it('renders post navigation with wow animation', () => {
    const { container } = render(<BlogDetailsArea />);
    
    const nav = container.querySelector('.ac-post-navigation');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass('wow');
    expect(nav).toHaveClass('fadeInUp');
  });

  it('renders layout with row and container', () => {
    const { container } = render(<BlogDetailsArea />);
    
    const row = container.querySelector('.row');
    const containerDiv = container.querySelector('.container');
    
    expect(row).toBeInTheDocument();
    expect(containerDiv).toBeInTheDocument();
  });

  it('has proper spacing classes', () => {
    const { container } = render(<BlogDetailsArea />);
    
    const section = container.querySelector('.blog-details-section');
    expect(section).toHaveClass('pt-120');
    expect(section).toHaveClass('pb-80');
  });

  it('renders thumbnail from single_blog prop when provided', () => {
    render(<BlogDetailsArea single_blog={mockBlogPost} />);

    const thumbnail = screen.getByAltText('Thumbnail gambar artikel: Test Blog Post Title');
    expect(thumbnail).toBeInTheDocument();
  });

  it('renders default thumbnail when single_blog prop not provided', () => {
    render(<BlogDetailsArea />);

    const thumbnail = screen.getByAltText('Thumbnail gambar placeholder: Artikel Maskom');
    expect(thumbnail).toBeInTheDocument();
  });

  it('renders Indonesian content correctly', () => {
    render(<BlogDetailsArea />);
    
    expect(screen.getByText('Leave a Reply')).toBeInTheDocument();
    expect(screen.getByText('Previous Post')).toBeInTheDocument();
    expect(screen.getByText('Next Post')).toBeInTheDocument();
  });
});
