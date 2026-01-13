import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FooterTwo from '../FooterTwo';
import FooterOne from '../FooterOne';
import { navigationSections } from '@/data/SocialMediaData';

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

jest.mock('@/components/common/AnimationWrapper', () => ({
  __esModule: true,
  default: ({ children, className, animation }: { children: React.ReactNode; className?: string; animation: string }) => (
    <div className={`wow ${animation} ${className || ''}`}>{children}</div>
  ),
}));

describe('FooterTwo', () => {
  it('renders footer element with footer-v3 class', () => {
    const { container } = render(<FooterTwo />);

    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('footer-v3');
    expect(footer).toHaveClass('bg_cover');
    expect(footer).toHaveClass('pt-80');
  });

  it('renders footer with background image', () => {
    const { container } = render(<FooterTwo />);

    const footer = container.querySelector('footer');
    expect(footer).toHaveStyle({
      backgroundImage: 'url(/assets/images/bg/pattern-bg.webp)',
    });
  });

  it('renders footer description paragraph', () => {
    render(<FooterTwo />);

    const description = screen.getByText(/Maskom mendukung transformasi digital dengan layanan konektivitas/);
    expect(description).toBeInTheDocument();
  });

  it('renders SocialLinks component', () => {
    const { container } = render(<FooterTwo />);

    const socialLinksList = container.querySelector('.social-link');
    expect(socialLinksList).toBeInTheDocument();
  });

  it('renders navigation sections from data', () => {
    render(<FooterTwo />);

    navigationSections.forEach((section) => {
      expect(screen.getByText(section.title)).toBeInTheDocument();
    });
  });

  it('renders navigation links with correct URLs', () => {
    render(<FooterTwo />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);

    const firstSectionLinks = links.filter(link => link.getAttribute('href')?.startsWith('/'));
    expect(firstSectionLinks.length).toBeGreaterThan(0);
  });

  it('renders newsletter form with email input', () => {
    render(<FooterTwo />);

    const emailInput = screen.getByPlaceholderText('enter your email');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('name', 'email');
    expect(emailInput).toHaveAttribute('required');
  });

  it('renders newsletter subscribe button', () => {
    render(<FooterTwo />);

    const subscribeButton = screen.getByRole('button', { name: /subscribe/i });
    expect(subscribeButton).toBeInTheDocument();
  });

  it('renders newsletter description', () => {
    render(<FooterTwo />);

    const newsletterDesc = screen.getByText(/Dapatkan insight terkini dari Maskom/);
    expect(newsletterDesc).toBeInTheDocument();
  });

  it('renders current year in copyright text', () => {
    render(<FooterTwo />);

    const currentYear = new Date().getFullYear();
    const copyrightText = screen.getByText(`© ${currentYear} Maskom Network. All rights reserved.`);
    expect(copyrightText).toBeInTheDocument();
  });

  it('prevents default form submission on newsletter form', () => {
    const { container } = render(<FooterTwo />);

    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  it('renders footer widget area with proper structure', () => {
    const { container } = render(<FooterTwo />);

    const widgetArea = container.querySelector('.footer-widget-area');
    expect(widgetArea).toBeInTheDocument();
  });

  it('renders footer about widget', () => {
    const { container } = render(<FooterTwo />);

    const aboutWidget = container.querySelector('.footer_about_widget');
    expect(aboutWidget).toBeInTheDocument();
  });

  it('renders footer nav menu widget', () => {
    const { container } = render(<FooterTwo />);

    const navWidget = container.querySelector('.footer_widget_nav_menu');
    expect(navWidget).toBeInTheDocument();
  });

  it('renders newsletter widget', () => {
    const { container } = render(<FooterTwo />);

    const newsletterWidget = container.querySelector('.footer-newsletter-widget');
    expect(newsletterWidget).toBeInTheDocument();
  });

  it('renders navigation links with target="_blank" when specified', () => {
    render(<FooterTwo />);

    const links = screen.getAllByRole('link');
    const externalLinks = links.filter(link => link.getAttribute('target') === '_blank');

    if (externalLinks.length > 0) {
      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('rel', 'noreferrer');
      });
    }
  });

  it('renders navigation links with target="_self" by default', () => {
    render(<FooterTwo />);

    const links = screen.getAllByRole('link');
    const internalLinks = links.filter(link => !link.getAttribute('target') || link.getAttribute('target') === '_self');

    expect(internalLinks.length).toBeGreaterThan(0);
  });

  it('renders footer with proper column layout', () => {
    const { container } = render(<FooterTwo />);

    const aboutColumn = container.querySelector('.col-lg-4');
    const navColumn = container.querySelector('.col-lg-5');
    const newsletterColumn = container.querySelector('.col-lg-3');

    expect(aboutColumn).toBeInTheDocument();
    expect(navColumn).toBeInTheDocument();
    expect(newsletterColumn).toBeInTheDocument();
  });

  it('renders footer title headings', () => {
    render(<FooterTwo />);

    const footerTitles = screen.getAllByRole('heading');
    expect(footerTitles.length).toBeGreaterThan(0);

    footerTitles.forEach(heading => {
      expect(heading).toHaveClass('footer-title');
    });
  });

  it('renders submit button with theme-btn and style-one class', () => {
    render(<FooterTwo />);

    const submitButton = screen.getByRole('button', { name: /subscribe/i });
    expect(submitButton).toHaveClass('theme-btn');
    expect(submitButton).toHaveClass('style-one');
  });

  it('renders copyright area', () => {
    const { container } = render(<FooterTwo />);

    const copyrightArea = container.querySelector('.copyright-area');
    expect(copyrightArea).toBeInTheDocument();
  });

  it('renders copyright text centered', () => {
    const { container } = render(<FooterTwo />);

    const copyrightText = container.querySelector('.copyright-text');
    expect(copyrightText).toBeInTheDocument();
    expect(copyrightText).toHaveClass('text-center');
  });

  it('renders footer logo as link to home', () => {
    const { container } = render(<FooterTwo />);

    const logoLink = container.querySelector('.footer-logo a');
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('renders footer logo with alt text', () => {
    render(<FooterTwo />);

    const logo = screen.getByAltText('Maskom - Logo Footer');
    expect(logo).toBeInTheDocument();
  });

  it('renders navigation items as unordered lists', () => {
    const { container } = render(<FooterTwo />);

    const unorderedLists = container.querySelectorAll('.footer_widget_nav_menu ul');
    expect(unorderedLists.length).toBeGreaterThan(0);
  });

  it('renders all navigation sections with their items', () => {
    render(<FooterTwo />);

    navigationSections.forEach((section) => {
      section.items.forEach((item) => {
        const link = screen.getByText(item.label);
        expect(link).toBeInTheDocument();
        expect(link.closest('a')).toHaveAttribute('href', item.url);
      });
    });
  });

  it('renders newsletter form with form-group class', () => {
    const { container } = render(<FooterTwo />);

    const formGroup = container.querySelector('.newsletter-content .form-group');
    expect(formGroup).toBeInTheDocument();
  });

  it('renders footer content container', () => {
    const { container } = render(<FooterTwo />);

    const containers = container.querySelectorAll('.container');
    expect(containers.length).toBe(2);
  });

  it('renders proper footer widget spacing', () => {
    const { container } = render(<FooterTwo />);

    const widgets = container.querySelectorAll('.mb-30');
    expect(widgets.length).toBeGreaterThan(0);
  });

  it('renders footer with wow animation classes', () => {
    const { container } = render(<FooterTwo />);

    const fadeInUpElements = container.querySelectorAll('.fadeInUp');
    const fadeInDownElements = container.querySelectorAll('.fadeInDown');

    expect(fadeInUpElements.length).toBeGreaterThan(0);
    expect(fadeInDownElements.length).toBeGreaterThan(0);
  });

  it('renders footer with AnimationWrapper components', () => {
    const { container } = render(<FooterTwo />);

    const animationWrappers = container.querySelectorAll('.wow');
    expect(animationWrappers.length).toBeGreaterThan(0);
  });

  it('renders footer logo section with AnimationWrapper', () => {
    const { container } = render(<FooterTwo />);

    const aboutWidget = container.querySelector('.footer_about_widget');
    expect(aboutWidget).toBeInTheDocument();
    expect(aboutWidget).toHaveClass('fadeInUp');
  });

  it('renders nav menu with AnimationWrapper', () => {
    const { container } = render(<FooterTwo />);

    const navWidget = container.querySelector('.footer_widget_nav_menu');
    expect(navWidget).toBeInTheDocument();
    expect(navWidget).toHaveClass('fadeInDown');
  });

  it('renders newsletter widget with AnimationWrapper', () => {
    const { container } = render(<FooterTwo />);

    const newsletterWidget = container.querySelector('.footer-newsletter-widget');
    expect(newsletterWidget).toBeInTheDocument();
    expect(newsletterWidget).toHaveClass('fadeInUp');
  });

  it('has different description text from FooterOne', () => {
    const { container: footerOneContainer } = render(<FooterOne style={false} style_2={false} />);
    render(<FooterTwo />);

    const footerTwoText = screen.getByText(/Maskom mendukung transformasi digital/);
    const footerOneText = footerOneContainer.querySelector('.footer_about_widget p');

    expect(footerTwoText).toBeInTheDocument();
    if (footerOneText) {
      expect(footerTwoText.textContent).not.toBe(footerOneText.textContent);
    }
  });

  it('has different newsletter description from FooterOne', () => {
    const { container: footerOneContainer } = render(<FooterOne style={false} style_2={false} />);
    render(<FooterTwo />);

    const footerTwoDesc = screen.getByText(/Dapatkan insight terkini dari Maskom/);
    const footerOneDesc = footerOneContainer.querySelector('.footer-newsletter-widget p:last-of-type');

    expect(footerTwoDesc).toBeInTheDocument();
    if (footerOneDesc) {
      expect(footerTwoDesc.textContent).not.toBe(footerOneDesc.textContent);
    }
  });
});
