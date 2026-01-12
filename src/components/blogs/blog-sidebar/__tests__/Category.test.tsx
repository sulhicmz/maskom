import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Category from '../Category';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Category', () => {
  describe('Rendering', () => {
    it('should render category widget title', () => {
      render(<Category />);
      
      expect(screen.getByText('Kategori')).toBeInTheDocument();
    });

    it('should render all category links', () => {
      render(<Category />);
      
      expect(screen.getByText('Konektivitas Terkelola')).toBeInTheDocument();
      expect(screen.getByText('Keamanan Jaringan')).toBeInTheDocument();
      expect(screen.getByText('Operasional & Dukungan')).toBeInTheDocument();
      expect(screen.getByText('Transformasi Digital')).toBeInTheDocument();
      expect(screen.getByText('Infrastruktur Cloud')).toBeInTheDocument();
      expect(screen.getByText('IoT & Edge')).toBeInTheDocument();
    });

    it('should render category list as unordered list', () => {
      const { container } = render(<Category />);
      
      const ul = container.querySelector('ul');
      expect(ul).toBeInTheDocument();
    });
  });

  describe('Link Navigation', () => {
    it('should render all categories as links', () => {
      const { container } = render(<Category />);
      
      const links = container.querySelectorAll('a');
      expect(links).toHaveLength(6);
    });

    it('should have correct href for all category links', () => {
      const { container } = render(<Category />);
      
      const links = container.querySelectorAll('a');
      links.forEach(link => {
        expect(link).toHaveAttribute('href', '/blog');
      });
    });

    it('should navigate to blog page when category is clicked', () => {
      const { container } = render(<Category />);
      
      const firstLink = container.querySelector('a');
      expect(firstLink).toHaveAttribute('href', '/blog');
    });
  });

  describe('Content Display', () => {
    it('should render categories in correct order', () => {
      const { container } = render(<Category />);
      
      const links = container.querySelectorAll('a');
      expect(links[0]).toHaveTextContent('Konektivitas Terkelola');
      expect(links[1]).toHaveTextContent('Keamanan Jaringan');
      expect(links[2]).toHaveTextContent('Operasional & Dukungan');
      expect(links[3]).toHaveTextContent('Transformasi Digital');
      expect(links[4]).toHaveTextContent('Infrastruktur Cloud');
      expect(links[5]).toHaveTextContent('IoT & Edge');
    });

    it('should render category with special characters', () => {
      render(<Category />);
      
      expect(screen.getByText('Operasional & Dukungan')).toBeInTheDocument();
      expect(screen.getByText('IoT & Edge')).toBeInTheDocument();
    });
  });

  describe('Structure and Classes', () => {
    it('should have correct widget classes', () => {
      const { container } = render(<Category />);
      
      const widget = container.querySelector('.sidebar-widget');
      expect(widget).toBeInTheDocument();
      
      const categoryWidget = container.querySelector('.sidebar-category-widget');
      expect(categoryWidget).toBeInTheDocument();
    });

    it('should have widget title class', () => {
      const { container } = render(<Category />);
      
      const title = container.querySelector('.widget-title');
      expect(title).toBeInTheDocument();
    });

    it('should have widget content class', () => {
      const { container } = render(<Category />);
      
      const content = container.querySelector('.sidebar-widget-content');
      expect(content).toBeInTheDocument();
    });

    it('should have animation classes', () => {
      const { container } = render(<Category />);
      
      const widget = container.querySelector('.sidebar-widget');
      expect(widget).toBeInTheDocument();

      const animatedDiv = widget!.querySelector('.wow.fadeInUp');
      expect(animatedDiv).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle categories with special characters', () => {
      render(<Category />);
      
      const linkWithAmpersand = screen.getByText('Operasional & Dukungan');
      expect(linkWithAmpersand).toBeInTheDocument();
    });

    it('should handle categories with very long names', () => {
      render(<Category />);
      
      expect(screen.getByText('Konektivitas Terkelola')).toBeInTheDocument();
      expect(screen.getByText('Transformasi Digital')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper link structure', () => {
      const { container } = render(<Category />);
      
      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(6);
      
      listItems.forEach(li => {
        const link = li.querySelector('a');
        expect(link).toBeInTheDocument();
      });
    });
  });
});
