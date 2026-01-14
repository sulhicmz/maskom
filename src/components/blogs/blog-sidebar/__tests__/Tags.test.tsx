import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Tags from '../Tags';

describe('Tags', () => {
  describe('Rendering', () => {
    it('should render Keywords title', () => {
      render(<Tags />);
      
      expect(screen.getByText('Keywords')).toBeInTheDocument();
    });

    it('should render all tags', () => {
      render(<Tags />);

      expect(screen.getByText('SD-WAN')).toBeInTheDocument();
      expect(screen.getByText('Managed Wi-Fi')).toBeInTheDocument();
      expect(screen.getByText('Keamanan')).toBeInTheDocument();
      expect(screen.getByText('Cloud Connect')).toBeInTheDocument();
      expect(screen.getByText('Monitoring')).toBeInTheDocument();
      expect(screen.getByText('IoT')).toBeInTheDocument();
      expect(screen.getByText('Managed Service')).toBeInTheDocument();
      expect(screen.getByText('Infrastruktur')).toBeInTheDocument();
      expect(screen.getByText('Wi-Fi')).toBeInTheDocument();
    });

    it('should render tagcloud container', () => {
      const { container } = render(<Tags />);
      
      const tagcloud = container.querySelector('.tagcloud');
      expect(tagcloud).toBeInTheDocument();
    });
  });

  describe('Tag Display', () => {
    it('should render nine tags', () => {
      const { container } = render(<Tags />);

      const tagElements = container.querySelectorAll('.tagcloud a');
      expect(tagElements).toHaveLength(9);
    });

    it('should render tags in correct order', () => {
      const { container } = render(<Tags />);

      const tagElements = container.querySelectorAll('.tagcloud a');
      expect(tagElements[0]).toHaveTextContent('SD-WAN');
      expect(tagElements[1]).toHaveTextContent('Managed Wi-Fi');
      expect(tagElements[2]).toHaveTextContent('Keamanan');
      expect(tagElements[3]).toHaveTextContent('Cloud Connect');
      expect(tagElements[4]).toHaveTextContent('Monitoring');
      expect(tagElements[5]).toHaveTextContent('IoT');
      expect(tagElements[6]).toHaveTextContent('Managed Service');
      expect(tagElements[7]).toHaveTextContent('Infrastruktur');
      expect(tagElements[8]).toHaveTextContent('Wi-Fi');
    });

    it('should render tags as link elements', () => {
      const { container } = render(<Tags />);
      
      const tagElements = container.querySelectorAll('.tagcloud a');
      tagElements.forEach(tag => {
        expect(tag.tagName.toLowerCase()).toBe('a');
      });
    });
  });

  describe('Content Display', () => {
    it('should render tags with hyphens', () => {
      render(<Tags />);
      
      expect(screen.getByText('SD-WAN')).toBeInTheDocument();
      expect(screen.getByText('Cloud Connect')).toBeInTheDocument();
    });

    it('should render tags with spaces', () => {
      render(<Tags />);
      
      expect(screen.getByText('Managed Wi-Fi')).toBeInTheDocument();
      expect(screen.getByText('Cloud Connect')).toBeInTheDocument();
    });

    it('should render single word tags', () => {
      render(<Tags />);

      expect(screen.getByText('Keamanan')).toBeInTheDocument();
      expect(screen.getByText('Monitoring')).toBeInTheDocument();
      expect(screen.getByText('IoT')).toBeInTheDocument();
      expect(screen.getByText('SD-WAN')).toBeInTheDocument();
    });
  });

  describe('Structure and Classes', () => {
    it('should have correct widget classes', () => {
      const { container } = render(<Tags />);
      
      const widget = container.querySelector('.sidebar-widget');
      expect(widget).toBeInTheDocument();
      
      const tagCloudWidget = container.querySelector('.tag-cloud-widget');
      expect(tagCloudWidget).toBeInTheDocument();
    });

    it('should have widget title class', () => {
      const { container } = render(<Tags />);
      
      const title = container.querySelector('.widget-title');
      expect(title).toBeInTheDocument();
    });

    it('should have animation classes', () => {
      const { container } = render(<Tags />);
      
      const widget = container.querySelector('.sidebar-widget');
      expect(widget).toBeInTheDocument();

      const animatedDiv = widget!.querySelector('.wow.fadeInUp');
      expect(animatedDiv).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should use semantic link elements for tags', () => {
      const { container } = render(<Tags />);

      const tagElements = container.querySelectorAll('.tagcloud a');
      tagElements.forEach(tag => {
        expect(tag.tagName.toLowerCase()).toBe('a');
      });
    });

    it('should have aria-label for each tag link', () => {
      const { container } = render(<Tags />);

      const tagLinks = container.querySelectorAll('.tagcloud a');
      tagLinks.forEach(link => {
        expect(link).toHaveAttribute('aria-label');
      });
    });

    it('should use interactive links for tags', () => {
      const { container } = render(<Tags />);

      const links = container.querySelectorAll('.tagcloud a');

      expect(links.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle tags with special characters', () => {
      render(<Tags />);
      
      expect(screen.getByText('SD-WAN')).toBeInTheDocument();
    });

    it('should handle tags with acronyms', () => {
      render(<Tags />);
      
      expect(screen.getByText('SD-WAN')).toBeInTheDocument();
      expect(screen.getByText('IoT')).toBeInTheDocument();
    });

    it('should handle tags with mixed case', () => {
      render(<Tags />);
      
      expect(screen.getByText('SD-WAN')).toBeInTheDocument();
      expect(screen.getByText('IoT')).toBeInTheDocument();
    });
  });

  describe('Tag Characteristics', () => {
    it('should render short tags', () => {
      render(<Tags />);
      
      expect(screen.getByText('IoT')).toBeInTheDocument();
    });

    it('should render medium length tags', () => {
      render(<Tags />);
      
      expect(screen.getByText('SD-WAN')).toBeInTheDocument();
      expect(screen.getByText('Keamanan')).toBeInTheDocument();
      expect(screen.getByText('Monitoring')).toBeInTheDocument();
    });

    it('should render longer tags with spaces', () => {
      render(<Tags />);
      
      expect(screen.getByText('Managed Wi-Fi')).toBeInTheDocument();
      expect(screen.getByText('Cloud Connect')).toBeInTheDocument();
    });
  });

  describe('Visual Structure', () => {
    it('should render tags in a cloud layout', () => {
      const { container } = render(<Tags />);

      const tagcloud = container.querySelector('.tagcloud');
      expect(tagcloud).toBeInTheDocument();
    });

    it('should have consistent tag element structure', () => {
      const { container } = render(<Tags />);

      const tagElements = container.querySelectorAll('.tagcloud a');
      tagElements.forEach(tag => {
        expect(tag.textContent).toBeTruthy();
      });
    });
  });
});
