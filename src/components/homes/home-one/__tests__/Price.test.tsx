import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Price from '../Price';

describe('Price', () => {
  it('renders pricing section with all tabs', () => {
    render(<Price />);

    expect(screen.getByText('Paket Layanan')).toBeInTheDocument();
    expect(screen.getByText('Pilih Skema Layanan Sesuai Kebutuhan Anda')).toBeInTheDocument();
    expect(screen.getByText('Kontrak 12 Bulan')).toBeInTheDocument();
    expect(screen.getByText('Kontrak 36 Bulan')).toBeInTheDocument();
  });

  it('renders first tab as active by default', () => {
    render(<Price />);

    const tabs = screen.getAllByRole('button');
    const firstTab = tabs[0];
    const secondTab = tabs[1];

    expect(firstTab).toHaveClass('active');
    expect(secondTab).not.toHaveClass('active');
  });

  it('switches active tab on click', () => {
    render(<Price />);

    const tabs = screen.getAllByRole('button');
    const secondTab = tabs[1];

    fireEvent.click(secondTab);

    expect(tabs[0]).not.toHaveClass('active');
    expect(secondTab).toHaveClass('active');
  });

  it('switches back to first tab when clicking first tab', () => {
    render(<Price />);

    const tabs = screen.getAllByRole('button');
    const firstTab = tabs[0];
    const secondTab = tabs[1];

    fireEvent.click(secondTab);
    fireEvent.click(firstTab);

    expect(firstTab).toHaveClass('active');
    expect(secondTab).not.toHaveClass('active');
  });

  it('renders pricing items for the active tab', () => {
    render(<Price />);

    const contactButton = screen.getAllByText(/hubungi kami/i);
    expect(contactButton.length).toBeGreaterThan(0);
  });

  it('formats IDR currency correctly', () => {
    render(<Price />);

    expect(screen.getAllByText(/Rp/i).length).toBeGreaterThan(0);
  });

  it('renders pricing features as check list', () => {
    render(<Price />);

    const checkListItems = screen.queryAllByRole('listitem');
    expect(checkListItems.length).toBeGreaterThan(0);
  });

  it('has proper section structure with IDs', () => {
    render(<Price />);

    const section = document.querySelector('#paket');
    expect(section).toBeInTheDocument();
  });

  it('renders subscribe/cta buttons for pricing plans', () => {
    render(<Price />);

    const ctaButtons = screen.getAllByText(/minta proposal/i);
    expect(ctaButtons.length).toBeGreaterThan(0);
  });

  it('maintains tab state independently from other interactions', () => {
    render(<Price />);

    const tabs = screen.getAllByRole('button');
    const firstTab = tabs[0];
    const secondTab = tabs[1];

    fireEvent.click(secondTab);
    fireEvent.click(secondTab);
    fireEvent.click(firstTab);

    expect(firstTab).toHaveClass('active');
    expect(secondTab).not.toHaveClass('active');
  });

  it('handles multiple tab switches correctly', () => {
    render(<Price />);

    const tabs = screen.getAllByRole('button');
    const firstTab = tabs[0];
    const secondTab = tabs[1];

    fireEvent.click(firstTab);
    expect(firstTab).toHaveClass('active');

    fireEvent.click(secondTab);
    expect(secondTab).toHaveClass('active');

    fireEvent.click(firstTab);
    expect(firstTab).toHaveClass('active');

    fireEvent.click(secondTab);
    expect(secondTab).toHaveClass('active');
  });
});
