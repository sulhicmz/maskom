import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Skill from '../Skill';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt?: string; [key: string]: unknown }) => (
    <img alt={alt} {...props as React.ImgHTMLAttributes<HTMLImageElement>} />
  ),
}));

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (importFn: () => Promise<{ default: React.ComponentType }>) => {
    const importStr = importFn.toString();
    if (importStr.includes('VideoPopup')) {
      const MockVideoPopup = ({ isVideoOpen, setIsVideoOpen }: { isVideoOpen: boolean; setIsVideoOpen: (value: boolean) => void }) => (
        <div data-testid="video-popup" data-open={isVideoOpen}>
          <button onClick={() => setIsVideoOpen(false)} data-testid="close-video">Close</button>
        </div>
      );
      MockVideoPopup.displayName = 'MockVideoPopup';
      return MockVideoPopup as unknown as React.ComponentType;
    }
    return React.Fragment;
  },
}));

describe('Skill', () => {
  describe('Rendering & Structure', () => {
    it('renders skill section with proper classes', () => {
      const { container } = render(<Skill />);

      expect(container.querySelector('.skill-section')).toBeInTheDocument();
    });

    it('renders section with container', () => {
      const { container } = render(<Skill />);

      const section = container.querySelector('.skill-section');
      expect(section).toBeInTheDocument();
    });

    it('renders skill thumbnail image', () => {
      render(<Skill />);

      expect(screen.getByAltText('Skill Image')).toBeInTheDocument();
    });

    it('renders play button', () => {
      const { container } = render(<Skill />);

      const playButton = container.querySelector('.video-popup');
      expect(playButton).toBeInTheDocument();
    });

    it('renders section title', () => {
      render(<Skill />);

      expect(screen.getByText('My Skills')).toBeInTheDocument();
    });

    it('renders skill items', () => {
      const { container } = render(<Skill />);

      const skillItems = container.querySelectorAll('.skill-item');
      expect(skillItems.length).toBeGreaterThan(0);
    });

    it('renders video popup component', () => {
      render(<Skill />);

      expect(screen.getByTestId('video-popup')).toBeInTheDocument();
    });

    it('has proper semantic HTML structure', () => {
      const { container } = render(<Skill />);

      const section = container.querySelector('.skill-section');
      expect(section).toBeInTheDocument();
      expect(section?.querySelector('.container')).toBeInTheDocument();
    });

    it('renders content in two columns', () => {
      const { container } = render(<Skill />);

      const cols = container.querySelectorAll('.col-xl-7, .col-xl-5');
      expect(cols.length).toBe(2);
    });

    it('renders skill content box', () => {
      const { container } = render(<Skill />);

      const contentBox = container.querySelector('.skill-content-box');
      expect(contentBox).toBeInTheDocument();
    });

    it('renders skill image box', () => {
      const { container } = render(<Skill />);

      const imageBox = container.querySelector('.skill-one_image-box');
      expect(imageBox).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('renders video popup in closed state initially', () => {
      render(<Skill />);

      const videoPopup = screen.getByTestId('video-popup');
      expect(videoPopup).toHaveAttribute('data-open', 'false');
    });

    it('opens video popup when play button is clicked', () => {
      const { container } = render(<Skill />);

      const playButton = container.querySelector('.video-popup');
      fireEvent.click(playButton!);

      const videoPopup = screen.getByTestId('video-popup');
      expect(videoPopup).toHaveAttribute('data-open', 'true');
    });

    it('closes video popup when close button is clicked', () => {
      const { container } = render(<Skill />);

      const playButton = container.querySelector('.video-popup');
      fireEvent.click(playButton!);

      const closeButton = screen.getByTestId('close-video');
      fireEvent.click(closeButton);

      const videoPopup = screen.getByTestId('video-popup');
      expect(videoPopup).toHaveAttribute('data-open', 'false');
    });

    it('maintains state independently across interactions', () => {
      const { container } = render(<Skill />);

      const playButton = container.querySelector('.video-popup');
      const closeButton = screen.getByTestId('close-video');

      fireEvent.click(playButton!);
      expect(screen.getByTestId('video-popup')).toHaveAttribute('data-open', 'true');

      fireEvent.click(closeButton);
      expect(screen.getByTestId('video-popup')).toHaveAttribute('data-open', 'false');

      fireEvent.click(playButton!);
      expect(screen.getByTestId('video-popup')).toHaveAttribute('data-open', 'true');
    });

    it('handles multiple rapid play button clicks correctly', () => {
      const { container } = render(<Skill />);

      const playButton = container.querySelector('.video-popup');

      fireEvent.click(playButton!);
      fireEvent.click(playButton!);
      fireEvent.click(playButton!);

      const videoPopup = screen.getByTestId('video-popup');
      expect(videoPopup).toHaveAttribute('data-open', 'true');
    });
  });

  describe('Content & Typography', () => {
    it('renders main heading', () => {
      render(<Skill />);

      expect(screen.getByText('My Skills')).toBeInTheDocument();
    });

    it('renders description text', () => {
      render(<Skill />);

      expect(screen.getByText(/technologies/i)).toBeInTheDocument();
    });

    it('renders Analytical skill heading', () => {
      const { container } = render(<Skill />);

      const analyticalHeadings = container.querySelectorAll('h5');
      expect(Array.from(analyticalHeadings).some(h => h.textContent?.includes('Analytical'))).toBe(true);
    });

    it('renders Problem solving skill heading', () => {
      const { container } = render(<Skill />);

      const problemSolvingHeadings = container.querySelectorAll('h5');
      expect(Array.from(problemSolvingHeadings).some(h => h.textContent?.includes('Problem solving'))).toBe(true);
    });

    it('renders Determination skill heading', () => {
      const { container } = render(<Skill />);

      const determinationHeadings = container.querySelectorAll('h5');
      expect(Array.from(determinationHeadings).some(h => h.textContent?.includes('Determination'))).toBe(true);
    });

    it('renders skill bars', () => {
      const { container } = render(<Skill />);

      const skillBars = container.querySelectorAll('.skill-bar');
      expect(skillBars.length).toBe(4);
    });

    it('renders skill percentage values', () => {
      const { container } = render(<Skill />);

      const skillCounts = container.querySelectorAll('[class*="skill-count"]');
      expect(skillCounts.length).toBeGreaterThan(0);
    });

    it('renders discover my bio text', () => {
      render(<Skill />);

      expect(screen.getByText('Discover my bio')).toBeInTheDocument();
    });
  });

  describe('Layout & Styling', () => {
    it('has proper section padding classes', () => {
      const { container } = render(<Skill />);

      const section = container.querySelector('.skill-section');
      expect(section).toHaveClass('pb-70');
    });

    it('has proper animation classes', () => {
      const { container } = render(<Skill />);

      const fadeInLeft = container.querySelector('.fadeInLeft');
      const fadeInRight = container.querySelector('.fadeInRight');
      expect(fadeInLeft || fadeInRight).toBeInTheDocument();
    });

    it('has proper row structure', () => {
      const { container } = render(<Skill />);

      const row = container.querySelector('.row');
      expect(row).toBeInTheDocument();
    });

    it('has proper alignment for columns', () => {
      const { container } = render(<Skill />);

      const row = container.querySelector('.row');
      expect(row).toHaveClass('align-items-center');
    });

    it('renders skill items with proper classes', () => {
      const { container } = render(<Skill />);

      const skillItems = container.querySelectorAll('.skill-item.style-one');
      expect(skillItems.length).toBe(4);
    });

    it('renders skill bars with proper animation classes', () => {
      const { container } = render(<Skill />);

      const skillBars = container.querySelectorAll('.skill-bar.slideInLeft');
      expect(skillBars.length).toBe(4);
    });

    it('renders image overlay', () => {
      const { container } = render(<Skill />);

      const overlay = container.querySelector('.image-overlay');
      expect(overlay).toBeInTheDocument();
    });

    it('renders play button container', () => {
      const { container } = render(<Skill />);

      const playButtonContainer = container.querySelector('.play-button');
      expect(playButtonContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('renders play button with proper cursor pointer', () => {
      const { container } = render(<Skill />);

      const playButton = container.querySelector('.video-popup');
      expect(playButton).toHaveStyle({ cursor: 'pointer' });
    });

    it('renders play icon correctly', () => {
      const { container } = render(<Skill />);

      const playIcon = container.querySelector('.flaticon-play-button-arrowhead');
      expect(playIcon).toBeInTheDocument();
    });

    it('renders skill item 1 with 73%', () => {
      const { container } = render(<Skill />);

      const firstSkillCount = container.querySelector('.skill-count2');
      expect(firstSkillCount?.textContent).toBe('73%');
    });

    it('renders skill item 2 with 80%', () => {
      const { container } = render(<Skill />);

      const secondSkillCount = container.querySelector('.skill-count3');
      expect(secondSkillCount?.textContent).toBe('80%');
    });

    it('renders skill item 3 with 90%', () => {
      const { container } = render(<Skill />);

      const thirdSkillCount = container.querySelector('.skill-count4');
      expect(thirdSkillCount?.textContent).toBe('90%');
    });

    it('renders skill item 4 with 40%', () => {
      const { container } = render(<Skill />);

      const skillBars = container.querySelectorAll('.skill-count4');
      expect(skillBars.length).toBe(2);
      expect(skillBars[1]?.textContent).toBe('40%');
    });

    it('renders flex play button container', () => {
      const { container } = render(<Skill />);

      const playButton = container.querySelector('.play-button.d-flex');
      expect(playButton).toBeInTheDocument();
    });

    it('renders alignment items center for play button', () => {
      const { container } = render(<Skill />);

      const playButton = container.querySelector('.play-button');
      expect(playButton).toHaveClass('align-items-center');
    });
  });
});
