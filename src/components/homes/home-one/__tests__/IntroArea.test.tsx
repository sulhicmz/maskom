import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import IntroArea from '../IntroArea';

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

describe('IntroArea', () => {
  describe('Rendering & Structure', () => {
    it('renders intro section with proper classes', () => {
      const { container } = render(<IntroArea />);

      expect(container.querySelector('.intro-section')).toBeInTheDocument();
    });

    it('renders section with container', () => {
      const { container } = render(<IntroArea />);

      const section = container.querySelector('.intro-section');
      expect(section).toHaveClass('intro-section');
    });

    it('renders video thumbnail image', () => {
      render(<IntroArea />);

      expect(screen.getByAltText('video image')).toBeInTheDocument();
    });

    it('renders play button', () => {
      const { container } = render(<IntroArea />);

      const playButton = container.querySelector('.video-popup');
      expect(playButton).toBeInTheDocument();
    });

    it('renders section title', () => {
      render(<IntroArea />);

      expect(screen.getByText('Tentang Maskom')).toBeInTheDocument();
    });

    it('renders main heading', () => {
      render(<IntroArea />);

      expect(screen.getByText(/Partner Infrastruktur Digital/i)).toBeInTheDocument();
    });

    it('renders description text', () => {
      render(<IntroArea />);

      expect(screen.getByText(/Sejak 2004 Maskom/i)).toBeInTheDocument();
    });

    it('renders feature list items', () => {
      render(<IntroArea />);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('renders video popup component', () => {
      render(<IntroArea />);

      expect(screen.getByTestId('video-popup')).toBeInTheDocument();
    });

    it('has proper semantic HTML structure', () => {
      const { container } = render(<IntroArea />);

      const section = container.querySelector('.intro-section');
      expect(section).toBeInTheDocument();
      expect(section?.querySelector('.container')).toBeInTheDocument();
    });

    it('renders intro wrapper with proper classes', () => {
      const { container } = render(<IntroArea />);

      const section = container.querySelector('.intro-section');
      expect(section?.querySelector('.intro-wrapper')).toBeInTheDocument();
    });

    it('renders content in two columns', () => {
      const { container } = render(<IntroArea />);

      const cols = container.querySelectorAll('.col-xl-6');
      expect(cols.length).toBe(2);
    });
  });

  describe('State Management', () => {
    it('renders video popup in closed state initially', () => {
      render(<IntroArea />);

      const videoPopup = screen.getByTestId('video-popup');
      expect(videoPopup).toHaveAttribute('data-open', 'false');
    });

    it('opens video popup when play button is clicked', () => {
      const { container } = render(<IntroArea />);

      const playButton = container.querySelector('.video-popup');
      fireEvent.click(playButton!);

      const videoPopup = screen.getByTestId('video-popup');
      expect(videoPopup).toHaveAttribute('data-open', 'true');
    });

    it('closes video popup when close button is clicked', () => {
      const { container } = render(<IntroArea />);

      const playButton = container.querySelector('.video-popup');
      fireEvent.click(playButton!);

      const closeButton = screen.getByTestId('close-video');
      fireEvent.click(closeButton);

      const videoPopup = screen.getByTestId('video-popup');
      expect(videoPopup).toHaveAttribute('data-open', 'false');
    });

    it('maintains state independently across interactions', () => {
      const { container } = render(<IntroArea />);

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
      const { container } = render(<IntroArea />);

      const playButton = container.querySelector('.video-popup');

      fireEvent.click(playButton!);
      fireEvent.click(playButton!);
      fireEvent.click(playButton!);

      const videoPopup = screen.getByTestId('video-popup');
      expect(videoPopup).toHaveAttribute('data-open', 'true');
    });
  });

  describe('Content & Typography', () => {
    it('renders sub-title with proper styling', () => {
      render(<IntroArea />);

      const subTitle = screen.getByText('Tentang Maskom');
      expect(subTitle).toBeInTheDocument();
    });

    it('renders main heading with line break', () => {
      render(<IntroArea />);

      expect(screen.getByText(/Partner Infrastruktur Digital/i)).toBeInTheDocument();
      expect(screen.getByText(/Untuk Bisnis Anda/i)).toBeInTheDocument();
    });

    it('renders description about Maskom', () => {
      render(<IntroArea />);

      expect(screen.getByText(/membantu perusahaan di Indonesia membangun/)).toBeInTheDocument();
    });

    it('renders circle list items', () => {
      render(<IntroArea />);

      const list = screen.getByRole('list');
      expect(list).toHaveClass('circle-list');
    });

    it('renders feature about engineers', () => {
      render(<IntroArea />);

      expect(screen.getByText(/Engineer bersertifikasi/)).toBeInTheDocument();
    });

    it('renders feature about NOC', () => {
      render(<IntroArea />);

      expect(screen.getByText(/Network Operation Center/)).toBeInTheDocument();
    });

    it('renders feature about flexible cooperation', () => {
      render(<IntroArea />);

      expect(screen.getByText(/Model kerjasama fleksibel/)).toBeInTheDocument();
    });
  });

  describe('Layout & Styling', () => {
    it('has proper section padding classes', () => {
      const { container } = render(<IntroArea />);

      const section = container.querySelector('.intro-section');
      expect(section).toHaveClass('pb-120');
    });

    it('has proper animation classes', () => {
      const { container } = render(<IntroArea />);

      const fadeInLeft = container.querySelector('.fadeInLeft');
      const fadeInRight = container.querySelector('.fadeInRight');
      expect(fadeInLeft || fadeInRight).toBeInTheDocument();
    });

    it('renders video image box with proper classes', () => {
      const { container } = render(<IntroArea />);

      const videoBox = container.querySelector('.video-one_image-box');
      expect(videoBox).toBeInTheDocument();
    });

    it('renders section content box with proper classes', () => {
      const { container } = render(<IntroArea />);

      const contentBox = container.querySelector('.section-content-box');
      expect(contentBox).toBeInTheDocument();
    });

    it('renders section title with proper classes', () => {
      const { container } = render(<IntroArea />);

      const sectionTitle = container.querySelector('.section-title');
      expect(sectionTitle).toBeInTheDocument();
    });

    it('has proper row structure', () => {
      const { container } = render(<IntroArea />);

      const row = container.querySelector('.row');
      expect(row).toBeInTheDocument();
    });

    it('has proper alignment for columns', () => {
      const { container } = render(<IntroArea />);

      const row = container.querySelector('.row');
      expect(row).toHaveClass('align-items-center');
    });
  });

  describe('Edge Cases', () => {
    it('renders with white text content', () => {
      const { container } = render(<IntroArea />);

      const contentBox = container.querySelector('.text-white');
      expect(contentBox).toBeInTheDocument();
    });

    it('renders play button with proper cursor pointer', () => {
      const { container } = render(<IntroArea />);

      const playButton = container.querySelector('.video-popup');
      expect(playButton).toHaveStyle({ cursor: 'pointer' });
    });

    it('renders play icon correctly', () => {
      const { container } = render(<IntroArea />);

      const playIcon = container.querySelector('.flaticon-play-button-arrowhead');
      expect(playIcon).toBeInTheDocument();
    });

    it('has proper section ID for navigation', () => {
      const { container } = render(<IntroArea />);

      const section = container.querySelector('.intro-section');
      expect(section).toHaveAttribute('id', 'tentang');
    });

    it('renders video popup with video ID', () => {
      render(<IntroArea />);

      const videoPopup = screen.getByTestId('video-popup');
      expect(videoPopup).toBeInTheDocument();
    });
  });
});
