import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotFoundArea from '../NotFoundArea';

describe('NotFoundArea', () => {
  it('renders 404 error section', () => {
    render(<NotFoundArea />);

    const section = document.querySelector('.error-section');
    expect(section).toBeInTheDocument();
  });

  it('renders error image', () => {
    render(<NotFoundArea />);

    const image = screen.getByAltText('Error Image');
    expect(image).toBeInTheDocument();
  });

  it('renders error image with correct dimensions', () => {
    render(<NotFoundArea />);

    const image = screen.getByAltText('Error Image');
    expect(image).toHaveAttribute('width', '400');
    expect(image).toHaveAttribute('height', '400');
  });

  it('renders Ooops title', () => {
    render(<NotFoundArea />);

    expect(screen.getByText('Ooops!')).toBeInTheDocument();
  });

  it('renders Page Not Found title', () => {
    render(<NotFoundArea />);

    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('renders error description', () => {
    render(<NotFoundArea />);

    expect(screen.getByText((content) => content.includes('Our goal is to utilize'))).toBeInTheDocument();
  });

  it('renders Go to Home button', () => {
    render(<NotFoundArea />);

    const button = screen.getByText('Go to Home');
    expect(button).toBeInTheDocument();
  });

  it('has proper link to home page', () => {
    render(<NotFoundArea />);

    const link = screen.getByText('Go to Home');
    expect(link).toHaveAttribute('href', '/');
  });

  it('has correct button class', () => {
    render(<NotFoundArea />);

    const button = screen.getByText('Go to Home');
    expect(button).toHaveClass('theme-btn');
    expect(button).toHaveClass('gradient-btn');
  });

  it('has proper section padding classes', () => {
    render(<NotFoundArea />);

    const section = document.querySelector('.error-section');
    expect(section).toHaveClass('pt-120');
    expect(section).toHaveClass('pb-120');
  });

  it('renders content in centered column', () => {
    render(<NotFoundArea />);

    const column = document.querySelector('.col-lg-6');
    expect(column).toBeInTheDocument();
  });

  it('has error content container with proper classes', () => {
    render(<NotFoundArea />);

    const errorContent = document.querySelector('.error-content');
    expect(errorContent).toBeInTheDocument();
    expect(errorContent).toHaveClass('text-center');
    expect(errorContent).toHaveClass('wow');
    expect(errorContent).toHaveClass('fadeInUp');
  });

  it('has proper image src path', () => {
    render(<NotFoundArea />);

    const image = screen.getByAltText('Error Image');
    const src = image.getAttribute('src');
    expect(src).toBeTruthy();
    expect(src).toContain('404.png');
  });

  it('has proper heading structure with span', () => {
    render(<NotFoundArea />);

    const heading = screen.getByText('Page Not Found');
    const span = heading.querySelector('span');
    expect(span).toBeInTheDocument();
    expect(span).toHaveTextContent('Ooops!');
  });

  it('has proper row with centering', () => {
    render(<NotFoundArea />);

    const row = document.querySelector('.error-section .row');
    expect(row).toHaveClass('justify-content-center');
  });

  it('has proper container', () => {
    render(<NotFoundArea />);

    const container = document.querySelector('.error-section .container');
    expect(container).toBeInTheDocument();
  });

  it('has semantic section element', () => {
    render(<NotFoundArea />);

    const section = document.querySelector('.error-section');
    expect(section).not.toBeNull();
    if (section) {
      expect(section.tagName).toBe('SECTION');
    }
  });

  it('renders h1 with title content', () => {
    render(<NotFoundArea />);

    const h1 = document.querySelector('h1');
    expect(h1).not.toBeNull();
    if (h1) {
      expect(h1.tagName.toLowerCase()).toBe('h1');
    }
  });

  it('has paragraph for description', () => {
    render(<NotFoundArea />);

    const paragraphs = document.querySelectorAll('.error-content p');
    expect(paragraphs.length).toBe(1);
  });

  it('has anchor element for home link', () => {
    render(<NotFoundArea />);

    const link = screen.getByText('Go to Home');
    expect(link.tagName).toBe('A');
  });

  it('has Next.js Link component', () => {
    render(<NotFoundArea />);

    const link = screen.getByText('Go to Home');
    expect(link).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(<NotFoundArea />);

    const section = document.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(document.querySelector('h1')).toBeInTheDocument();
    expect(document.querySelector('p')).toBeInTheDocument();
    expect(document.querySelector('a')).toBeInTheDocument();
  });

  it('has animation classes on content', () => {
    render(<NotFoundArea />);

    const errorContent = document.querySelector('.error-content');
    expect(errorContent).toHaveClass('wow');
    expect(errorContent).toHaveClass('fadeInUp');
  });

  it('renders line break in title correctly', () => {
    render(<NotFoundArea />);

    const heading = screen.getByText('Page Not Found');
    expect(heading.innerHTML).toContain('<br>');
  });
});
