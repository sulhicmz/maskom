import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
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

describe('FooterOne', () => {
  it('renders footer element with default classes', () => {
    const { container } = render(<FooterOne style={false} style_2={false} />);

    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveClass('footer-default');
    expect(footer).toHaveClass('bg_cover');
    expect(footer).toHaveClass('pt-80');
  });

  it('renders footer with footer-v2 class when style prop is true', () => {
    const { container } = render(<FooterOne style={true} style_2={false} />);

    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('footer-v2');
  });

  it('renders footer with logo-2 when style_2 prop is true', () => {
    const { container } = render(<FooterOne style={true} style_2={true} />);

    const logo = container.querySelector('.footer-logo img');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('alt', 'Maskom - Footer Logo');
  });

  it('renders footer with logo-1 when style prop is false', () => {
    const { container } = render(<FooterOne style={false} style_2={false} />);

    const logo = container.querySelector('.footer-logo img');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('alt', 'Maskom - Footer Logo');
  });

  it('renders footer description paragraph', () => {
    render(<FooterOne style={false} style_2={false} />);

    const description = screen.getByText(/Maskom adalah penyedia layanan konektivitas dan managed service/);
    expect(description).toBeInTheDocument();
  });

  it('renders SocialLinks component', () => {
    const { container } = render(<FooterOne style={false} style_2={false} />);

    const socialLinksList = container.querySelector('.social-link');
    expect(socialLinksList).toBeInTheDocument();
  });

  it('renders navigation sections from data', () => {
    render(<FooterOne style={false} style_2={false} />);

    navigationSections.forEach((section) => {
      expect(screen.getByText(section.title)).toBeInTheDocument();
    });
  });

  it('renders navigation links with correct URLs', () => {
    render(<FooterOne style={false} style_2={false} />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);

    const firstSectionLinks = links.filter(link => link.getAttribute('href')?.startsWith('/'));
    expect(firstSectionLinks.length).toBeGreaterThan(0);
  });

  it('renders newsletter form with email input', () => {
    render(<FooterOne style={false} style_2={false} />);

    const emailInput = screen.getByLabelText('Email untuk newsletter');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('name', 'email');
    expect(emailInput).toHaveAttribute('required');
  });

  it('renders newsletter subscribe button', () => {
    render(<FooterOne style={false} style_2={false} />);

    const subscribeButton = screen.getByRole('button', { name: /subscribe/i });
    expect(subscribeButton).toBeInTheDocument();
    expect(subscribeButton).toHaveAttribute('type', 'submit');
  });

  it('renders newsletter description', () => {
    render(<FooterOne style={false} style_2={false} />);

    const newsletterDesc = screen.getByText(/Dapatkan kabar terbaru seputar layanan Maskom/);
    expect(newsletterDesc).toBeInTheDocument();
  });

  it('renders current year in copyright text', () => {
    render(<FooterOne style={false} style_2={false} />);

    const currentYear = new Date().getFullYear();
    const copyrightText = screen.getByText(`© ${currentYear} Maskom Network. All rights reserved.`);
    expect(copyrightText).toBeInTheDocument();
  });

  it('prevents default form submission on newsletter form', () => {
    const { container } = render(<FooterOne style={false} style_2={false} />);

    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
  });

  it('renders footer widget area with proper structure', () => {
    const { container } = render(<FooterOne style={false} style_2={false} />);

    const widgetArea = container.querySelector('.footer-widget-area');
    expect(widgetArea).toBeInTheDocument();
  });

  it('renders footer about widget', () => {
    const { container } = render(<FooterOne style={false} style_2={false} />);

    const aboutWidget = container.querySelector('.footer_about_widget');
    expect(aboutWidget).toBeInTheDocument();
  });

  it('renders footer nav menu widget', () => {
    const { container } = render(<FooterOne style={false} style_2={false} />);

    const navWidget = container.querySelector('.footer_widget_nav_menu');
    expect(navWidget).toBeInTheDocument();
  });

  it('renders newsletter widget', () => {
    const { container } = render(<FooterOne style={false} style_2={false} />);

    const newsletterWidget = container.querySelector('.footer-newsletter-widget');
    expect(newsletterWidget).toBeInTheDocument();
  });

  it('renders navigation links with target="_blank" when specified', () => {
    render(<FooterOne style={false} style_2={false} />);

    const links = screen.getAllByRole('link');
    const externalLinks = links.filter(link => link.getAttribute('target') === '_blank');

    if (externalLinks.length > 0) {
      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('rel', 'noreferrer');
      });
    }
  });

  it('renders navigation links with target="_self" by default', () => {
    render(<FooterOne style={false} style_2={false} />);

    const links = screen.getAllByRole('link');
    const internalLinks = links.filter(link => !link.getAttribute('target') || link.getAttribute('target') === '_self');

    expect(internalLinks.length).toBeGreaterThan(0);
  });

  it('renders footer with proper column layout', () => {
    const { container } = render(<FooterOne style={false} style_2={false} />);

    const aboutColumn = container.querySelector('.col-lg-4');
    const navColumn = container.querySelector('.col-lg-5');
    const newsletterColumn = container.querySelector('.col-lg-3');

    expect(aboutColumn).toBeInTheDocument();
    expect(navColumn).toBeInTheDocument();
    expect(newsletterColumn).toBeInTheDocument();
  });

  it('renders footer title headings', () => {
    render(<FooterOne style={false} style_2={false} />);

    const footerTitles = screen.getAllByRole('heading');
    expect(footerTitles.length).toBeGreaterThan(0);

    footerTitles.forEach(heading => {
      expect(heading).toHaveClass('footer-title');
    });
  });

  it('renders newsletter input with placeholder', () => {
    render(<FooterOne style={false} style_2={false} />);

    const emailInput = screen.getByPlaceholderText('Masukkan email Anda');
    expect(emailInput).toBeInTheDocument();
  });

  it('renders submit button with theme-btn class', () => {
    render(<FooterOne style={false} style_2={false} />);

    const submitButton = screen.getByRole('button', { name: /subscribe/i });
    expect(submitButton).toHaveClass('theme-btn');
  });

  it('renders submit button with gradient-btn class when style_2 is false', () => {
    render(<FooterOne style={false} style_2={false} />);

    const submitButton = screen.getByRole('button', { name: /subscribe/i });
    expect(submitButton).toHaveClass('gradient-btn');
  });

  it('renders submit button with style-one class when style is true', () => {
    render(<FooterOne style={true} style_2={false} />);

    const submitButton = screen.getByRole('button', { name: /subscribe/i });
    expect(submitButton).toHaveClass('style-one');
  });

  it('renders copyright area', () => {
    const { container } = render(<FooterOne style={false} style_2={false} />);

    const copyrightArea = container.querySelector('.copyright-area');
    expect(copyrightArea).toBeInTheDocument();
  });

  it('renders copyright text centered', () => {
    const { container } = render(<FooterOne style={false} style_2={false} />);

    const copyrightText = container.querySelector('.copyright-text');
    expect(copyrightText).toBeInTheDocument();
    expect(copyrightText).toHaveClass('text-center');
  });

  it('renders footer logo as link to home', () => {
    const { container } = render(<FooterOne style={false} style_2={false} />);

    const logoLink = container.querySelector('.footer-logo a');
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('renders navigation items as unordered lists', () => {
    const { container } = render(<FooterOne style={false} style_2={false} />);

    const unorderedLists = container.querySelectorAll('.footer_widget_nav_menu ul');
    expect(unorderedLists.length).toBeGreaterThan(0);
  });

  it('is a memoized component', () => {
    expect(FooterOne.displayName).toBe('FooterOne');
  });

  it('renders footer with all required sections', () => {
    const { container } = render(<FooterOne style={false} style_2={false} />);

    expect(container.querySelector('.footer_about_widget')).toBeInTheDocument();
    expect(container.querySelector('.footer_widget_nav_menu')).toBeInTheDocument();
    expect(container.querySelector('.footer-newsletter-widget')).toBeInTheDocument();
  });

  it('renders all navigation sections with their items', () => {
    render(<FooterOne style={false} style_2={false} />);

    navigationSections.forEach((section) => {
      section.items.forEach((item) => {
        const link = screen.getByText(item.label);
        expect(link).toBeInTheDocument();
        expect(link.closest('a')).toHaveAttribute('href', item.url);
      });
    });
  });

  it('renders newsletter form with form-group class', () => {
    const { container } = render(<FooterOne style={false} style_2={false} />);

    const formGroup = container.querySelector('.newsletter-content .form-group');
    expect(formGroup).toBeInTheDocument();
  });

  it('renders footer content container', () => {
    const { container } = render(<FooterOne style={false} style_2={false} />);

    const containers = container.querySelectorAll('.container');
    expect(containers.length).toBe(2);
  });

  it('renders proper footer widget spacing', () => {
    const { container } = render(<FooterOne style={false} style_2={false} />);

    const widgets = container.querySelectorAll('.mb-30');
    expect(widgets.length).toBeGreaterThan(0);
  });

  it('renders footer with wow animation classes', () => {
    const { container } = render(<FooterOne style={false} style_2={false} />);

    const fadeInUpElements = container.querySelectorAll('.fadeInUp');
    const fadeInDownElements = container.querySelectorAll('.fadeInDown');

    expect(fadeInUpElements.length).toBeGreaterThan(0);
    expect(fadeInDownElements.length).toBeGreaterThan(0);
  });
});
