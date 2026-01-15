import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Tags from '../Tags';

describe('Tags', () => {
  const defaultProps = {
    selectedTagId: null,
    onTagClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render Keywords title', () => {
      render(<Tags {...defaultProps} />);
      
      expect(screen.getByText('Keywords')).toBeInTheDocument();
    });

    it('should render all tags', () => {
      render(<Tags {...defaultProps} />);

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
      const { container } = render(<Tags {...defaultProps} />);
      
      const tagcloud = container.querySelector('.tagcloud');
      expect(tagcloud).toBeInTheDocument();
    });
  });

  describe('Tag Display', () => {
    it('should render nine tags', () => {
      const { container } = render(<Tags {...defaultProps} />);

      const tagElements = container.querySelectorAll('.tagcloud button');
      expect(tagElements).toHaveLength(9);
    });

    it('should render tags in correct order', () => {
      const { container } = render(<Tags {...defaultProps} />);

      const tagElements = container.querySelectorAll('.tagcloud button');
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

    it('should render tags as button elements', () => {
      const { container } = render(<Tags {...defaultProps} />);
      
      const tagElements = container.querySelectorAll('.tagcloud button');
      tagElements.forEach(tag => {
        expect(tag.tagName.toLowerCase()).toBe('button');
      });
    });

    it('should have active class on selected tag', () => {
      const { container } = render(<Tags selectedTagId={1} onTagClick={jest.fn()} />);

      const activeTag = container.querySelector('.tagcloud button.active');
      expect(activeTag).toBeInTheDocument();
      expect(activeTag).toHaveTextContent('SD-WAN');
    });

    it('should not have active class when no tag selected', () => {
      const { container } = render(<Tags {...defaultProps} />);

      const activeTag = container.querySelector('.tagcloud button.active');
      expect(activeTag).not.toBeInTheDocument();
    });
  });

  describe('Tag Interaction', () => {
    it('should call onTagClick when tag is clicked', () => {
      const handleClick = jest.fn();
      render(<Tags {...defaultProps} onTagClick={handleClick} />);

      const tag = screen.getByText('SD-WAN');
      fireEvent.click(tag);

      expect(handleClick).toHaveBeenCalledWith(1);
    });

    it('should call onTagClick with null when same tag is clicked', () => {
      const handleClick = jest.fn();
      render(<Tags selectedTagId={1} onTagClick={handleClick} />);

      const tag = screen.getByText('SD-WAN');
      fireEvent.click(tag);

      expect(handleClick).toHaveBeenCalledWith(null);
    });

    it('should show clear filter button when tag is selected', () => {
      render(<Tags selectedTagId={1} onTagClick={jest.fn()} />);

      const clearButton = screen.getByText('Hapus Filter');
      expect(clearButton).toBeInTheDocument();
    });

    it('should not show clear filter button when no tag selected', () => {
      render(<Tags {...defaultProps} />);

      const clearButton = screen.queryByText('Hapus Filter');
      expect(clearButton).not.toBeInTheDocument();
    });

    it('should call onTagClick with null when clear button is clicked', () => {
      const handleClick = jest.fn();
      render(<Tags selectedTagId={1} onTagClick={handleClick} />);

      const clearButton = screen.getByText('Hapus Filter');
      fireEvent.click(clearButton);

      expect(handleClick).toHaveBeenCalledWith(null);
    });

    it('should toggle tag selection on repeated clicks', () => {
      const handleClick = jest.fn();
      const { rerender } = render(<Tags {...defaultProps} onTagClick={handleClick} />);

      const tag = screen.getByText('SD-WAN');
      fireEvent.click(tag);
      expect(handleClick).toHaveBeenCalledWith(1);

      rerender(<Tags selectedTagId={1} onTagClick={handleClick} />);
      fireEvent.click(tag);
      expect(handleClick).toHaveBeenCalledWith(null);
    });
  });

  describe('Accessibility', () => {
    it('should use button elements for interactive tags', () => {
      const { container } = render(<Tags {...defaultProps} />);

      const tagElements = container.querySelectorAll('.tagcloud button');
      tagElements.forEach(tag => {
        expect(tag.tagName.toLowerCase()).toBe('button');
      });
    });

    it('should have aria-label for each tag button', () => {
      const { container } = render(<Tags {...defaultProps} />);

      const tagButtons = container.querySelectorAll('.tagcloud button');
      tagButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should have aria-pressed set correctly for unselected tag', () => {
      const { container } = render(<Tags {...defaultProps} />);

      const tagButtons = container.querySelectorAll('.tagcloud button');
      tagButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-pressed', 'false');
      });
    });

    it('should have aria-pressed set correctly for selected tag', () => {
      const { container } = render(<Tags selectedTagId={1} onTagClick={jest.fn()} />);

      const activeTag = container.querySelector('.tagcloud button.active');
      expect(activeTag).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have aria-label for clear filter button', () => {
      render(<Tags selectedTagId={1} onTagClick={jest.fn()} />);

      const clearButton = screen.getByText('Hapus Filter');
      expect(clearButton).toHaveAttribute('aria-label', 'Hapus filter keyword');
    });

    it('should use semantic button elements for tags', () => {
      const { container } = render(<Tags {...defaultProps} />);

      const buttons = container.querySelectorAll('.tagcloud button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Content Display', () => {
    it('should render tags with hyphens', () => {
      render(<Tags {...defaultProps} />);
      
      expect(screen.getByText('SD-WAN')).toBeInTheDocument();
      expect(screen.getByText('Cloud Connect')).toBeInTheDocument();
    });

    it('should render tags with spaces', () => {
      render(<Tags {...defaultProps} />);
      
      expect(screen.getByText('Managed Wi-Fi')).toBeInTheDocument();
      expect(screen.getByText('Cloud Connect')).toBeInTheDocument();
    });

    it('should render single word tags', () => {
      render(<Tags {...defaultProps} />);

      expect(screen.getByText('Keamanan')).toBeInTheDocument();
      expect(screen.getByText('Monitoring')).toBeInTheDocument();
      expect(screen.getByText('IoT')).toBeInTheDocument();
      expect(screen.getByText('SD-WAN')).toBeInTheDocument();
    });
  });

  describe('Structure and Classes', () => {
    it('should have correct widget classes', () => {
      const { container } = render(<Tags {...defaultProps} />);
      
      const widget = container.querySelector('.sidebar-widget');
      expect(widget).toBeInTheDocument();
      
      const tagCloudWidget = container.querySelector('.tag-cloud-widget');
      expect(tagCloudWidget).toBeInTheDocument();
    });

    it('should have widget title class', () => {
      const { container } = render(<Tags {...defaultProps} />);
      
      const title = container.querySelector('.widget-title');
      expect(title).toBeInTheDocument();
    });

    it('should have animation classes', () => {
      const { container } = render(<Tags {...defaultProps} />);
      
      const widget = container.querySelector('.sidebar-widget');
      expect(widget).toBeInTheDocument();

      const animatedDiv = widget!.querySelector('.wow.fadeInUp');
      expect(animatedDiv).toBeInTheDocument();
    });

    it('should add active class to selected tag', () => {
      const { container } = render(<Tags selectedTagId={1} onTagClick={jest.fn()} />);

      const activeTag = container.querySelector('.tagcloud button.active');
      expect(activeTag).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle tags with special characters', () => {
      render(<Tags {...defaultProps} />);
      
      expect(screen.getByText('SD-WAN')).toBeInTheDocument();
    });

    it('should handle tags with acronyms', () => {
      render(<Tags {...defaultProps} />);
      
      expect(screen.getByText('SD-WAN')).toBeInTheDocument();
      expect(screen.getByText('IoT')).toBeInTheDocument();
    });

    it('should handle tags with mixed case', () => {
      render(<Tags {...defaultProps} />);
      
      expect(screen.getByText('SD-WAN')).toBeInTheDocument();
      expect(screen.getByText('IoT')).toBeInTheDocument();
    });

    it('should handle rapid tag clicks', () => {
      const handleClick = jest.fn();
      render(<Tags {...defaultProps} onTagClick={handleClick} />);

      const tag1 = screen.getByText('SD-WAN');
      const tag2 = screen.getByText('IoT');

      fireEvent.click(tag1);
      fireEvent.click(tag2);
      fireEvent.click(tag1);

      expect(handleClick).toHaveBeenCalledTimes(3);
      expect(handleClick).toHaveBeenNthCalledWith(1, 1);
      expect(handleClick).toHaveBeenNthCalledWith(2, 6);
      expect(handleClick).toHaveBeenNthCalledWith(3, 1);
    });
  });

  describe('Tag Characteristics', () => {
    it('should render short tags', () => {
      render(<Tags {...defaultProps} />);
      
      expect(screen.getByText('IoT')).toBeInTheDocument();
    });

    it('should render medium length tags', () => {
      render(<Tags {...defaultProps} />);
      
      expect(screen.getByText('SD-WAN')).toBeInTheDocument();
      expect(screen.getByText('Keamanan')).toBeInTheDocument();
      expect(screen.getByText('Monitoring')).toBeInTheDocument();
    });

    it('should render longer tags with spaces', () => {
      render(<Tags {...defaultProps} />);
      
      expect(screen.getByText('Managed Wi-Fi')).toBeInTheDocument();
      expect(screen.getByText('Cloud Connect')).toBeInTheDocument();
    });
  });

  describe('Visual Structure', () => {
    it('should render tags in a cloud layout', () => {
      const { container } = render(<Tags {...defaultProps} />);

      const tagcloud = container.querySelector('.tagcloud');
      expect(tagcloud).toBeInTheDocument();
    });

    it('should have consistent tag element structure', () => {
      const { container } = render(<Tags {...defaultProps} />);

      const tagElements = container.querySelectorAll('.tagcloud button');
      tagElements.forEach(tag => {
        expect(tag.textContent).toBeTruthy();
        expect(tag).toHaveAttribute('aria-label');
        expect(tag).toHaveAttribute('aria-pressed');
      });
    });
  });
});
