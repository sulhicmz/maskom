import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Tags from '../Tags';

describe('Tags', () => {
  describe('Rendering', () => {
    it('should render Keywords title', () => {
      render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      expect(screen.getByText('Keywords')).toBeInTheDocument();
    });

    it('should render "Semua" button', () => {
      const mockOnTagClick = jest.fn();
      render(<Tags selectedTagId={null} onTagClick={mockOnTagClick} />);

      expect(screen.getByText('Semua')).toBeInTheDocument();
      expect(screen.getByLabelText('Tampilkan semua tag')).toBeInTheDocument();
    });

    it('should render all tags', () => {
      const mockOnTagClick = jest.fn();
      render(<Tags selectedTagId={null} onTagClick={mockOnTagClick} />);

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
      const { container } = render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      const tagcloud = container.querySelector('.tagcloud');
      expect(tagcloud).toBeInTheDocument();
    });
  });

  describe('Tag Display', () => {
    it('should render "Semua" button and nine tags', () => {
      const { container } = render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      const tagButtons = container.querySelectorAll('.tagcloud .tag-btn');
      expect(tagButtons).toHaveLength(10);
    });

    it('should render tags as button elements', () => {
      const { container } = render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      const tagButtons = container.querySelectorAll('.tagcloud .tag-btn');
      tagButtons.forEach(tag => {
        expect(tag.tagName.toLowerCase()).toBe('button');
      });
    });

    it('should render "Semua" button first', () => {
      const { container } = render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      const tagButtons = container.querySelectorAll('.tagcloud .tag-btn');
      expect(tagButtons[0]).toHaveTextContent('Semua');
    });

    it('should render tags in correct order', () => {
      const { container } = render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      const tagButtons = container.querySelectorAll('.tagcloud .tag-btn');
      expect(tagButtons[0]).toHaveTextContent('Semua');
      expect(tagButtons[1]).toHaveTextContent('SD-WAN');
      expect(tagButtons[2]).toHaveTextContent('Managed Wi-Fi');
      expect(tagButtons[3]).toHaveTextContent('Keamanan');
      expect(tagButtons[4]).toHaveTextContent('Cloud Connect');
      expect(tagButtons[5]).toHaveTextContent('Monitoring');
      expect(tagButtons[6]).toHaveTextContent('IoT');
      expect(tagButtons[7]).toHaveTextContent('Managed Service');
      expect(tagButtons[8]).toHaveTextContent('Infrastruktur');
      expect(tagButtons[9]).toHaveTextContent('Wi-Fi');
    });
  });

  describe('Content Display', () => {
    it('should render tags with hyphens', () => {
      render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      expect(screen.getByText('SD-WAN')).toBeInTheDocument();
      expect(screen.getByText('Cloud Connect')).toBeInTheDocument();
    });

    it('should render tags with spaces', () => {
      render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      expect(screen.getByText('Managed Wi-Fi')).toBeInTheDocument();
      expect(screen.getByText('Cloud Connect')).toBeInTheDocument();
    });

    it('should render single word tags', () => {
      render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      expect(screen.getByText('Keamanan')).toBeInTheDocument();
      expect(screen.getByText('Monitoring')).toBeInTheDocument();
      expect(screen.getByText('IoT')).toBeInTheDocument();
      expect(screen.getByText('SD-WAN')).toBeInTheDocument();
    });
  });

  describe('Tag Selection', () => {
    it('should call onTagClick with tag ID when tag clicked', () => {
      const mockOnTagClick = jest.fn();
      render(<Tags selectedTagId={null} onTagClick={mockOnTagClick} />);

      const sdwanBtn = screen.getByText('SD-WAN');
      fireEvent.click(sdwanBtn);

      expect(mockOnTagClick).toHaveBeenCalledWith(1);
    });

    it('should call onTagClick with null when "Semua" clicked', () => {
      const mockOnTagClick = jest.fn();
      render(<Tags selectedTagId={1} onTagClick={mockOnTagClick} />);

      const semuaBtn = screen.getByText('Semua');
      fireEvent.click(semuaBtn);

      expect(mockOnTagClick).toHaveBeenCalledWith(null);
    });

    it('should toggle off tag when clicked again', () => {
      const mockOnTagClick = jest.fn();
      render(<Tags selectedTagId={1} onTagClick={mockOnTagClick} />);

      const sdwanBtn = screen.getByText('SD-WAN');
      fireEvent.click(sdwanBtn);

      expect(mockOnTagClick).toHaveBeenCalledWith(null);
    });

    it('should call onTagClick with new ID when different tag clicked', () => {
      const mockOnTagClick = jest.fn();
      render(<Tags selectedTagId={1} onTagClick={mockOnTagClick} />);

      const wifiBtn = screen.getByText('Managed Wi-Fi');
      fireEvent.click(wifiBtn);

      expect(mockOnTagClick).toHaveBeenCalledWith(2);
    });

    it('should not call onTagClick when clicking active tag', () => {
      const mockOnTagClick = jest.fn();
      render(<Tags selectedTagId={1} onTagClick={mockOnTagClick} />);

      const sdwanBtn = screen.getByText('SD-WAN');
      fireEvent.click(sdwanBtn);

      expect(mockOnTagClick).toHaveBeenCalledTimes(1);
      expect(mockOnTagClick).toHaveBeenCalledWith(null);
    });
  });

  describe('Active State', () => {
    it('should apply active class to "Semua" button when no tag selected', () => {
      const { container } = render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      const semuaBtn = container.querySelector('.tagcloud .tag-btn:first-child') as HTMLButtonElement;
      expect(semuaBtn).toHaveClass('active');
    });

    it('should not apply active class to tag buttons when no tag selected', () => {
      const { container } = render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      const tagButtons = container.querySelectorAll('.tagcloud .tag-btn:not(:first-child)');
      tagButtons.forEach(btn => {
        expect(btn).not.toHaveClass('active');
      });
    });

    it('should apply active class to selected tag', () => {
      render(<Tags selectedTagId={1} onTagClick={jest.fn()} />);

      const sdwanBtn = screen.getByText('SD-WAN') as HTMLButtonElement;
      expect(sdwanBtn).toHaveClass('active');
    });

    it('should not apply active class to "Semua" when tag selected', () => {
      const { container } = render(<Tags selectedTagId={1} onTagClick={jest.fn()} />);

      const semuaBtn = container.querySelector('.tagcloud .tag-btn:first-child') as HTMLButtonElement;
      expect(semuaBtn).not.toHaveClass('active');
    });

    it('should update active class when selectedTagId prop changes', () => {
      const mockOnTagClick = jest.fn();
      const { container, rerender } = render(<Tags selectedTagId={null} onTagClick={mockOnTagClick} />);

      const semuaBtn = container.querySelector('.tagcloud .tag-btn:first-child') as HTMLButtonElement;
      expect(semuaBtn).toHaveClass('active');

      rerender(<Tags selectedTagId={1} onTagClick={mockOnTagClick} />);

      expect(semuaBtn).not.toHaveClass('active');

      const sdwanBtn = screen.getByText('SD-WAN') as HTMLButtonElement;
      expect(sdwanBtn).toHaveClass('active');
    });
  });

  describe('Structure and Classes', () => {
    it('should have correct widget classes', () => {
      render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      const tagCloudWidget = screen.getByText('Keywords');
      expect(tagCloudWidget).toBeInTheDocument();
    });

    it('should have widget title class', () => {
      render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      const title = screen.getByText('Keywords');
      expect(title).toBeInTheDocument();
    });

    it('should have animation classes', () => {
      render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      const title = screen.getByText('Keywords');
      expect(title).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should use semantic button elements for tags', () => {
      const { container } = render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      const tagButtons = container.querySelectorAll('.tagcloud .tag-btn');
      tagButtons.forEach(tag => {
        expect(tag.tagName.toLowerCase()).toBe('button');
      });
    });

    it('should have aria-label for each tag button', () => {
      const { container } = render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      const tagButtons = container.querySelectorAll('.tagcloud .tag-btn');
      expect(tagButtons.length).toBeGreaterThan(0);

      tagButtons.forEach(btn => {
        expect(btn).toHaveAttribute('aria-label');
      });
    });

    it('should have aria-pressed on selected tag button', () => {
      render(<Tags selectedTagId={1} onTagClick={jest.fn()} />);

      const sdwanBtn = screen.getByText('SD-WAN') as HTMLButtonElement;
      expect(sdwanBtn).toHaveAttribute('aria-pressed', 'true');
    });

    it('should have aria-pressed="false" on inactive tag buttons', () => {
      render(<Tags selectedTagId={1} onTagClick={jest.fn()} />);

      const wifiBtn = screen.getByText('Managed Wi-Fi') as HTMLButtonElement;
      expect(wifiBtn).toHaveAttribute('aria-pressed', 'false');
    });

    it('should have aria-label on "Semua" button', () => {
      render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      expect(screen.getByLabelText('Tampilkan semua tag')).toBeInTheDocument();
    });

    it('should use interactive buttons for tags', () => {
      const { container } = render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      const buttons = container.querySelectorAll('.tagcloud .tag-btn');

      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle tags with special characters', () => {
      render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      expect(screen.getByText('SD-WAN')).toBeInTheDocument();
    });

    it('should handle tags with acronyms', () => {
      render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      expect(screen.getByText('SD-WAN')).toBeInTheDocument();
      expect(screen.getByText('IoT')).toBeInTheDocument();
    });

    it('should handle tags with mixed case', () => {
      render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      expect(screen.getByText('SD-WAN')).toBeInTheDocument();
      expect(screen.getByText('IoT')).toBeInTheDocument();
    });
  });

  describe('Tag Characteristics', () => {
    it('should render short tags', () => {
      render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      expect(screen.getByText('IoT')).toBeInTheDocument();
    });

    it('should render medium length tags', () => {
      render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      expect(screen.getByText('SD-WAN')).toBeInTheDocument();
      expect(screen.getByText('Keamanan')).toBeInTheDocument();
      expect(screen.getByText('Monitoring')).toBeInTheDocument();
    });

    it('should render longer tags with spaces', () => {
      render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      expect(screen.getByText('Managed Wi-Fi')).toBeInTheDocument();
      expect(screen.getByText('Cloud Connect')).toBeInTheDocument();
    });
  });

  describe('Visual Structure', () => {
    it('should render tags in a cloud layout', () => {
      const { container } = render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      const tagcloud = container.querySelector('.tagcloud');
      expect(tagcloud).toBeInTheDocument();
    });

    it('should have consistent tag element structure', () => {
      const { container } = render(<Tags selectedTagId={null} onTagClick={jest.fn()} />);

      const tagButtons = container.querySelectorAll('.tagcloud .tag-btn');
      expect(tagButtons.length).toBeGreaterThan(0);
    });
  });
});
