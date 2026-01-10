import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContactArea from '../ContactArea';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('ContactArea', () => {
  describe('Rendering', () => {
    it('should render section container', () => {
      render(<ContactArea />);
      
      const section = document.querySelector('.contact-info-section');
      expect(section).toBeInTheDocument();
    });

    it('should render all contact info cards', () => {
      render(<ContactArea />);
      
      expect(screen.getByText('Kantor Pusat')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Telepon')).toBeInTheDocument();
    });

    it('should render three contact info boxes', () => {
      const { container } = render(<ContactArea />);
      
      const infoBoxes = container.querySelectorAll('.iconic-info-box');
      expect(infoBoxes).toHaveLength(3);
    });
  });

  describe('Contact Information', () => {
    it('should render address information', () => {
      render(<ContactArea />);
      
      expect(screen.getByText('Kantor Pusat')).toBeInTheDocument();
      expect(screen.getByText('Maskom Network', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('Jakarta Selatan', { exact: false })).toBeInTheDocument();
    });

    it('should render email addresses', () => {
      render(<ContactArea />);
      
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('sales@maskom.co.id')).toBeInTheDocument();
      expect(screen.getByText('support@maskom.co.id')).toBeInTheDocument();
    });

    it('should render phone numbers', () => {
      render(<ContactArea />);
      
      expect(screen.getByText('Telepon')).toBeInTheDocument();
      expect(screen.getByText('(+62) 817-000-6625')).toBeInTheDocument();
      expect(screen.getByText('WhatsApp Business')).toBeInTheDocument();
    });
  });

  describe('Icon Rendering', () => {
    it('should render all icons', () => {
      const { container } = render(<ContactArea />);
      
      const icons = container.querySelectorAll('.icon i');
      expect(icons).toHaveLength(3);
    });

    it('should render location icon', () => {
      const { container } = render(<ContactArea />);
      
      const locationIcon = container.querySelector('.fa-map-marker-alt');
      expect(locationIcon).toBeInTheDocument();
    });

    it('should render email icon', () => {
      const { container } = render(<ContactArea />);
      
      const emailIcon = container.querySelector('.fa-envelope-open');
      expect(emailIcon).toBeInTheDocument();
    });

    it('should render phone icon', () => {
      const { container } = render(<ContactArea />);
      
      const phoneIcon = container.querySelector('.fa-phone-alt');
      expect(phoneIcon).toBeInTheDocument();
    });
  });

  describe('Link Navigation', () => {
    it('should render email links', () => {
      const { container } = render(<ContactArea />);
      
      const emailLinks = container.querySelectorAll('a[href^="mailto:"]');
      expect(emailLinks.length).toBeGreaterThan(0);
    });

    it('should have correct email hrefs', () => {
      const { container } = render(<ContactArea />);
      
      const emailLinks = container.querySelectorAll('a[href^="mailto:"]');
      const salesLink = emailLinks[0];
      const supportLink = emailLinks[1];
      
      expect(salesLink).toBeInTheDocument();
      expect(salesLink).toHaveAttribute('href', 'mailto:sales@maskom.co.id');
      expect(supportLink).toBeInTheDocument();
      expect(supportLink).toHaveAttribute('href', 'mailto:support@maskom.co.id');
    });

    it('should render phone link', () => {
      const { container } = render(<ContactArea />);
      
      const phoneLink = container.querySelector('a[href="tel:+628170006625"]');
      expect(phoneLink).toBeInTheDocument();
      expect(phoneLink).toHaveAttribute('href', 'tel:+628170006625');
    });

    it('should render WhatsApp link', () => {
      const { container } = render(<ContactArea />);
      
      const whatsappLink = container.querySelector('a[href^="https://wa.me/"]');
      expect(whatsappLink).toBeInTheDocument();
      expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/628170006625');
    });

    it('should have correct target and rel attributes for external links', () => {
      const { container } = render(<ContactArea />);
      
      const whatsappLink = container.querySelector('a[href^="https://wa.me/"]');
      expect(whatsappLink).toHaveAttribute('target', '_blank');
      expect(whatsappLink).toHaveAttribute('rel', 'noreferrer');
    });
  });

  describe('Layout Structure', () => {
    it('should render in grid layout', () => {
      const { container } = render(<ContactArea />);
      
      const row = container.querySelector('.row');
      expect(row).toBeInTheDocument();
    });

    it('should render contact info boxes with correct classes', () => {
      const { container } = render(<ContactArea />);
      
      const infoBoxes = container.querySelectorAll('.iconic-info-box.style-five');
      expect(infoBoxes).toHaveLength(3);
    });

    it('should have responsive column classes', () => {
      const { container } = render(<ContactArea />);
      
      const cols = container.querySelectorAll('.col-lg-4, .col-md-6, .col-sm-12');
      expect(cols.length).toBeGreaterThan(0);
    });
  });

  describe('Content Order', () => {
    it('should render contact info in correct order', () => {
      const { container } = render(<ContactArea />);
      
      const infoBoxes = container.querySelectorAll('.iconic-info-box');
      expect(infoBoxes[0]).toHaveTextContent('Kantor Pusat');
      expect(infoBoxes[1]).toHaveTextContent('Email');
      expect(infoBoxes[2]).toHaveTextContent('Telepon');
    });
  });

  describe('Spacing and Layout', () => {
    it('should have correct padding classes', () => {
      const { container } = render(<ContactArea />);
      
      const section = container.querySelector('.contact-info-section');
      expect(section).toHaveClass('pt-40');
      expect(section).toHaveClass('pb-80');
    });

    it('should have correct margin classes', () => {
      const { container } = render(<ContactArea />);
      
      const infoBoxes = container.querySelectorAll('.iconic-info-box');
      infoBoxes.forEach(box => {
        expect(box).toHaveClass('mb-40');
      });
    });
  });

  describe('Icon and Content Structure', () => {
    it('should render icon sections', () => {
      const { container } = render(<ContactArea />);
      
      const icons = container.querySelectorAll('.icon');
      expect(icons).toHaveLength(3);
    });

    it('should render content sections', () => {
      const { container } = render(<ContactArea />);
      
      const contents = container.querySelectorAll('.content');
      expect(contents).toHaveLength(3);
    });

    it('should render headings for each contact info', () => {
      const { container } = render(<ContactArea />);
      
      const headings = container.querySelectorAll('.content h5');
      expect(headings).toHaveLength(3);
    });
  });

  describe('Animation Classes', () => {
    it('should have fadeInUp animation class', () => {
      const { container } = render(<ContactArea />);
      
      const infoBoxes = container.querySelectorAll('.iconic-info-box');
      infoBoxes.forEach(box => {
        expect(box).toHaveClass('wow');
        expect(box).toHaveClass('fadeInUp');
      });
    });
  });

  describe('Accessibility', () => {
    it('should use semantic HTML structure', () => {
      const { container } = render(<ContactArea />);
      
      const section = container.querySelector('section');
      const headings = container.querySelectorAll('h2, h3, h4, h5, h6');
      
      expect(section).toBeInTheDocument();
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have accessible links with proper hrefs', () => {
      const { container } = render(<ContactArea />);
      
      const emailLinks = container.querySelectorAll('a[href^="mailto:"]');
      const phoneLink = container.querySelector('a[href^="tel:"]');
      const externalLink = container.querySelector('a[href^="https:"]');
      
      expect(emailLinks.length).toBeGreaterThan(0);
      expect(phoneLink).toBeInTheDocument();
      expect(externalLink).toBeInTheDocument();
    });

    it('should have proper rel attributes for external links', () => {
      const { container } = render(<ContactArea />);
      
      const whatsappLink = container.querySelector('a[href^="https://wa.me/"]');
      expect(whatsappLink).toHaveAttribute('rel', 'noreferrer');
    });
  });

  describe('Edge Cases', () => {
    it('should render correctly with all contact information', () => {
      render(<ContactArea />);
      
      expect(screen.getByText('Kantor Pusat')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Telepon')).toBeInTheDocument();
      expect(screen.getByText('sales@maskom.co.id')).toBeInTheDocument();
      expect(screen.getByText('support@maskom.co.id')).toBeInTheDocument();
      expect(screen.getByText('(+62) 817-000-6625')).toBeInTheDocument();
      expect(screen.getByText('WhatsApp Business')).toBeInTheDocument();
    });

    it('should handle phone numbers with special characters', () => {
      render(<ContactArea />);
      
      expect(screen.getByText('(+62) 817-000-6625')).toBeInTheDocument();
    });

    it('should handle email addresses with @ symbol', () => {
      render(<ContactArea />);
      
      expect(screen.getByText('sales@maskom.co.id')).toBeInTheDocument();
      expect(screen.getByText('support@maskom.co.id')).toBeInTheDocument();
    });
  });

  describe('Component Integration', () => {
    it('should integrate with Next.js Link components', () => {
      const { container } = render(<ContactArea />);
      
      const links = container.querySelectorAll('a');
      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive column classes', () => {
      const { container } = render(<ContactArea />);
      
      const colXLMD = container.querySelectorAll('.col-xl-4, .col-md-6, .col-sm-12');
      
      expect(colXLMD.length).toBeGreaterThan(0);
    });

    it('should have justify-content-center class', () => {
      const { container } = render(<ContactArea />);
      
      const row = container.querySelector('.row');
      expect(row).toHaveClass('justify-content-center');
    });
  });
});
