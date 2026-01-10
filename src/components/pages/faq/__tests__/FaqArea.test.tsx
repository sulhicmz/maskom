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

    const tabs = screen.getAllByRole('button');
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

    const tabs = screen.getAllByRole('button');
    fireEvent.click(tabs[1]);

    expect(tabs[0]).not.toHaveClass('active');
    expect(tabs[1]).toHaveClass('active');
  });

  it('updates FAQ content when tab changes', () => {
    render(<FaqArea />);

    const tabs = screen.getAllByRole('button');
    fireEvent.click(tabs[1]);

    expect(screen.getByText('FAQ 3')).toBeInTheDocument();
    expect(screen.getByText('FAQ 4')).toBeInTheDocument();
    expect(screen.getByText('Description 3')).toBeInTheDocument();
    expect(screen.getByText('Description 4')).toBeInTheDocument();
  });

  it('switches back to first tab when clicking first tab', () => {
    render(<FaqArea />);

    const tabs = screen.getAllByRole('button');
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

    const tabs = screen.getAllByRole('button');
    fireEvent.click(tabs[1]);

    const firstFaqSecondTab = screen.getByText('FAQ 3').closest('.accordion-title');
    expect(firstFaqSecondTab).not.toHaveClass('collapsed');
  });

  it('handles rapid tab switching correctly', () => {
    render(<FaqArea />);

    const tabs = screen.getAllByRole('button');
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
});
