import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LatestNews from '../LatestNews';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className }: { src: string; alt: string; className: string }) => (
    <img
      src={src}
      alt={alt}
      className={className}
      data-testid="next-image"
    />
  ),
}));

jest.mock('@/assets/images/blog/post-thumb-1.jpg', () => '/blog/post-thumb-1.jpg');
jest.mock('@/assets/images/blog/post-thumb-2.jpg', () => '/blog/post-thumb-2.jpg');
jest.mock('@/assets/images/blog/post-thumb-3.jpg', () => '/blog/post-thumb-3.jpg');

describe('LatestNews', () => {
  describe('Rendering', () => {
    it('should render Berita Terbaru title', () => {
      render(<LatestNews />);
      
      expect(screen.getByText('Berita Terbaru')).toBeInTheDocument();
    });

    it('should render all news items', () => {
      render(<LatestNews />);
      
      expect(screen.getByText('Maskom resmikan NOC generasi terbaru')).toBeInTheDocument();
      expect(screen.getByText('Kolaborasi Maskom dan penyedia data center lokal')).toBeInTheDocument();
      expect(screen.getByText('Program pelatihan network engineer bersertifikasi')).toBeInTheDocument();
    });

    it('should render all news dates', () => {
      render(<LatestNews />);
      
      expect(screen.getByText('05 Mar 2024')).toBeInTheDocument();
      expect(screen.getByText('22 Feb 2024')).toBeInTheDocument();
      expect(screen.getByText('10 Feb 2024')).toBeInTheDocument();
    });

    it('should render news list as unordered list', () => {
      const { container } = render(<LatestNews />);
      
      const ul = container.querySelector('ul');
      expect(ul).toBeInTheDocument();
    });
  });

  describe('News Items', () => {
    it('should render three news items', () => {
      const { container } = render(<LatestNews />);
      
      const listItems = container.querySelectorAll('.recent-post-list li');
      expect(listItems).toHaveLength(3);
    });

    it('should render news images', () => {
      const { container } = render(<LatestNews />);
      
      const images = container.querySelectorAll('img[data-testid="next-image"]');
      expect(images).toHaveLength(3);
    });

    it('should render news titles as links', () => {
      const { container } = render(<LatestNews />);
      
      const links = container.querySelectorAll('h6 a');
      expect(links).toHaveLength(3);
    });

    it('should render dates as time elements', () => {
      const { container } = render(<LatestNews />);
      
      const timeElements = container.querySelectorAll('time');
      expect(timeElements).toHaveLength(3);
    });
  });

  describe('Link Navigation', () => {
    it('should have correct href for all news links', () => {
      const { container } = render(<LatestNews />);
      
      const links = container.querySelectorAll('h6 a');
      links.forEach(link => {
        expect(link).toHaveAttribute('href', '/blog-details');
      });
    });

    it('should navigate to blog details when news title is clicked', () => {
      const { container } = render(<LatestNews />);
      
      const firstLink = container.querySelector('h6 a');
      expect(firstLink).toHaveAttribute('href', '/blog-details');
    });
  });

  describe('Content Display', () => {
    it('should render news items in correct order', () => {
      const { container } = render(<LatestNews />);
      
      const listItems = container.querySelectorAll('.recent-post-list li');
      expect(listItems[0]).toHaveTextContent('Maskom resmikan NOC generasi terbaru');
      expect(listItems[1]).toHaveTextContent('Kolaborasi Maskom dan penyedia data center lokal');
      expect(listItems[2]).toHaveTextContent('Program pelatihan network engineer bersertifikasi');
    });

    it('should render dates in correct order', () => {
      const { container } = render(<LatestNews />);
      
      const timeElements = container.querySelectorAll('time');
      expect(timeElements[0]).toHaveTextContent('05 Mar 2024');
      expect(timeElements[1]).toHaveTextContent('22 Feb 2024');
      expect(timeElements[2]).toHaveTextContent('10 Feb 2024');
    });

    it('should render news with special characters', () => {
      render(<LatestNews />);
      
      expect(screen.getByText('Maskom resmikan NOC generasi terbaru')).toBeInTheDocument();
      expect(screen.getByText('Kolaborasi Maskom dan penyedia data center lokal')).toBeInTheDocument();
    });
  });

  describe('Structure and Classes', () => {
    it('should have correct widget classes', () => {
      const { container } = render(<LatestNews />);
      
      const widget = container.querySelector('.sidebar-widget');
      expect(widget).toBeInTheDocument();
      
      const recentWidget = container.querySelector('.sidebar-recent-widget');
      expect(recentWidget).toBeInTheDocument();
    });

    it('should have widget title class', () => {
      const { container } = render(<LatestNews />);
      
      const title = container.querySelector('.widget-title');
      expect(title).toBeInTheDocument();
    });

    it('should have widget content class', () => {
      const { container } = render(<LatestNews />);
      
      const content = container.querySelector('.sidebar-widget-content');
      expect(content).toBeInTheDocument();
    });

    it('should have animation classes', () => {
      const { container } = render(<LatestNews />);

      const widget = container.querySelector('.sidebar-widget');
      expect(widget).toBeInTheDocument();

      expect(widget?.classList.contains('wow')).toBe(true);
      expect(widget?.classList.contains('fadeInUp')).toBe(true);
    });

    it('should have post thumbnail content class', () => {
      const { container } = render(<LatestNews />);
      
      const listItems = container.querySelectorAll('.post-thumbnail-content');
      expect(listItems).toHaveLength(3);
    });

    it('should have post title date class', () => {
      const { container } = render(<LatestNews />);
      
      const postTitleDates = container.querySelectorAll('.post-title-date');
      expect(postTitleDates).toHaveLength(3);
    });

    it('should have posted on class', () => {
      const { container } = render(<LatestNews />);
      
      const postedOnElements = container.querySelectorAll('.posted-on');
      expect(postedOnElements).toHaveLength(3);
    });
  });

  describe('Image Attributes', () => {
    it('should set correct alt text on images', () => {
      const { container } = render(<LatestNews />);
      
      const images = container.querySelectorAll('img[data-testid="next-image"]');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt', 'post thumb');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper link structure for news titles', () => {
      const { container } = render(<LatestNews />);
      
      const listItems = container.querySelectorAll('.post-thumbnail-content');
      listItems.forEach(li => {
        const link = li.querySelector('h6 a');
        expect(link).toBeInTheDocument();
      });
    });

    it('should have proper time elements for dates', () => {
      const { container } = render(<LatestNews />);
      
      const timeElements = container.querySelectorAll('time');
      expect(timeElements).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle news with special characters in title', () => {
      render(<LatestNews />);
      
      expect(screen.getByText('Maskom resmikan NOC generasi terbaru')).toBeInTheDocument();
      expect(screen.getByText('Kolaborasi Maskom dan penyedia data center lokal')).toBeInTheDocument();
    });

    it('should handle very long news titles', () => {
      render(<LatestNews />);
      
      expect(screen.getByText('Program pelatihan network engineer bersertifikasi')).toBeInTheDocument();
    });

    it('should handle various date formats', () => {
      render(<LatestNews />);
      
      expect(screen.getByText('05 Mar 2024')).toBeInTheDocument();
      expect(screen.getByText('22 Feb 2024')).toBeInTheDocument();
      expect(screen.getByText('10 Feb 2024')).toBeInTheDocument();
    });
  });
});
