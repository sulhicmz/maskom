import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignUpArea from '../SignUpArea';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => <img alt={alt} src={src} {...props} />,
}));

jest.mock('next/dynamic', () => () => {
  const MockSignUpForm = () => <div data-testid="signup-form">Mock SignUpForm</div>;
  return MockSignUpForm;
});

jest.mock('@/components/common/AnimationWrapper', () => {
  // eslint-disable-next-line react/display-name
  return ({ children, animation, className }: { children: React.ReactNode; animation?: string; className?: string }) => (
    <div className={className} data-animation={animation}>
      {children}
    </div>
  );
});

describe('SignUpArea', () => {
  describe('rendering', () => {
    it('renders user section with proper structure', () => {
      const { container } = render(<SignUpArea />);
      
      const section = container.querySelector('.user-section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('pt-120');
      expect(section).toHaveClass('pb-70');
    });

    it('renders signup image box', () => {
      const { container } = render(<SignUpArea />);
      
      const imageBox = container.querySelector('.signup-image-box');
      expect(imageBox).toBeInTheDocument();
      expect(imageBox).toHaveClass('p-r');
      expect(imageBox).toHaveClass('z-1');
    });

    it('renders signup images', () => {
      render(<SignUpArea />);
      
      const robotImage = screen.getByAltText('Ilustrasi robot layanan digital Maskom');
      const baseImage = screen.getByAltText('Base ilustrasi platform digital');
      
      expect(robotImage).toBeInTheDocument();
      expect(baseImage).toBeInTheDocument();
    });

    it('renders signup images with proper classes', () => {
      const { container } = render(<SignUpArea />);
      
      const imageOne = container.querySelector('.image-one');
      const imageTwo = container.querySelector('.image-two');
      
      expect(imageOne).toBeInTheDocument();
      expect(imageTwo).toBeInTheDocument();
    });

    it('renders user wrapper', () => {
      const { container } = render(<SignUpArea />);
      
      const userWrapper = container.querySelector('.user-wrapper');
      expect(userWrapper).toBeInTheDocument();
      expect(userWrapper).toHaveClass('mb-50');
    });

    it('renders form title', () => {
      render(<SignUpArea />);
      
      const formTitle = screen.getByText('Buat akun layanan Maskom');
      expect(formTitle).toBeInTheDocument();
      expect(formTitle.tagName).toBe('H3');
    });

    it('renders form title with proper styling', () => {
      const { container } = render(<SignUpArea />);
      
      const formTitleWrapper = container.querySelector('.form-title');
      expect(formTitleWrapper).toBeInTheDocument();
      expect(formTitleWrapper).toHaveClass('mb-35');
    });

    it('renders signup form', () => {
      render(<SignUpArea />);
      
      const signupForm = screen.getByTestId('signup-form');
      expect(signupForm).toBeInTheDocument();
    });

    it('renders layout with two columns', () => {
      const { container } = render(<SignUpArea />);
      
      const columns = container.querySelectorAll('.col-xl-6');
      expect(columns.length).toBe(2);
    });

    it('renders image box in first column', () => {
      const { container } = render(<SignUpArea />);
      
      const firstColumn = container.querySelector('.col-xl-6');
      const imageBox = container.querySelector('.signup-image-box');
      
      expect(firstColumn).toContainElement(imageBox as HTMLElement);
    });

    it('renders user wrapper in second column', () => {
      const { container } = render(<SignUpArea />);
      
      const columns = container.querySelectorAll('.col-xl-6');
      const secondColumn = columns[1];
      const userWrapper = container.querySelector('.user-wrapper');
      
      expect(secondColumn).toContainElement(userWrapper as HTMLElement);
    });

    it('renders layout with aligned items', () => {
      const { container } = render(<SignUpArea />);
      
      const row = container.querySelector('.row');
      expect(row).toHaveClass('align-items-center');
    });

    it('has proper animation classes', () => {
      const { container } = render(<SignUpArea />);
      
      const fadeInLeft = container.querySelector('[data-animation="fadeInLeft"]');
      const fadeInRight = container.querySelector('[data-animation="fadeInRight"]');
      
      expect(fadeInLeft).toBeInTheDocument();
      expect(fadeInRight).toBeInTheDocument();
    });

    it('renders image box with bottom margin', () => {
      const { container } = render(<SignUpArea />);
      
      const imageBox = container.querySelector('.signup-image-box');
      expect(imageBox).toHaveClass('mb-50');
    });

    it('renders user wrapper with bottom margin', () => {
      const { container } = render(<SignUpArea />);
      
      const userWrapper = container.querySelector('.user-wrapper');
      expect(userWrapper).toHaveClass('mb-50');
    });

    it('renders Indonesian text correctly', () => {
      render(<SignUpArea />);
      
      expect(screen.getByText('Buat akun layanan Maskom')).toBeInTheDocument();
    });

    it('has proper positioning classes', () => {
      const { container } = render(<SignUpArea />);
      
      const imageBox = container.querySelector('.signup-image-box');
      expect(imageBox).toHaveClass('p-r');
      expect(imageBox).toHaveClass('z-1');
    });

    it('renders signup images in image box', () => {
      const { container } = render(<SignUpArea />);
      
      const imageBox = container.querySelector('.signup-image-box');
      const robotImage = screen.getByAltText('Ilustrasi robot layanan digital Maskom');
      const baseImage = screen.getByAltText('Base ilustrasi platform digital');
      
      expect(imageBox).toContainElement(robotImage);
      expect(imageBox).toContainElement(baseImage);
    });

    it('renders signup form inside user wrapper', () => {
      const { container } = render(<SignUpArea />);
      
      const userWrapper = container.querySelector('.user-wrapper');
      const signupForm = screen.getByTestId('signup-form');
      
      expect(userWrapper).toContainElement(signupForm);
    });

    it('renders form title inside user wrapper', () => {
      const { container } = render(<SignUpArea />);
      
      const userWrapper = container.querySelector('.user-wrapper');
      const formTitleWrapper = container.querySelector('.form-title');
      
      expect(userWrapper).toContainElement(formTitleWrapper as HTMLElement);
    });

    it('renders user section with container', () => {
      const { container } = render(<SignUpArea />);
      
      const section = container.querySelector('.user-section');
      const containerDiv = container.querySelector('.container');
      
      expect(section).toContainElement(containerDiv as HTMLElement);
    });

    it('renders layout with row structure', () => {
      const { container } = render(<SignUpArea />);
      
      const row = container.querySelector('.row');
      expect(row).toBeInTheDocument();
    });

    it('has proper padding classes', () => {
      const { container } = render(<SignUpArea />);
      
      const section = container.querySelector('.user-section');
      expect(section).toHaveClass('pt-120');
      expect(section).toHaveClass('pb-70');
    });

    it('renders images with descriptive alt text', () => {
      render(<SignUpArea />);
      
      const robotImage = screen.getByAltText('Ilustrasi robot layanan digital Maskom');
      const baseImage = screen.getByAltText('Base ilustrasi platform digital');
      
      expect(robotImage).toBeInTheDocument();
      expect(baseImage).toBeInTheDocument();
    });

    it('has consistent margin classes', () => {
      const { container } = render(<SignUpArea />);
      
      const imageBox = container.querySelector('.signup-image-box');
      const userWrapper = container.querySelector('.user-wrapper');
      
      expect(imageBox).toHaveClass('mb-50');
      expect(userWrapper).toHaveClass('mb-50');
    });

    it('renders AnimationWrapper components', () => {
      const { container } = render(<SignUpArea />);
      
      const animationWrappers = container.querySelectorAll('[data-animation]');
      expect(animationWrappers.length).toBe(2);
    });
  });

  describe('accessibility', () => {
    it('provides accessible alt text for all images', () => {
      render(<SignUpArea />);
      
      const images = screen.getAllByRole('img');
      expect(images.length).toBe(2);
      
      images.forEach((image) => {
        expect(image).toHaveAttribute('alt');
        expect(image.getAttribute('alt')).not.toBe('');
      });
    });

    it('uses semantic HTML elements', () => {
      const { container } = render(<SignUpArea />);
      
      expect(container.querySelector('section')).toBeInTheDocument();
      expect(container.querySelector('h3')).toBeInTheDocument();
    });
  });

  describe('component features', () => {
    it('uses dynamic import for SignUpForm', () => {
      render(<SignUpArea />);
      
      const signupForm = screen.getByTestId('signup-form');
      expect(signupForm).toBeInTheDocument();
    });

    it('applies AnimationWrapper to image section', () => {
      const { container } = render(<SignUpArea />);
      
      const fadeInLeft = container.querySelector('[data-animation="fadeInLeft"]');
      expect(fadeInLeft).toBeInTheDocument();
    });

    it('applies AnimationWrapper to form section', () => {
      const { container } = render(<SignUpArea />);
      
      const fadeInRight = container.querySelector('[data-animation="fadeInRight"]');
      expect(fadeInRight).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles component rendering without props', () => {
      const { container } = render(<SignUpArea />);
      
      expect(container.querySelector('.user-section')).toBeInTheDocument();
    });

    it('maintains structure when AnimationWrapper is mocked', () => {
      const { container } = render(<SignUpArea />);
      
      const imageBox = container.querySelector('.signup-image-box');
      const userWrapper = container.querySelector('.user-wrapper');
      
      expect(imageBox).toBeInTheDocument();
      expect(userWrapper).toBeInTheDocument();
    });

    it('renders correctly with mocked dynamic import', () => {
      render(<SignUpArea />);
      
      const signupForm = screen.getByTestId('signup-form');
      expect(signupForm).toBeInTheDocument();
    });
  });

  describe('integration', () => {
    it('works with mocked dependencies', () => {
      const { container } = render(<SignUpArea />);
      
      const section = container.querySelector('.user-section');
      const images = container.querySelectorAll('img');
      const form = screen.getByTestId('signup-form');
      
      expect(section).toBeInTheDocument();
      expect(images.length).toBe(2);
      expect(form).toBeInTheDocument();
    });

    it('maintains proper DOM hierarchy', () => {
      const { container } = render(<SignUpArea />);
      
      const section = container.querySelector('.user-section');
      const containerDiv = container.querySelector('.container');
      const row = container.querySelector('.row');
      const columns = container.querySelectorAll('.col-xl-6');
      
      expect(section).toContainElement(containerDiv as HTMLElement);
      expect(containerDiv).toContainElement(row as HTMLElement);
      expect(row).toContainElement(columns[0] as HTMLElement);
      expect(row).toContainElement(columns[1] as HTMLElement);
    });
  });
});
