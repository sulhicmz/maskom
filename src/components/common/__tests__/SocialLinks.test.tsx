import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SocialLinks from '../SocialLinks';

describe('SocialLinks', () => {
  const mockLinks = [
    {
      url: 'https://facebook.com/maskom',
      iconClass: 'fab fa-facebook-f',
      ariaLabel: 'Visit our Facebook page',
      target: '_blank' as const,
    },
    {
      url: 'https://twitter.com/maskom',
      iconClass: 'fab fa-twitter',
      ariaLabel: 'Visit our Twitter page',
      target: '_blank' as const,
    },
    {
      url: 'https://linkedin.com/company/maskom',
      iconClass: 'fab fa-linkedin-in',
      ariaLabel: 'Visit our LinkedIn page',
      target: '_blank' as const,
    },
    {
      url: 'https://instagram.com/maskom',
      iconClass: 'fab fa-instagram',
      ariaLabel: 'Visit our Instagram page',
      target: '_blank' as const,
    },
  ];

  it('renders social links as unordered list', () => {
    render(<SocialLinks links={mockLinks} />);

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list).toHaveClass('social-link');
  });

  it('renders all social links', () => {
    render(<SocialLinks links={mockLinks} />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBe(4);
  });

  it('renders social links with correct URLs', () => {
    render(<SocialLinks links={mockLinks} />);

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', 'https://facebook.com/maskom');
    expect(links[1]).toHaveAttribute('href', 'https://twitter.com/maskom');
    expect(links[2]).toHaveAttribute('href', 'https://linkedin.com/company/maskom');
    expect(links[3]).toHaveAttribute('href', 'https://instagram.com/maskom');
  });

  it('renders links with correct icon classes', () => {
    render(<SocialLinks links={mockLinks} />);

    const icons = screen.getAllByRole('link');
    expect(icons[0].querySelector('i')).toHaveClass('fab');
    expect(icons[0].querySelector('i')).toHaveClass('fa-facebook-f');
    expect(icons[1].querySelector('i')).toHaveClass('fab');
    expect(icons[1].querySelector('i')).toHaveClass('fa-twitter');
  });

  it('renders links with correct ARIA labels', () => {
    render(<SocialLinks links={mockLinks} />);

    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('aria-label', 'Visit our Facebook page');
    expect(links[1]).toHaveAttribute('aria-label', 'Visit our Twitter page');
    expect(links[2]).toHaveAttribute('aria-label', 'Visit our LinkedIn page');
    expect(links[3]).toHaveAttribute('aria-label', 'Visit our Instagram page');
  });

  it('renders links with target="_blank" by default', () => {
    render(<SocialLinks links={mockLinks} />);

    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  it('adds rel="noreferrer" when target="_blank"', () => {
    render(<SocialLinks links={mockLinks} />);

    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAttribute('rel', 'noreferrer');
    });
  });

  it('uses target="_self" when specified', () => {
    const linksWithSelf = [
      {
        url: '/contact',
        iconClass: 'fas fa-envelope',
        ariaLabel: 'Contact us',
        target: '_self' as const,
      },
    ];

    render(<SocialLinks links={linksWithSelf} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_self');
    expect(link).not.toHaveAttribute('rel');
  });

  it('uses default className when not provided', () => {
    render(<SocialLinks links={mockLinks} />);

    const list = screen.getByRole('list');
    expect(list).toHaveClass('social-link');
  });

  it('uses custom className when provided', () => {
    render(<SocialLinks links={mockLinks} className="custom-class" />);

    const list = screen.getByRole('list');
    expect(list).toHaveClass('custom-class');
  });

  it('renders each link as list item', () => {
    render(<SocialLinks links={mockLinks} />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(4);
  });

  it('renders icons inside list items', () => {
    render(<SocialLinks links={mockLinks} />);

    const listItems = screen.getAllByRole('listitem');
    listItems.forEach(item => {
      expect(item.querySelector('i')).toBeInTheDocument();
    });
  });

  it('returns null when links is undefined', () => {
    const { container } = render(<SocialLinks links={undefined} />);

    expect(container.firstChild).toBeNull();
  });

  it('returns null when links is empty array', () => {
    const { container } = render(<SocialLinks links={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders single link correctly', () => {
    const singleLink = [
      {
        url: 'https://facebook.com/maskom',
        iconClass: 'fab fa-facebook-f',
        ariaLabel: 'Visit our Facebook page',
        target: '_blank' as const,
      },
    ];

    render(<SocialLinks links={singleLink} />);

    const links = screen.getAllByRole('link');
    expect(links.length).toBe(1);
    expect(links[0]).toHaveAttribute('href', 'https://facebook.com/maskom');
  });

  it('renders links with FontAwesome classes correctly', () => {
    render(<SocialLinks links={mockLinks} />);

    const icons = screen.getAllByRole('link');
    expect(icons[0].querySelector('i')).toHaveClass('fab');
    expect(icons[0].querySelector('i')).toHaveClass('fa-facebook-f');
    expect(icons[1].querySelector('i')).toHaveClass('fab');
    expect(icons[1].querySelector('i')).toHaveClass('fa-twitter');
    expect(icons[2].querySelector('i')).toHaveClass('fab');
    expect(icons[2].querySelector('i')).toHaveClass('fa-linkedin-in');
    expect(icons[3].querySelector('i')).toHaveClass('fab');
    expect(icons[3].querySelector('i')).toHaveClass('fa-instagram');
  });

  it('handles links without target attribute (defaults to _self)', () => {
    const linksWithoutTarget = [
      {
        url: '/contact',
        iconClass: 'fas fa-envelope',
        ariaLabel: 'Contact us',
      },
    ];

    render(<SocialLinks links={linksWithoutTarget} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_self');
  });

  it('renders correct number of list items for given links', () => {
    render(<SocialLinks links={mockLinks} />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBe(mockLinks.length);
  });

  it('has proper semantic HTML structure', () => {
    render(<SocialLinks links={mockLinks} />);

    const list = screen.getByRole('list');
    expect(list.tagName).toBe('UL');
  });

  it('renders links without button elements', () => {
    render(<SocialLinks links={mockLinks} />);

    const buttons = screen.queryAllByRole('button');
    expect(buttons.length).toBe(0);
  });
});
