import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Cta from '../Cta';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt?: string; [key: string]: unknown }) => (
    <img alt={alt} {...props as React.ImgHTMLAttributes<HTMLImageElement>} />
  ),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('Cta', () => {
  describe('Rendering & Structure', () => {
    it('renders CTA section with proper classes', () => {
      const { container } = render(<Cta />);

      expect(container.querySelector('.cta-section')).toBeInTheDocument();
    });

    it('renders section with container', () => {
      const { container } = render(<Cta />);

      const section = container.querySelector('.cta-section');
      expect(section?.querySelector('.container')).toBeInTheDocument();
    });

    it('renders CTA wrapper', () => {
      const { container } = render(<Cta />);

      expect(container.querySelector('.cta-wrapper_one')).toBeInTheDocument();
    });

    it('renders section with proper padding classes', () => {
      const { container } = render(<Cta />);

      const section = container.querySelector('.cta-section');
      expect(section).toHaveClass('pb-120');
    });
  });

  describe('Layout & Columns', () => {
    it('renders content in two columns', () => {
      const { container } = render(<Cta />);

      const cols = container.querySelectorAll('.col-lg-6');
      expect(cols.length).toBe(2);
    });

    it('renders row with proper alignment', () => {
      const { container } = render(<Cta />);

      const row = container.querySelector('.cta-wrapper_one .row');
      expect(row).toHaveClass('align-items-center');
    });

    it('renders content box in first column', () => {
      const { container } = render(<Cta />);

      const contentBox = container.querySelector('.cta-one_content-box');
      expect(contentBox).toBeInTheDocument();
    });

    it('renders image box in second column', () => {
      const { container } = render(<Cta />);

      const imageBox = container.querySelector('.cta-one_image-box');
      expect(imageBox).toBeInTheDocument();
    });
  });

  describe('Content & Typography', () => {
    it('renders heading text', () => {
      render(<Cta />);

      expect(screen.getByText('Bangun Infrastruktur Digital yang Tangguh')).toBeInTheDocument();
    });

    it('renders description paragraph', () => {
      render(<Cta />);

      expect(screen.getByText(/Maskom siap mendampingi perjalanan transformasi digital/i)).toBeInTheDocument();
    });

    it('renders CTA button', () => {
      render(<Cta />);

      const button = screen.getByRole('link', { name: /Konsultasi dengan Kami/i });
      expect(button).toBeInTheDocument();
    });

    it('renders button with correct link', () => {
      render(<Cta />);

      const button = screen.getByRole('link', { name: /Konsultasi dengan Kami/i });
      expect(button).toHaveAttribute('href', '/contact');
    });

    it('renders button with gradient class', () => {
      render(<Cta />);

      const button = screen.getByRole('link', { name: /Konsultasi dengan Kami/i });
      expect(button).toHaveClass('theme-btn');
      expect(button).toHaveClass('gradient-btn');
    });
  });

  describe('Images', () => {
    it('renders first image with alt text', () => {
      render(<Cta />);

      const image = screen.getByAltText(/Robot AI yang mendukung infrastruktur digital/i);
      expect(image).toBeInTheDocument();
    });

    it('renders second image with alt text', () => {
      render(<Cta />);

      const image = screen.getByAltText(/Dasar platform teknologi modern/i);
      expect(image).toBeInTheDocument();
    });

    it('renders first image with image-one class', () => {
      const { container } = render(<Cta />);

      const image = container.querySelector('.image-one');
      expect(image).toBeInTheDocument();
    });

    it('renders second image with image-two class', () => {
      const { container } = render(<Cta />);

      const image = container.querySelector('.image-two');
      expect(image).toBeInTheDocument();
    });

    it('renders two images total', () => {
      const { container } = render(<Cta />);

      const images = container.querySelectorAll('img');
      expect(images.length).toBe(2);
    });
  });

  describe('Styling & Classes', () => {
    it('has proper animation classes on content box', () => {
      const { container } = render(<Cta />);

      const contentBox = container.querySelector('.cta-one_content-box');
      expect(contentBox).toHaveClass('wow');
      expect(contentBox).toHaveClass('fadeInLeft');
    });

    it('has proper positioning class on image box', () => {
      const { container } = render(<Cta />);

      const imageBox = container.querySelector('.cta-one_image-box');
      expect(imageBox).toHaveClass('p-r');
      expect(imageBox).toHaveClass('z-1');
    });

    it('has proper text alignment on image box', () => {
      const { container } = render(<Cta />);

      const imageBox = container.querySelector('.cta-one_image-box');
      expect(imageBox).toHaveClass('text-xl-end');
    });

    it('renders heading with proper element type', () => {
      render(<Cta />);

      const heading = screen.getByText('Bangun Infrastruktur Digital yang Tangguh');
      expect(heading.tagName).toBe('H2');
    });
  });

  describe('Semantic HTML', () => {
    it('renders as section element', () => {
      const { container } = render(<Cta />);

      const section = container.querySelector('.cta-section');
      expect(section?.tagName).toBe('SECTION');
    });

    it('has proper row structure', () => {
      const { container } = render(<Cta />);

      const row = container.querySelector('.cta-wrapper_one .row');
      expect(row).toBeInTheDocument();
      expect(row?.tagName).toBe('DIV');
    });

    it('renders content box with heading tag', () => {
      render(<Cta />);

      const heading = screen.getByText('Bangun Infrastruktur Digital yang Tangguh');
      expect(heading.tagName).toBe('H2');
    });
  });

  describe('Accessibility', () => {
    it('has alt text for all images', () => {
      render(<Cta />);

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
        expect(img.getAttribute('alt')).toBeTruthy();
        expect(img.getAttribute('alt')).not.toBe('');
      });
    });

    it('renders button with descriptive text', () => {
      render(<Cta />);

      const button = screen.getByRole('link', { name: /Konsultasi dengan Kami/i });
      expect(button).toBeInTheDocument();
    });

    it('has link element for CTA button', () => {
      render(<Cta />);

      const button = screen.getByRole('link', { name: /Konsultasi dengan Kami/i });
      expect(button.tagName).toBe('A');
    });
  });

  describe('Edge Cases', () => {
    it('renders consistently across multiple renders', () => {
      const { container: container1 } = render(<Cta />);
      const { container: container2 } = render(<Cta />);

      expect(container1.innerHTML).toBe(container2.innerHTML);
    });

    it('has proper nesting of elements', () => {
      const { container } = render(<Cta />);

      const section = container.querySelector('.cta-section');
      const wrapper = section?.querySelector('.cta-wrapper_one');
      const row = wrapper?.querySelector('.row');

      expect(section?.contains(wrapper!)).toBe(true);
      expect(wrapper?.contains(row!)).toBe(true);
    });

    it('renders without JavaScript errors', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();

      expect(() => render(<Cta />)).not.toThrow();

      expect(consoleError).not.toHaveBeenCalled();
      consoleError.mockRestore();
    });

    it('handles all required imports', () => {
      expect(() => render(<Cta />)).not.toThrow();
    });

    it('renders content box in correct column', () => {
      const { container } = render(<Cta />);

      const cols = container.querySelectorAll('.col-lg-6');
      const contentBox = cols[0].querySelector('.cta-one_content-box');

      expect(contentBox).toBeInTheDocument();
    });

    it('renders image box in correct column', () => {
      const { container } = render(<Cta />);

      const cols = container.querySelectorAll('.col-lg-6');
      const imageBox = cols[1].querySelector('.cta-one_image-box');

      expect(imageBox).toBeInTheDocument();
    });
  });

  describe('Content Validation', () => {
    it('renders Indonesian text correctly', () => {
      render(<Cta />);

      expect(screen.getByText('Bangun Infrastruktur Digital yang Tangguh')).toBeInTheDocument();
      expect(screen.getByText('Konsultasi dengan Kami')).toBeInTheDocument();
      expect(screen.getByText(/Maskom siap mendampingi perjalanan transformasi digital/i)).toBeInTheDocument();
    });

    it('renders description text with proper content', () => {
      render(<Cta />);

      const description = screen.getByText(/Mulai dari perencanaan hingga operasional sehari-hari/i);
      expect(description).toBeInTheDocument();
    });

    it('renders button with action-oriented text', () => {
      render(<Cta />);

      const button = screen.getByRole('link', { name: /Konsultasi/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('exports default component', () => {
      expect(Cta).toBeDefined();
      expect(typeof Cta).toBe('function');
    });

    it('is a functional component', () => {
      const { container } = render(<Cta />);

      expect(container.querySelector('.cta-section')).toBeInTheDocument();
    });

    it('has no props', () => {
      const { container } = render(<Cta />);

      expect(container.querySelector('.cta-section')).toBeInTheDocument();
    });
  });
});
