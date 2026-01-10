import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PricingArea from '../PricingArea';

jest.mock('@/data/PriceData', () => ({
  pricing_price: [
    {
      id: 1,
      price_details: [
        {
          id: 1,
          sub_title: 'Starter',
          price: 1500000,
          currency: 'IDR',
          price_label: null,
          note: 'per bulan',
          btn: 'Hubungi Kami',
          feature: ['Konektivitas Internet 50 Mbps', 'Monitoring 24/7', 'Support Email'],
        },
        {
          id: 2,
          sub_title: 'Business',
          price: 5000000,
          currency: 'IDR',
          price_label: null,
          note: 'per bulan',
          btn: 'Hubungi Kami',
          feature: ['Konektivitas Internet 200 Mbps', 'Monitoring 24/7', 'Support Prioritas', 'SLA 99.5%'],
        },
      ],
    },
    {
      id: 2,
      price_details: [
        {
          id: 3,
          sub_title: 'Security Basic',
          price: 0,
          currency: 'IDR',
          price_label: 'Custom',
          note: 'sesuai kebutuhan',
          btn: 'Hubungi Kami',
          feature: ['Firewall Basic', 'VPN Access', 'Security Monitoring'],
        },
      ],
    },
  ],
}));

describe('PricingArea', () => {
  it('renders pricing section with title and description', () => {
    render(<PricingArea />);

    expect(screen.getByText('Paket Layanan')).toBeInTheDocument();
    expect(screen.getByText('Investasi Infrastruktur Digital Maskom')).toBeInTheDocument();
    expect(screen.getByText(/Pilih kombinasi layanan/)).toBeInTheDocument();
  });

  it('renders both pricing tabs', () => {
    render(<PricingArea />);

    expect(screen.getByText('Konektivitas Terkelola')).toBeInTheDocument();
    expect(screen.getByText('Keamanan & Dukungan')).toBeInTheDocument();
  });

  it('renders first tab as active by default', () => {
    render(<PricingArea />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveClass('active');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[0]).toHaveAttribute('tabIndex', '0');
    expect(tabs[1]).not.toHaveClass('active');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[1]).toHaveAttribute('tabIndex', '-1');
  });

  it('switches active tab on click', () => {
    render(<PricingArea />);

    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[1]);

    expect(tabs[0]).not.toHaveClass('active');
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
    expect(tabs[1]).toHaveClass('active');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('switches back to first tab when clicking first tab', () => {
    render(<PricingArea />);

    const tabs = screen.getAllByRole('tab');
    const firstTab = tabs[0];
    const secondTab = tabs[1];

    fireEvent.click(secondTab);
    fireEvent.click(firstTab);

    expect(firstTab).toHaveClass('active');
    expect(secondTab).not.toHaveClass('active');
  });

  it('renders pricing items for the first tab', () => {
    render(<PricingArea />);

    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Business')).toBeInTheDocument();
    expect(screen.getByText('Konektivitas Internet 50 Mbps')).toBeInTheDocument();
  });

  it('updates pricing content when tab changes', () => {
    render(<PricingArea />);

    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[1]);

    expect(screen.getByText('Security Basic')).toBeInTheDocument();
    expect(screen.getByText('Firewall Basic')).toBeInTheDocument();
  });

  it('formats IDR currency correctly with Indonesian locale', () => {
    const { container } = render(<PricingArea />);

    const currencySpans = container.querySelectorAll('.currency');
    expect(currencySpans.length).toBeGreaterThan(0);
    expect(currencySpans[0].textContent).toBe('Rp');
    expect(screen.getByText('1.500.000')).toBeInTheDocument();
    expect(screen.getByText('5.000.000')).toBeInTheDocument();
  });

  it('renders custom price label when provided', () => {
    render(<PricingArea />);

    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[1]);

    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('renders pricing features as check list', () => {
    render(<PricingArea />);

    expect(screen.getByText('Konektivitas Internet 50 Mbps')).toBeInTheDocument();
    expect(screen.getAllByText('Monitoring 24/7')).toHaveLength(2);
    expect(screen.getByText('Support Email')).toBeInTheDocument();
  });

  it('renders contact buttons for pricing plans', () => {
    render(<PricingArea />);

    const contactButtons = screen.getAllByText('Hubungi Kami');
    expect(contactButtons.length).toBeGreaterThan(0);
  });

  it('handles keyboard navigation with Enter key', () => {
    render(<PricingArea />);

    const tabs = screen.getAllByRole('tab');
    fireEvent.keyDown(tabs[1], { key: 'Enter' });

    expect(tabs[0]).not.toHaveClass('active');
    expect(tabs[1]).toHaveClass('active');
  });

  it('handles keyboard navigation with Space key', () => {
    render(<PricingArea />);

    const tabs = screen.getAllByRole('tab');
    fireEvent.keyDown(tabs[1], { key: ' ' });

    expect(tabs[0]).not.toHaveClass('active');
    expect(tabs[1]).toHaveClass('active');
  });

  it('handles keyboard navigation with ArrowRight key', () => {
    render(<PricingArea />);

    const tabs = screen.getAllByRole('tab');
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });

    expect(tabs[0]).not.toHaveClass('active');
    expect(tabs[1]).toHaveClass('active');
  });

  it('handles keyboard navigation with ArrowLeft key', () => {
    render(<PricingArea />);

    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[1]);
    fireEvent.keyDown(tabs[1], { key: 'ArrowLeft' });

    expect(tabs[0]).toHaveClass('active');
    expect(tabs[1]).not.toHaveClass('active');
  });

  it('wraps around when pressing ArrowRight on last tab', () => {
    render(<PricingArea />);

    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[1]);
    fireEvent.keyDown(tabs[1], { key: 'ArrowRight' });

    expect(tabs[0]).toHaveClass('active');
    expect(tabs[1]).not.toHaveClass('active');
  });

  it('wraps around when pressing ArrowLeft on first tab', () => {
    render(<PricingArea />);

    const tabs = screen.getAllByRole('tab');
    fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' });

    expect(tabs[0]).not.toHaveClass('active');
    expect(tabs[1]).toHaveClass('active');
  });

  it('does not switch tabs for non-navigation keys', () => {
    render(<PricingArea />);

    const tabs = screen.getAllByRole('tab');
    const initialActiveClass = tabs[0].className;
    fireEvent.keyDown(tabs[0], { key: 'Escape' });

    expect(tabs[0]).toHaveClass('active');
    expect(initialActiveClass).toContain('active');
  });

  it('has proper ARIA attributes for tabs', () => {
    render(<PricingArea />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('role', 'tab');
    expect(tabs[0]).toHaveAttribute('aria-controls', 'pricing-tabpanel-0');
    expect(tabs[0]).toHaveAttribute('id', 'pricing-tab-0');
    expect(tabs[1]).toHaveAttribute('aria-controls', 'pricing-tabpanel-1');
    expect(tabs[1]).toHaveAttribute('id', 'pricing-tab-1');
  });

  it('has proper ARIA attributes for tabpanels', () => {
    render(<PricingArea />);

    const firstPanel = document.getElementById('pricing-tabpanel-0');
    const secondPanel = document.getElementById('pricing-tabpanel-1');

    expect(firstPanel).toBeInTheDocument();
    expect(firstPanel).toHaveAttribute('role', 'tabpanel');
    expect(firstPanel).toHaveAttribute('aria-labelledby', 'pricing-tab-0');
    expect(secondPanel).toBeInTheDocument();
    expect(secondPanel).toHaveAttribute('role', 'tabpanel');
    expect(secondPanel).toHaveAttribute('aria-labelledby', 'pricing-tab-1');
  });

  it('hides inactive tab panels', () => {
    render(<PricingArea />);

    const firstPanel = document.getElementById('pricing-tabpanel-0');
    const secondPanel = document.getElementById('pricing-tabpanel-1');

    expect(firstPanel).not.toHaveAttribute('hidden');
    expect(secondPanel).toHaveAttribute('hidden');
  });

  it('shows active tab panel', () => {
    render(<PricingArea />);

    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[1]);

    const firstPanel = document.getElementById('pricing-tabpanel-0');
    const secondPanel = document.getElementById('pricing-tabpanel-1');

    expect(firstPanel).toHaveAttribute('hidden');
    expect(secondPanel).not.toHaveAttribute('hidden');
  });

  it('maintains tab state independently from other interactions', () => {
    render(<PricingArea />);

    const tabs = screen.getAllByRole('tab');
    const firstTab = tabs[0];

    fireEvent.click(firstTab);
    fireEvent.click(firstTab);
    fireEvent.click(firstTab);

    expect(firstTab).toHaveClass('active');
  });

  it('handles multiple rapid tab switches correctly', () => {
    render(<PricingArea />);

    const tabs = screen.getAllByRole('tab');
    const firstTab = tabs[0];
    const secondTab = tabs[1];

    fireEvent.click(secondTab);
    fireEvent.click(firstTab);
    fireEvent.click(secondTab);
    fireEvent.click(firstTab);
    fireEvent.click(secondTab);

    expect(firstTab).not.toHaveClass('active');
    expect(secondTab).toHaveClass('active');
  });

  it('has proper section structure with aria-label', () => {
    render(<PricingArea />);

    const section = document.querySelector('[aria-label="Pricing Plans"]');
    expect(section).toBeInTheDocument();
  });

  it('has proper tablist role', () => {
    render(<PricingArea />);

    const tablist = document.querySelector('[role="tablist"]');
    expect(tablist).toBeInTheDocument();
    expect(tablist).toHaveAttribute('aria-label', 'Pricing Category Tabs');
  });

  it('renders pricing notes when provided', () => {
    render(<PricingArea />);

    expect(screen.getAllByText('per bulan')).toHaveLength(2);
    expect(screen.getByText('sesuai kebutuhan')).toBeInTheDocument();
  });

  it('handles empty pricing data gracefully', () => {
    render(<PricingArea />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(2);
  });

  it('updates tabIndex when tab becomes active', () => {
    render(<PricingArea />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs[0]).toHaveAttribute('tabIndex', '0');
    expect(tabs[1]).toHaveAttribute('tabIndex', '-1');

    fireEvent.click(tabs[1]);
    expect(tabs[0]).toHaveAttribute('tabIndex', '-1');
    expect(tabs[1]).toHaveAttribute('tabIndex', '0');
  });
});
