import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginArea from '../LoginArea';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => <img alt={alt} {...props} />,
}));

jest.mock('next/dynamic', () => () => {
  const MockComponent = () => <div data-testid="login-form">Mock LoginForm</div>;
  MockComponent.displayName = 'MockComponent';
  return MockComponent;
});

describe('LoginArea', () => {
  it('renders user section with proper structure', () => {
    const { container } = render(<LoginArea />);
    
    const section = container.querySelector('.user-section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('pt-120');
    expect(section).toHaveClass('pb-70');
  });

  it('renders signup image box', () => {
    const { container } = render(<LoginArea />);
    
    const imageBox = container.querySelector('.signup-image-box');
    expect(imageBox).toBeInTheDocument();
    expect(imageBox).toHaveClass('p-r');
    expect(imageBox).toHaveClass('z-1');
  });

  it('renders login images', () => {
    render(<LoginArea />);
    
    const robotImage = screen.getByAltText('Robot pintar Maskom yang menggambarkan layanan digital dan otomatisasi');
    const baseImage = screen.getByAltText('Platform digital Maskom dengan antarmuka modern');
    
    expect(robotImage).toBeInTheDocument();
    expect(baseImage).toBeInTheDocument();
  });

  it('renders login images with proper classes', () => {
    const { container } = render(<LoginArea />);
    
    const imageOne = container.querySelector('.image-one');
    const imageTwo = container.querySelector('.image-two');
    
    expect(imageOne).toBeInTheDocument();
    expect(imageTwo).toBeInTheDocument();
  });

  it('renders user wrapper', () => {
    const { container } = render(<LoginArea />);
    
    const userWrapper = container.querySelector('.user-wrapper');
    expect(userWrapper).toBeInTheDocument();
    expect(userWrapper).toHaveClass('mb-50');
  });

  it('renders form title', () => {
    render(<LoginArea />);
    
    const formTitle = screen.getByText('Masuk ke portal pelanggan');
    expect(formTitle).toBeInTheDocument();
    expect(formTitle.tagName).toBe('H3');
  });

  it('renders form title with proper styling', () => {
    const { container } = render(<LoginArea />);
    
    const formTitleWrapper = container.querySelector('.form-title');
    expect(formTitleWrapper).toBeInTheDocument();
    expect(formTitleWrapper).toHaveClass('text-center');
    expect(formTitleWrapper).toHaveClass('mb-35');
  });

  it('renders login form', () => {
    render(<LoginArea />);
    
    const loginForm = screen.getByTestId('login-form');
    expect(loginForm).toBeInTheDocument();
  });

  it('renders layout with two columns', () => {
    const { container } = render(<LoginArea />);
    
    const firstColumn = container.querySelector('.col-lg-6');
    const secondColumn = container.querySelectorAll('.col-lg-6')[1];
    
    expect(firstColumn).toBeInTheDocument();
    expect(secondColumn).toBeInTheDocument();
  });

  it('renders image box in first column', () => {
    const { container } = render(<LoginArea />);
    
    const firstColumn = container.querySelector('.col-lg-6');
    const imageBox = container.querySelector('.signup-image-box');
    
    expect(firstColumn).toContainElement(imageBox as HTMLElement);
  });

  it('renders user wrapper in second column', () => {
    const { container } = render(<LoginArea />);
    
    const secondColumn = container.querySelectorAll('.col-lg-6')[1];
    const userWrapper = container.querySelector('.user-wrapper');
    
    expect(secondColumn).toContainElement(userWrapper as HTMLElement);
  });

  it('renders layout with aligned items', () => {
    const { container } = render(<LoginArea />);
    
    const row = container.querySelector('.row');
    expect(row).toHaveClass('align-items-center');
  });

  it('has proper animation classes', () => {
    const { container } = render(<LoginArea />);
    
    expect(container.querySelector('.fadeInLeft')).toBeInTheDocument();
    expect(container.querySelector('.fadeInRight')).toBeInTheDocument();
  });

  it('renders image box with bottom margin', () => {
    const { container } = render(<LoginArea />);
    
    const imageBox = container.querySelector('.signup-image-box');
    expect(imageBox).toHaveClass('mb-50');
  });

  it('renders user wrapper with bottom margin', () => {
    const { container } = render(<LoginArea />);
    
    const userWrapper = container.querySelector('.user-wrapper');
    expect(userWrapper).toHaveClass('mb-50');
  });

  it('renders Indonesian text correctly', () => {
    render(<LoginArea />);
    
    expect(screen.getByText('Masuk ke portal pelanggan')).toBeInTheDocument();
  });

  it('has proper positioning classes', () => {
    const { container } = render(<LoginArea />);
    
    const imageBox = container.querySelector('.signup-image-box');
    expect(imageBox).toHaveClass('p-r');
    expect(imageBox).toHaveClass('z-1');
  });

  it('renders login images in image box', () => {
    const { container } = render(<LoginArea />);
    
    const imageBox = container.querySelector('.signup-image-box');
    const robotImage = screen.getByAltText('Robot pintar Maskom yang menggambarkan layanan digital dan otomatisasi');
    const baseImage = screen.getByAltText('Platform digital Maskom dengan antarmuka modern');
    
    expect(imageBox).toContainElement(robotImage);
    expect(imageBox).toContainElement(baseImage);
  });

  it('renders login form inside user wrapper', () => {
    const { container } = render(<LoginArea />);
    
    const userWrapper = container.querySelector('.user-wrapper');
    const loginForm = screen.getByTestId('login-form');
    
    expect(userWrapper).toContainElement(loginForm);
  });

  it('renders form title inside user wrapper', () => {
    const { container } = render(<LoginArea />);
    
    const userWrapper = container.querySelector('.user-wrapper');
    const formTitleWrapper = container.querySelector('.form-title');
    
    expect(userWrapper).toContainElement(formTitleWrapper as HTMLElement);
  });

  it('renders user section with container', () => {
    const { container } = render(<LoginArea />);
    
    const section = container.querySelector('.user-section');
    const containerDiv = container.querySelector('.container');
    
    expect(section).toContainElement(containerDiv as HTMLElement);
  });

  it('renders layout with row structure', () => {
    const { container } = render(<LoginArea />);
    
    const row = container.querySelector('.row');
    expect(row).toBeInTheDocument();
  });

  it('has proper padding classes', () => {
    const { container } = render(<LoginArea />);
    
    const section = container.querySelector('.user-section');
    expect(section).toHaveClass('pt-120');
    expect(section).toHaveClass('pb-70');
  });

  it('renders images with descriptive alt text', () => {
    render(<LoginArea />);
    
    const robotImage = screen.getByAltText('Robot pintar Maskom yang menggambarkan layanan digital dan otomatisasi');
    const baseImage = screen.getByAltText('Platform digital Maskom dengan antarmuka modern');
    
    expect(robotImage).toBeInTheDocument();
    expect(baseImage).toBeInTheDocument();
  });

  it('has consistent margin classes', () => {
    const { container } = render(<LoginArea />);
    
    const imageBox = container.querySelector('.signup-image-box');
    const userWrapper = container.querySelector('.user-wrapper');
    
    expect(imageBox).toHaveClass('mb-50');
    expect(userWrapper).toHaveClass('mb-50');
  });
});
