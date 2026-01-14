import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FaqArea from '../FaqArea';

jest.mock('@/data/InnerFaqData', () => [
  {
    title: 'Layanan Konektivitas',
    faq_details: [
      { id: 1, title: 'FAQ 1', desc: 'Description 1' },
      { id: 2, title: 'FAQ 2', desc: 'Description 2' },
    ],
  },
  {
    title: 'Operasional & Dukungan',
    faq_details: [
      { id: 3, title: 'FAQ 3', desc: 'Description 3' },
      { id: 4, title: 'FAQ 4', desc: 'Description 4' },
    ],
  },
  {
    title: 'Administrasi & Kontrak',
    faq_details: [],
  },
]);

describe('FaqArea', () => {
  it('renders FAQ section with tab titles', () => {
    render(<FaqArea />);

    expect(screen.getByText('Layanan Konektivitas')).toBeInTheDocument();
    expect(screen.getByText('Operasional & Dukungan')).toBeInTheDocument();
    expect(screen.getByText('Administrasi & Kontrak')).toBeInTheDocument();
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('renders first tab as active by default', () => {
    render(<FaqArea />);

    const tabs = document.querySelectorAll('button[role="tab"]');
    expect(tabs[0]).toHaveClass('active');
    expect(tabs[1]).not.toHaveClass('active');
    expect(tabs[2]).not.toHaveClass('active');
  });

  it('renders FAQ items for active tab', () => {
    render(<FaqArea />);

    expect(screen.getByText('FAQ 1')).toBeInTheDocument();
    expect(screen.getByText('FAQ 2')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  it('switches to second tab on click', () => {
    render(<FaqArea />);

    const tabs = document.querySelectorAll('button[role="tab"]');
    fireEvent.click(tabs[1]);

    expect(tabs[0]).not.toHaveClass('active');
    expect(tabs[1]).toHaveClass('active');
  });

  it('updates FAQ content when tab changes', () => {
    render(<FaqArea />);

    const tabs = document.querySelectorAll('button[role="tab"]');
    fireEvent.click(tabs[1]);

    expect(screen.getByText('FAQ 3')).toBeInTheDocument();
    expect(screen.getByText('FAQ 4')).toBeInTheDocument();
    expect(screen.getByText('Description 3')).toBeInTheDocument();
    expect(screen.getByText('Description 4')).toBeInTheDocument();
  });

  it('switches back to first tab when clicking first tab', () => {
    render(<FaqArea />);

    const tabs = document.querySelectorAll('button[role="tab"]');
    fireEvent.click(tabs[1]);
    fireEvent.click(tabs[0]);

    expect(tabs[0]).toHaveClass('active');
    expect(tabs[1]).not.toHaveClass('active');
  });

  it('expands first FAQ item by default', () => {
    render(<FaqArea />);

    const firstFaq = screen.getByText('FAQ 1').closest('.accordion-title');
    expect(firstFaq).not.toHaveClass('collapsed');
    expect(screen.getByText('Description 1')).toBeVisible();
  });

  it('collapses first FAQ when second FAQ is clicked', () => {
    render(<FaqArea />);

    const secondFaq = screen.getByText('FAQ 2');
    fireEvent.click(secondFaq);

    const firstFaq = screen.getByText('FAQ 1').closest('.accordion-title');
    expect(firstFaq).toHaveClass('collapsed');
  });

  it('expands clicked FAQ item', () => {
    render(<FaqArea />);

    const secondFaq = screen.getByText('FAQ 2');
    fireEvent.click(secondFaq);

    const secondFaqTitle = secondFaq.closest('.accordion-title');
    expect(secondFaqTitle).not.toHaveClass('collapsed');
    expect(screen.getByText('Description 2')).toBeVisible();
  });

  it('maintains accordion state within the same tab', () => {
    render(<FaqArea />);

    const firstFaq = screen.getByText('FAQ 1');
    const secondFaq = screen.getByText('FAQ 2');

    fireEvent.click(secondFaq);
    expect(firstFaq.closest('.accordion-title')).toHaveClass('collapsed');

    fireEvent.click(firstFaq);
    expect(firstFaq.closest('.accordion-title')).not.toHaveClass('collapsed');
  });

  it('resets accordion to first item when switching tabs', () => {
    render(<FaqArea />);

    const secondFaq = screen.getByText('FAQ 2');
    fireEvent.click(secondFaq);

    const tabs = document.querySelectorAll('button[role="tab"]');
    fireEvent.click(tabs[1]);

    const firstFaqSecondTab = screen.getByText('FAQ 3').closest('.accordion-title');
    expect(firstFaqSecondTab).not.toHaveClass('collapsed');
  });

  it('handles rapid tab switching correctly', () => {
    render(<FaqArea />);

    const tabs = document.querySelectorAll('button[role="tab"]');
    fireEvent.click(tabs[1]);
    fireEvent.click(tabs[2]);
    fireEvent.click(tabs[0]);

    expect(tabs[0]).toHaveClass('active');
    expect(tabs[1]).not.toHaveClass('active');
    expect(tabs[2]).not.toHaveClass('active');
  });

  it('renders FAQ items with correct structure', () => {
    render(<FaqArea />);

    const accordion = document.querySelector('.accordion');
    expect(accordion).toBeInTheDocument();
    expect(accordion).toHaveAttribute('id', 'accordionTwo');

    const cards = document.querySelectorAll('.accordion-card');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('handles tab switching without errors', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    render(<FaqArea />);

    const tabs = screen.getAllByRole('button');
    tabs.forEach((tab) => fireEvent.click(tab));

    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('has proper section structure and CSS classes', () => {
    const { container } = render(<FaqArea />);

    const section = container.querySelector('.faqs-section');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('pt-115');
    expect(section).toHaveClass('pb-80');
  });

  it('displays Categories heading', () => {
    render(<FaqArea />);

    expect(screen.getByText('Categories')).toBeInTheDocument();
    const heading = screen.getByText('Categories').closest('h6');
    expect(heading).toBeInTheDocument();
  });

  it('uses "use client" directive (client component)', () => {
    render(<FaqArea />);
    
    expect(document.querySelector('.faqs-section')).toBeInTheDocument();
  });

  describe('Accessibility - Tab ARIA Attributes', () => {
    it('has proper tablist role on tab container', () => {
      render(<FaqArea />);
      
      const tabList = document.querySelector('ul.nav.nav-tabs');
      expect(tabList).toHaveAttribute('role', 'tablist');
    });

    it('has tab role on all tab buttons', () => {
      render(<FaqArea />);
      
      const tabs = document.querySelectorAll('button[role="tab"]');
      expect(tabs.length).toBe(3);
    });

    it('has aria-selected on tab buttons', () => {
      render(<FaqArea />);
      
      const tabs = document.querySelectorAll('button[role="tab"]');
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
    });

    it('updates aria-selected when tab changes', () => {
      render(<FaqArea />);
      
      const tabs = document.querySelectorAll('button[role="tab"]');
      fireEvent.click(tabs[1]);
      
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[2]).toHaveAttribute('aria-selected', 'false');
    });

    it('has aria-controls on tab buttons linking to tab panels', () => {
      render(<FaqArea />);
      
      const tabs = document.querySelectorAll('button[role="tab"]');
      expect(tabs[0]).toHaveAttribute('aria-controls', 'faq-panel-0');
      expect(tabs[1]).toHaveAttribute('aria-controls', 'faq-panel-1');
      expect(tabs[2]).toHaveAttribute('aria-controls', 'faq-panel-2');
    });

    it('has tabpanel role on active tab panel', () => {
      render(<FaqArea />);
      
      const activePanel = document.querySelector('[role="tabpanel"]');
      expect(activePanel).toBeInTheDocument();
      expect(activePanel).toHaveAttribute('aria-labelledby', 'faq-tab-0');
    });

    it('has aria-labelledby on tab panel linking to tab button', () => {
      render(<FaqArea />);
      
      const activePanel = document.querySelector('[role="tabpanel"]');
      expect(activePanel).toHaveAttribute('aria-labelledby', 'faq-tab-0');
    });

    it('updates aria-labelledby when tab changes', () => {
      render(<FaqArea />);
      
      const tabs = document.querySelectorAll('button[role="tab"]');
      fireEvent.click(tabs[1]);
      
      const activePanel = document.querySelector('[role="tabpanel"]');
      expect(activePanel).toHaveAttribute('aria-labelledby', 'faq-tab-1');
    });

    it('has tabIndex for keyboard navigation', () => {
      render(<FaqArea />);
      
      const tabs = document.querySelectorAll('button[role="tab"]');
      expect(tabs[0]).toHaveAttribute('tabIndex', '0');
      expect(tabs[1]).toHaveAttribute('tabIndex', '-1');
      expect(tabs[2]).toHaveAttribute('tabIndex', '-1');
    });

    it('updates tabIndex when tab changes', () => {
      render(<FaqArea />);
      
      const tabs = document.querySelectorAll('button[role="tab"]');
      fireEvent.click(tabs[1]);
      
      expect(tabs[0]).toHaveAttribute('tabIndex', '-1');
      expect(tabs[1]).toHaveAttribute('tabIndex', '0');
      expect(tabs[2]).toHaveAttribute('tabIndex', '-1');
    });
  });

  describe('Accessibility - Keyboard Navigation', () => {
    it('navigates to next tab with ArrowRight', () => {
      render(<FaqArea />);
      
      const tabs = document.querySelectorAll('button[role="tab"]');
      const firstTab = tabs[0] as HTMLButtonElement;
      
      fireEvent.keyDown(firstTab, { key: 'ArrowRight' });
      
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    });

    it('navigates to previous tab with ArrowLeft', () => {
      render(<FaqArea />);
      
      const tabs = document.querySelectorAll('button[role="tab"]');
      fireEvent.click(tabs[1]);
      
      const secondTab = tabs[1] as HTMLButtonElement;
      fireEvent.keyDown(secondTab, { key: 'ArrowLeft' });
      
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    });

    it('navigates to last tab with End', () => {
      render(<FaqArea />);
      
      const tabs = document.querySelectorAll('button[role="tab"]');
      const firstTab = tabs[0] as HTMLButtonElement;
      
      fireEvent.keyDown(firstTab, { key: 'End' });
      
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[2]).toHaveAttribute('aria-selected', 'true');
    });

    it('navigates to first tab with Home', () => {
      render(<FaqArea />);
      
      const tabs = document.querySelectorAll('button[role="tab"]');
      fireEvent.click(tabs[1]);
      
      const secondTab = tabs[1] as HTMLButtonElement;
      fireEvent.keyDown(secondTab, { key: 'Home' });
      
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    });

    it('activates tab with Enter key', () => {
      render(<FaqArea />);
      
      const tabs = document.querySelectorAll('button[role="tab"]');
      const secondTab = tabs[1] as HTMLButtonElement;
      
      secondTab.focus();
      fireEvent.keyDown(secondTab, { key: 'Enter' });
      
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveClass('active');
    });

    it('activates tab with Space key', () => {
      render(<FaqArea />);
      
      const tabs = document.querySelectorAll('button[role="tab"]');
      const secondTab = tabs[1] as HTMLButtonElement;
      
      secondTab.focus();
      fireEvent.keyDown(secondTab, { key: ' ' });
      
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveClass('active');
    });

    it('navigates to next tab with ArrowDown', () => {
      render(<FaqArea />);
      
      const tabs = document.querySelectorAll('button[role="tab"]');
      const firstTab = tabs[0] as HTMLButtonElement;
      
      fireEvent.keyDown(firstTab, { key: 'ArrowDown' });
      
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
    });

    it('navigates to previous tab with ArrowUp', () => {
      render(<FaqArea />);
      
      const tabs = document.querySelectorAll('button[role="tab"]');
      fireEvent.click(tabs[1]);
      
      const secondTab = tabs[1] as HTMLButtonElement;
      fireEvent.keyDown(secondTab, { key: 'ArrowUp' });
      
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Accessibility - Section Label', () => {
    it('has aria-label on section for screen readers', () => {
      render(<FaqArea />);
      
      const section = document.querySelector('.faqs-section');
      expect(section).toHaveAttribute('aria-label', 'Frequently Asked Questions');
    });

    it('has id on categories heading for aria-labelledby', () => {
      render(<FaqArea />);
      
      const heading = screen.getByText('Categories').closest('h6');
      expect(heading).toHaveAttribute('id', 'faq-categories-heading');
    });

    it('has aria-labelledby on tablist linking to heading', () => {
      render(<FaqArea />);
      
      const tabList = document.querySelector('ul.nav.nav-tabs');
      expect(tabList).toHaveAttribute('aria-labelledby', 'faq-categories-heading');
    });
  });
});
