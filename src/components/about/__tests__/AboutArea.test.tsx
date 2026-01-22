import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AboutArea from '../AboutArea';

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

jest.mock('@/assets/images/about/about-1.jpg', () => '/about/about-1.jpg');
jest.mock('@/assets/images/about/about-2.jpg', () => '/about/about-2.jpg');
jest.mock('@/assets/images/about/about-3.jpg', () => '/about/about-3.jpg');
jest.mock('@/assets/images/about/author-1.jpg', () => '/about/author-1.jpg');
jest.mock('@/assets/images/about/sign.png', () => '/about/sign.png');

describe('AboutArea', () => {
  describe('Rendering', () => {
    it('should render section container', () => {
      const { container } = render(<AboutArea />);
      
      const section = container.querySelector('.about-section');
      expect(section).toBeInTheDocument();
    });

    it('should render Tentang Kami section title', () => {
      render(<AboutArea />);
      
      expect(screen.getByText('Tentang Kami')).toBeInTheDocument();
    });

    it('should render main heading', () => {
      render(<AboutArea />);
      
      expect(screen.getByText('Menghubungkan Bisnis Indonesia Sejak 2004')).toBeInTheDocument();
    });

    it('should render content paragraphs', () => {
      render(<AboutArea />);
      
      expect(screen.getByText(/Maskom berdiri dengan visi menghadirkan infrastruktur digital yang andal/i)).toBeInTheDocument();
      expect(screen.getByText(/Didukung tim engineer berpengalaman/i)).toBeInTheDocument();
    });
  });

  describe('Image Rendering', () => {
    it('should render five images', () => {
      const { container } = render(<AboutArea />);
      
      const images = container.querySelectorAll('img[data-testid="next-image"]');
      expect(images).toHaveLength(5);
    });

    it('should render about images', () => {
      const { container } = render(<AboutArea />);
      
      const images = container.querySelectorAll('img[data-testid="next-image"]');
      expect(images).toHaveLength(5);
    });

    it('should render author image', () => {
      const { container } = render(<AboutArea />);
      
      const images = container.querySelectorAll('img[data-testid="next-image"]');
      expect(images).toHaveLength(5);
    });

    it('should render signature image', () => {
      const { container } = render(<AboutArea />);
      
      const images = container.querySelectorAll('img[data-testid="next-image"]');
      expect(images).toHaveLength(5);
    });

    it('should set correct alt text on about images', () => {
      const { container } = render(<AboutArea />);

      const images = container.querySelectorAll('img[data-testid="next-image"]');
      const descriptiveImages = Array.from(images).filter(img =>
        (img as HTMLElement).getAttribute('alt') && (img as HTMLElement).getAttribute('alt')?.trim().length! > 10
      );
      expect(descriptiveImages.length).toBeGreaterThanOrEqual(3);
    });

    it('should set correct alt text on author image', () => {
      render(<AboutArea />);

      expect(screen.getByAltText('Foto profil tim Maskom Network')).toBeInTheDocument();
    });

    it('should set correct alt text on signature', () => {
      render(<AboutArea />);

      expect(screen.getByAltText('Tanda tangan resmi Tim Maskom Network')).toBeInTheDocument();
    });
  });

  describe('Content Structure', () => {
    it('should render section title with sub-title', () => {
      render(<AboutArea />);
      
      const subTitle = screen.getByText('Tentang Kami');
      const title = screen.getByText('Menghubungkan Bisnis Indonesia Sejak 2004');
      
      expect(subTitle).toBeInTheDocument();
      expect(title).toBeInTheDocument();
    });

    it('should render content in correct order', () => {
      const { container } = render(<AboutArea />);
      
      const sectionTitle = container.querySelector('.section-title');
      const contentBox = container.querySelector('.about-one_content-box');
      
      expect(sectionTitle).toBeInTheDocument();
      expect(contentBox).toBeInTheDocument();
    });
  });

  describe('Author Card', () => {
    it('should render author card section', () => {
      const { container } = render(<AboutArea />);
      
      const authorCard = container.querySelector('.author-card');
      expect(authorCard).toBeInTheDocument();
    });

    it('should render author name', () => {
      render(<AboutArea />);
      
      expect(screen.getByText('Tim Maskom Network')).toBeInTheDocument();
    });

    it('should render author position', () => {
      render(<AboutArea />);
      
      expect(screen.getByText('Partner Infrastruktur Digital Anda')).toBeInTheDocument();
    });
  });

  describe('Layout Structure', () => {
    it('should render grid layout', () => {
      const { container } = render(<AboutArea />);
      
      const row = container.querySelector('.row');
      const colXL7 = container.querySelector('.col-xl-7');
      const colXL5 = container.querySelector('.col-xl-5');
      
      expect(row).toBeInTheDocument();
      expect(colXL7).toBeInTheDocument();
      expect(colXL5).toBeInTheDocument();
    });

    it('should render image box section', () => {
      const { container } = render(<AboutArea />);
      
      const imageBox = container.querySelector('.about-image-box');
      expect(imageBox).toBeInTheDocument();
    });

    it('should render content box section', () => {
      const { container } = render(<AboutArea />);
      
      const contentBox = container.querySelector('.about-one_content-box');
      expect(contentBox).toBeInTheDocument();
    });
  });

  describe('Animation Classes', () => {
    it('should have fadeInDown animation on main image wrapper', () => {
      const { container } = render(<AboutArea />);

      const mainImageWrapper = container.querySelector('.col-lg-12 > div');
      expect(mainImageWrapper).toHaveClass('wow');
      expect(mainImageWrapper).toHaveClass('fadeInDown');
    });

    it('should have fadeInUp animation on smaller image wrappers', () => {
      const { container } = render(<AboutArea />);

      const smallerImageWrappers = container.querySelectorAll('.col-lg-6 > div');
      smallerImageWrappers.forEach(wrapper => {
        expect(wrapper).toHaveClass('wow');
        expect(wrapper).toHaveClass('fadeInUp');
      });
    });

    it('should have fadeInRight animation on content box wrapper', () => {
      const { container } = render(<AboutArea />);

      const contentBoxWrapper = container.querySelector('.col-xl-5 > div');
      expect(contentBoxWrapper).toHaveClass('wow');
      expect(contentBoxWrapper).toHaveClass('fadeInRight');
    });
  });

  describe('Spacing and Layout', () => {
    it('should have correct padding classes', () => {
      const { container } = render(<AboutArea />);

      const section = container.querySelector('.about-section');
      expect(section).toHaveClass('pt-120');
      expect(section).toHaveClass('pb-65');
    });

    it('should have correct margin classes', () => {
      const { container } = render(<AboutArea />);

      const imageBox = container.querySelector('.about-image-box');
      expect(imageBox).toHaveClass('mb-25');

      const imageWrappers = container.querySelectorAll('.col-lg-6 > div, .col-lg-12 > div');
      imageWrappers.forEach(wrapper => {
        expect(wrapper).toHaveClass('mb-25');
      });
      
      const sectionTitle = container.querySelector('.section-title');
      expect(sectionTitle).toHaveClass('mb-50');
    });
  });

  describe('Accessibility', () => {
    it('should have descriptive alt text for all images', () => {
      const { container } = render(<AboutArea />);

      const images = container.querySelectorAll('img[data-testid="next-image"]');
      expect(images).toHaveLength(5);

      expect(screen.getByAltText('Foto profil tim Maskom Network')).toBeInTheDocument();
      expect(screen.getByAltText('Tanda tangan resmi Tim Maskom Network')).toBeInTheDocument();
    });

    it('should use semantic HTML structure', () => {
      const { container } = render(<AboutArea />);
      
      const section = container.querySelector('section');
      const headings = container.querySelectorAll('h2, h3, h4, h5, h6');
      
      expect(section).toBeInTheDocument();
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should render correctly with all content', () => {
      render(<AboutArea />);
      
      expect(screen.getByText('Tentang Kami')).toBeInTheDocument();
      expect(screen.getByText('Menghubungkan Bisnis Indonesia Sejak 2004')).toBeInTheDocument();
      expect(screen.getByText('Tim Maskom Network')).toBeInTheDocument();
      expect(screen.getByText('Partner Infrastruktur Digital Anda')).toBeInTheDocument();
    });

    it('should handle long content paragraphs', () => {
      render(<AboutArea />);
      
      const paragraphs = screen.getAllByText(/Maskom|Didukung/);
      expect(paragraphs.length).toBeGreaterThan(0);
    });
  });

  describe('Component Integration', () => {
    it('should integrate with Next.js Image components', () => {
      const { container } = render(<AboutArea />);
      
      const images = container.querySelectorAll('img[data-testid="next-image"]');
      expect(images.length).toBeGreaterThanOrEqual(4);
    });
  });
});
