import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from '../Sidebar';

describe('Sidebar', () => {
  it('renders sidebar with Dashboard title', () => {
    const mockOnModuleChange = jest.fn();
    render(<Sidebar onModuleChange={mockOnModuleChange} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    const mockOnModuleChange = jest.fn();
    render(<Sidebar onModuleChange={mockOnModuleChange} />);

    expect(screen.getByText('WiFi Monitor')).toBeInTheDocument();
    expect(screen.getByText('Website Builder')).toBeInTheDocument();
    expect(screen.getByText('AI Automation')).toBeInTheDocument();
  });

  it('calls onModuleChange with "wifi" when WiFi Monitor button is clicked', () => {
    const mockOnModuleChange = jest.fn();
    render(<Sidebar onModuleChange={mockOnModuleChange} />);

    const wifiButton = screen.getByText('WiFi Monitor');
    fireEvent.click(wifiButton);

    expect(mockOnModuleChange).toHaveBeenCalledTimes(1);
    expect(mockOnModuleChange).toHaveBeenCalledWith('wifi');
  });

  it('calls onModuleChange with "website" when Website Builder button is clicked', () => {
    const mockOnModuleChange = jest.fn();
    render(<Sidebar onModuleChange={mockOnModuleChange} />);

    const websiteButton = screen.getByText('Website Builder');
    fireEvent.click(websiteButton);

    expect(mockOnModuleChange).toHaveBeenCalledTimes(1);
    expect(mockOnModuleChange).toHaveBeenCalledWith('website');
  });

  it('calls onModuleChange with "ai" when AI Automation button is clicked', () => {
    const mockOnModuleChange = jest.fn();
    render(<Sidebar onModuleChange={mockOnModuleChange} />);

    const aiButton = screen.getByText('AI Automation');
    fireEvent.click(aiButton);

    expect(mockOnModuleChange).toHaveBeenCalledTimes(1);
    expect(mockOnModuleChange).toHaveBeenCalledWith('ai');
  });

  it('has correct CSS classes for sidebar', () => {
    const mockOnModuleChange = jest.fn();
    const { container } = render(<Sidebar onModuleChange={mockOnModuleChange} />);

    const sidebar = container.querySelector('.sidebar');
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass('bg-light');
    expect(sidebar).toHaveClass('p-3');
  });

  it('renders navigation as nav flex-column', () => {
    const mockOnModuleChange = jest.fn();
    const { container } = render(<Sidebar onModuleChange={mockOnModuleChange} />);

    const nav = container.querySelector('.nav');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass('flex-column');
  });

  it('renders all nav items with correct button structure', () => {
    const mockOnModuleChange = jest.fn();
    render(<Sidebar onModuleChange={mockOnModuleChange} />);

    const navLinks = screen.getAllByRole('button');
    expect(navLinks.length).toBe(3);
  });

  it('handles multiple clicks on same module', () => {
    const mockOnModuleChange = jest.fn();
    render(<Sidebar onModuleChange={mockOnModuleChange} />);

    const wifiButton = screen.getByText('WiFi Monitor');
    fireEvent.click(wifiButton);
    fireEvent.click(wifiButton);

    expect(mockOnModuleChange).toHaveBeenCalledTimes(2);
    expect(mockOnModuleChange).toHaveBeenNthCalledWith(1, 'wifi');
    expect(mockOnModuleChange).toHaveBeenNthCalledWith(2, 'wifi');
  });

  it('handles module switching between different modules', () => {
    const mockOnModuleChange = jest.fn();
    render(<Sidebar onModuleChange={mockOnModuleChange} />);

    const wifiButton = screen.getByText('WiFi Monitor');
    const websiteButton = screen.getByText('Website Builder');
    const aiButton = screen.getByText('AI Automation');

    fireEvent.click(wifiButton);
    fireEvent.click(websiteButton);
    fireEvent.click(aiButton);

    expect(mockOnModuleChange).toHaveBeenCalledTimes(3);
    expect(mockOnModuleChange).toHaveBeenNthCalledWith(1, 'wifi');
    expect(mockOnModuleChange).toHaveBeenNthCalledWith(2, 'website');
    expect(mockOnModuleChange).toHaveBeenNthCalledWith(3, 'ai');
  });

  it('preserves navigation order (WiFi Monitor, Website Builder, AI Automation)', () => {
    const mockOnModuleChange = jest.fn();
    render(<Sidebar onModuleChange={mockOnModuleChange} />);

    const navLinks = screen.getAllByRole('button');
    expect(navLinks[0]).toHaveTextContent('WiFi Monitor');
    expect(navLinks[1]).toHaveTextContent('Website Builder');
    expect(navLinks[2]).toHaveTextContent('AI Automation');
  });

  it('has displayName set for React DevTools', () => {
    const mockOnModuleChange = jest.fn();
    render(<Sidebar onModuleChange={mockOnModuleChange} />);

    expect(Sidebar.displayName).toBe('Sidebar');
  });
});
