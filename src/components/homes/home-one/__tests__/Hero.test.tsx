import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Hero from '../Hero';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => <img alt={alt} {...props} />,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

describe('Hero', () => {
  it('renders hero section with proper structure', () => {
    const { container } = render(<Hero />);
    
    const section = container.querySelector('.hero-section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('id', 'beranda');
  });

  it('renders hero background wrapper', () => {
    const { container } = render(<Hero />);
    
    const heroWrapper = container.querySelector('.hero-wrapper.bg_cover');
    expect(heroWrapper).toBeInTheDocument();
    expect(heroWrapper).toHaveStyle({
      backgroundImage: 'url(/assets/images/hero/hero-bg-1.png)',
    });
  });

  it('renders hero heading title', () => {
    render(<Hero />);
    
    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Infrastruktur Digital Andal Untuk');
    expect(screen.getByText('Bisnis Terkoneksi')).toBeInTheDocument();
  });

  it('renders hero description paragraph', () => {
    render(<Hero />);
    
    const description = screen.getByText(/Maskom menghadirkan layanan internet dedicated/);
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('para-one');
  });

  it('renders CTA button linking to contact page', () => {
    render(<Hero />);
    
    const ctaButton = screen.getByText('Jadwalkan Demo');
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute('href', '/contact');
    expect(ctaButton).toHaveClass('theme-btn');
    expect(ctaButton).toHaveClass('gradient-btn');
  });

  it('renders support paragraph', () => {
    render(<Hero />);
    
    const supportText = screen.getByText('Tim network engineer siap membantu 24/7');
    expect(supportText).toBeInTheDocument();
    expect(supportText).toHaveClass('para-two');
  });

  it('renders dashboard image', () => {
    render(<Hero />);

    const dashboardImage = screen.getByAltText('Dashboard monitoring infrastruktur jaringan Maskom');
    expect(dashboardImage).toBeInTheDocument();
  });

  it('renders hero content with proper CSS classes', () => {
    const { container } = render(<Hero />);
    
    const heroContent = container.querySelector('.hero-content');
    expect(heroContent).toBeInTheDocument();
    expect(heroContent).toHaveClass('text-center');
  });

  it('renders animation classes on elements', () => {
    const { container } = render(<Hero />);
    
    expect(container.querySelector('.fadeInDown')).toBeInTheDocument();
    expect(container.querySelector('.fadeInUp')).toBeInTheDocument();
  });

  it('renders hero button in button container', () => {
    const { container } = render(<Hero />);
    
    const heroButton = container.querySelector('.hero-button');
    expect(heroButton).toBeInTheDocument();
    
    const ctaButton = screen.getByText('Jadwalkan Demo');
    expect(heroButton).toContainElement(ctaButton as HTMLElement);
  });

  it('renders responsive layout with container', () => {
    const { container } = render(<Hero />);
    
    const containerDiv = container.querySelector('.container');
    expect(containerDiv).toBeInTheDocument();
  });

  it('renders hero image box with proper classes', () => {
    const { container } = render(<Hero />);
    
    const heroImageBox = container.querySelector('.hero-one_image-box');
    expect(heroImageBox).toBeInTheDocument();
    expect(heroImageBox).toHaveClass('text-center');
  });

  it('has proper heading element hierarchy', () => {
    render(<Hero />);
    
    const heading = screen.getByRole('heading');
    expect(heading.tagName).toBe('H1');
  });

  it('renders Indonesian text correctly', () => {
    render(<Hero />);
    
    expect(screen.getByText('Infrastruktur Digital Andal Untuk')).toBeInTheDocument();
    expect(screen.getByText('Bisnis Terkoneksi')).toBeInTheDocument();
    expect(screen.getByText('Jadwalkan Demo')).toBeInTheDocument();
    expect(screen.getByText('Tim network engineer siap membantu 24/7')).toBeInTheDocument();
  });

  it('renders content in centered row layout', () => {
    const { container } = render(<Hero />);
    
    const centeredColumn = container.querySelector('.col-lg-8');
    const centeredRow = container.querySelector('.justify-content-center');
    
    expect(centeredColumn).toBeInTheDocument();
    expect(centeredRow).toBeInTheDocument();
  });

  it('renders image in full-width column', () => {
    const { container } = render(<Hero />);
    
    const fullWidthColumn = container.querySelector('.col-lg-12');
    expect(fullWidthColumn).toBeInTheDocument();
  });

  it('renders dashboard image with image-box wrapper', () => {
    const { container } = render(<Hero />);
    
    const heroImageBox = container.querySelector('.hero-one_image-box');
    const dashboardImage = screen.getByAltText('Dashboard monitoring infrastruktur jaringan Maskom');
    
    expect(heroImageBox).toContainElement(dashboardImage);
  });

  it('has all wow animation classes', () => {
    const { container } = render(<Hero />);
    
    const fadeInDownElements = container.querySelectorAll('.fadeInDown');
    const fadeInUpElements = container.querySelectorAll('.fadeInUp');
    
    expect(fadeInDownElements.length).toBeGreaterThan(0);
    expect(fadeInUpElements.length).toBeGreaterThan(0);
  });

  it('renders hero content with proper structure', () => {
    const { container } = render(<Hero />);
    
    const heroContent = container.querySelector('.hero-content');
    expect(heroContent).toContainElement(screen.getByRole('heading') as HTMLElement);
    expect(heroContent).toContainElement(screen.getByText(/Maskom menghadirkan layanan/));
    expect(heroContent).toContainElement(screen.getByText('Jadwalkan Demo'));
  });

  it('is a memoized component', () => {
    expect(Hero.displayName).toBe('Hero');
  });
});
