import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Breadcrumb from '../../common/Breadcrumb';

jest.mock('next/link', () => {
  return function LinkMock({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('Breadcrumb', () => {
  it('renders breadcrumb section with title', () => {
    render(<Breadcrumb title="Test Title" sub_title="Test Subtitle" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders home link with default label "Beranda"', () => {
    render(<Breadcrumb title="Test" sub_title="Subtitle" />);

    expect(screen.getByText('Beranda')).toBeInTheDocument();
  });

  it('renders home link with custom homeLabel', () => {
    render(<Breadcrumb title="Test" sub_title="Subtitle" homeLabel="Home" />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.queryByText('Beranda')).not.toBeInTheDocument();
  });

  it('renders home link with default href "/"', () => {
    render(<Breadcrumb title="Test" sub_title="Subtitle" />);

    const homeLink = screen.getByText('Beranda').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders home link with custom homeLink href', () => {
    render(<Breadcrumb title="Test" sub_title="Subtitle" homeLink="/custom-home" />);

    const homeLink = screen.getByText('Beranda').closest('a');
    expect(homeLink).toHaveAttribute('href', '/custom-home');
  });

  it('renders dot separator between home link and subtitle', () => {
    const { container } = render(<Breadcrumb title="Test" sub_title="Subtitle" />);

    const dot = container.querySelector('.dot');
    expect(dot).toBeInTheDocument();
  });

  it('has proper section structure', () => {
    const { container } = render(<Breadcrumb title="Test" sub_title="Subtitle" />);

    const section = container.querySelector('.page-banner');
    expect(section).toBeInTheDocument();
  });

  it('has page-banner-wrapper with background image', () => {
    const { container } = render(<Breadcrumb title="Test" sub_title="Subtitle" />);

    const wrapper = container.querySelector('.page-banner-wrapper');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('bg_cover');
    expect(wrapper).toHaveStyle({
      backgroundImage: 'url(/assets/images/bg/page-banner.webp)',
    });
  });

  it('has shape elements (circles)', () => {
    const { container } = render(<Breadcrumb title="Test" sub_title="Subtitle" />);

    const shapes = container.querySelectorAll('.shape');
    expect(shapes.length).toBe(2);
    
    const circles = container.querySelectorAll('.circle');
    expect(circles.length).toBe(2);
  });

  it('has container structure', () => {
    const { container } = render(<Breadcrumb title="Test" sub_title="Subtitle" />);

    const containerDiv = container.querySelector('.container');
    expect(containerDiv).toBeInTheDocument();
  });

  it('has row structure within container', () => {
    const { container } = render(<Breadcrumb title="Test" sub_title="Subtitle" />);

    const row = container.querySelector('.container .row');
    expect(row).toBeInTheDocument();
  });

  it('has content wrapper', () => {
    const { container } = render(<Breadcrumb title="Test" sub_title="Subtitle" />);

    const content = container.querySelector('.ac-breadcrumb__content');
    expect(content).toBeInTheDocument();
    expect(content).toHaveClass('text-center');
    expect(content).toHaveClass('p-relative');
    expect(content).toHaveClass('z-index-1');
  });

  it('renders breadcrumb title with correct class', () => {
    const { container } = render(<Breadcrumb title="My Page" sub_title="Details" />);

    const title = container.querySelector('.ac-breadcrumb__title');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('My Page');
  });

  it('renders breadcrumb list', () => {
    const { container } = render(<Breadcrumb title="Test" sub_title="Subtitle" />);

    const list = container.querySelector('.ac-breadcrumb__list');
    expect(list).toBeInTheDocument();
  });

  it('renders all breadcrumb elements in correct order', () => {
    const { container } = render(<Breadcrumb title="Page" sub_title="Details" />);

    const list = container.querySelector('.ac-breadcrumb__list');
    const link = list?.querySelector('a');
    const spans = list?.querySelectorAll('span');

    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('Beranda');
    expect(spans?.[0]).toHaveClass('dot');
    expect(spans?.[1]).toHaveTextContent('Details');
  });

  it('renders with proper column layout', () => {
    const { container } = render(<Breadcrumb title="Test" sub_title="Subtitle" />);

    const col = container.querySelector('.col-xl-12');
    expect(col).toBeInTheDocument();
  });

  it('handles special characters in title and subtitle', () => {
    render(
      <Breadcrumb 
        title="Tentang Kami" 
        sub_title="Selamat Datang" 
      />
    );

    expect(screen.getByText('Tentang Kami')).toBeInTheDocument();
    expect(screen.getByText('Selamat Datang')).toBeInTheDocument();
  });

  it('handles long titles correctly', () => {
    render(
      <Breadcrumb 
        title="Very Long Page Title That Should Be Displayed Properly" 
        sub_title="Subtitle" 
      />
    );

    expect(screen.getByText('Very Long Page Title That Should Be Displayed Properly')).toBeInTheDocument();
  });

  it('handles empty subtitle gracefully', () => {
    render(<Breadcrumb title="Test" sub_title="" />);

    const list = document.querySelector('.ac-breadcrumb__list');
    const spans = list?.querySelectorAll('span');
    expect(spans?.[1]).toHaveTextContent('');
  });

  it('works with numeric homeLabel', () => {
    render(<Breadcrumb title="Test" sub_title="Subtitle" homeLabel="1" />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('maintains proper DOM structure for accessibility', () => {
    const { container } = render(<Breadcrumb title="Test" sub_title="Subtitle" />);

    const title = container.querySelector('h3');
    expect(title).toBeInTheDocument();
    expect(title).toHaveClass('ac-breadcrumb__title');
  });

  it('renders with background image inline style', () => {
    const { container } = render(<Breadcrumb title="Test" sub_title="Subtitle" />);

    const wrapper = container.querySelector('.page-banner-wrapper');
    const style = wrapper?.getAttribute('style');
    expect(style).toContain('background');
    expect(style).toContain('/assets/images/bg/page-banner.webp');
  });

  it('has both shape-one and shape-two', () => {
    const { container } = render(<Breadcrumb title="Test" sub_title="Subtitle" />);

    const shapeOne = container.querySelector('.shape-one');
    const shapeTwo = container.querySelector('.shape-two');
    
    expect(shapeOne).toBeInTheDocument();
    expect(shapeTwo).toBeInTheDocument();
  });

  it('renders subtitle as plain text (not a link)', () => {
    render(<Breadcrumb title="Test" sub_title="My Subtitle" />);

    const subtitle = screen.getByText('My Subtitle');
    const subtitleSpan = subtitle.closest('span');
    expect(subtitleSpan).toBeInTheDocument();
    expect(subtitleSpan?.querySelector('a')).toBeNull();
  });

  it('uses default props correctly when only required props provided', () => {
    render(<Breadcrumb title="Required Title" sub_title="Required Subtitle" />);

    expect(screen.getByText('Required Title')).toBeInTheDocument();
    expect(screen.getByText('Required Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Beranda')).toBeInTheDocument();
    
    const homeLink = screen.getByText('Beranda').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
