import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WebsiteTemplate } from '@/types/data';
import WebsiteBuilder from '../WebsiteBuilder';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className, loading }: { 
    src: string; 
    alt: string; 
    width: number; 
    height: number; 
    className: string; 
    loading?: 'lazy' | 'eager' | undefined 
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading}
      data-testid="next-image"
    />
  ),
}));

describe('WebsiteBuilder', () => {
  const mockTemplates: WebsiteTemplate[] = [
    {
      id: 1,
      name: 'Modern Business',
      preview: '/templates/business.jpg',
    },
    {
      id: 2,
      name: 'Portfolio',
      preview: '/templates/portfolio.jpg',
    },
    {
      id: 3,
      name: 'E-Commerce',
      preview: '/templates/ecommerce.jpg',
    },
  ];

  describe('Rendering', () => {
    it('should render Website Builder title', () => {
      render(<WebsiteBuilder templates={mockTemplates} />);
      
      expect(screen.getByText('Website Builder')).toBeInTheDocument();
    });

    it('should render template selection section', () => {
      render(<WebsiteBuilder templates={mockTemplates} />);
      
      expect(screen.getByText('Select Template')).toBeInTheDocument();
    });

    it('should render editor section', () => {
      render(<WebsiteBuilder templates={mockTemplates} />);
      
      expect(screen.getByText('Editor')).toBeInTheDocument();
    });

    it('should render all templates', () => {
      render(<WebsiteBuilder templates={mockTemplates} />);
      
      expect(screen.getByText('Modern Business')).toBeInTheDocument();
      expect(screen.getByText('Portfolio')).toBeInTheDocument();
      expect(screen.getByText('E-Commerce')).toBeInTheDocument();
    });
  });

  describe('Template Cards', () => {
    it('should render template images', () => {
      const { container } = render(<WebsiteBuilder templates={mockTemplates} />);
      
      const images = container.querySelectorAll('img[data-testid="next-image"]');
      expect(images).toHaveLength(3);
    });

    it('should render template names', () => {
      render(<WebsiteBuilder templates={mockTemplates} />);
      
      expect(screen.getByText('Modern Business')).toBeInTheDocument();
      expect(screen.getByText('Portfolio')).toBeInTheDocument();
      expect(screen.getByText('E-Commerce')).toBeInTheDocument();
    });

    it('should render Use Template button for each template', () => {
      const { container } = render(<WebsiteBuilder templates={mockTemplates} />);
      
      const buttons = container.querySelectorAll('.card-body .btn-primary');
      expect(buttons).toHaveLength(3);
    });
  });

  describe('Editor Section', () => {
    it('should render textarea with placeholder', () => {
      render(<WebsiteBuilder templates={mockTemplates} />);
      
      const textarea = screen.getByPlaceholderText('Edit your website content here...');
      expect(textarea).toBeInTheDocument();
    });

    it('should render textarea with custom placeholder', () => {
      render(<WebsiteBuilder 
        templates={mockTemplates} 
        editorPlaceholder="Custom placeholder text" 
      />);
      
      const textarea = screen.getByPlaceholderText('Custom placeholder text');
      expect(textarea).toBeInTheDocument();
    });

    it('should render textarea with correct rows attribute', () => {
      const { container } = render(<WebsiteBuilder templates={mockTemplates} />);
      
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveAttribute('rows', '10');
    });
  });

  describe('Action Buttons', () => {
    it('should render Preview button', () => {
      render(<WebsiteBuilder templates={mockTemplates} />);
      
      const previewButton = screen.getByText('Preview');
      expect(previewButton).toBeInTheDocument();
      expect(previewButton).toHaveClass('btn-success');
    });

    it('should render Publish button', () => {
      render(<WebsiteBuilder templates={mockTemplates} />);
      
      const publishButton = screen.getByText('Publish');
      expect(publishButton).toBeInTheDocument();
      expect(publishButton).toHaveClass('btn-secondary');
    });

    it('should render buttons in correct order', () => {
      const { container } = render(<WebsiteBuilder templates={mockTemplates} />);
      
      const buttons = container.querySelectorAll('.btn');
      expect(buttons.length).toBeGreaterThanOrEqual(4); 
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty templates array', () => {
      render(<WebsiteBuilder templates={[]} />);
      
      expect(screen.getByText('Website Builder')).toBeInTheDocument();
      expect(screen.getByText('Select Template')).toBeInTheDocument();
    });

    it('should handle single template', () => {
      const singleTemplate = [mockTemplates[0]];
      
      render(<WebsiteBuilder templates={singleTemplate} />);
      
      expect(screen.getByText('Modern Business')).toBeInTheDocument();
    });

    it('should handle templates with special characters in name', () => {
      const specialTemplates: WebsiteTemplate[] = [
        {
          id: 1,
          name: "O'Connor's Template",
          preview: '/templates/special.jpg',
        },
      ];
      
      render(<WebsiteBuilder templates={specialTemplates} />);
      
      expect(screen.getByText("O'Connor's Template")).toBeInTheDocument();
    });

    it('should handle templates with very long name', () => {
      const longNameTemplates: WebsiteTemplate[] = [
        {
          id: 1,
          name: 'Very long template name that might break the layout if not handled properly',
          preview: '/templates/long.jpg',
        },
      ];
      
      render(<WebsiteBuilder templates={longNameTemplates} />);
      
      expect(screen.getByText('Very long template name that might break the layout if not handled properly')).toBeInTheDocument();
    });
  });

  describe('Image Attributes', () => {
    it('should set correct width and height on images', () => {
      const { container } = render(<WebsiteBuilder templates={mockTemplates} />);
      
      const images = container.querySelectorAll('img[data-testid="next-image"]');
      images.forEach(img => {
        expect(img).toHaveAttribute('width', '300');
        expect(img).toHaveAttribute('height', '200');
      });
    });

    it('should set lazy loading on images', () => {
      const { container } = render(<WebsiteBuilder templates={mockTemplates} />);
      
      const images = container.querySelectorAll('img[data-testid="next-image"]');
      images.forEach(img => {
        expect(img).toHaveAttribute('loading', 'lazy');
      });
    });

    it('should set correct alt text on images', () => {
      const { container } = render(<WebsiteBuilder templates={mockTemplates} />);
      
      const images = container.querySelectorAll('img[data-testid="next-image"]');
      expect(images[0]).toHaveAttribute('alt', 'Modern Business');
      expect(images[1]).toHaveAttribute('alt', 'Portfolio');
      expect(images[2]).toHaveAttribute('alt', 'E-Commerce');
    });
  });

  describe('Layout Structure', () => {
    it('should render templates in grid layout', () => {
      const { container } = render(<WebsiteBuilder templates={mockTemplates} />);
      
      const row = container.querySelector('.template-selection .row');
      expect(row).toBeInTheDocument();
    });

    it('should render template cards with correct classes', () => {
      const { container } = render(<WebsiteBuilder templates={mockTemplates} />);
      
      const cards = container.querySelectorAll('.col-md-4 .card');
      expect(cards).toHaveLength(3);
    });
  });
});
