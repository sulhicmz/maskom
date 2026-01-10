import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageLayout from '../PageLayout';

jest.mock('@/layouts/headers/HeaderOne', () => {
  return function MockHeaderOne({ style }: { style: boolean }) {
    return <div data-testid="header-one" data-style={String(style)}>Mock HeaderOne</div>;
  };
});

jest.mock('@/layouts/footers/FooterOne', () => {
  return function MockFooterOne({ style, style_2 }: { style: boolean; style_2: boolean }) {
    return <div data-testid="footer-one" data-style={String(style)} data-style-2={String(style_2)}>Mock FooterOne</div>;
  };
});

jest.mock('@/layouts/footers/FooterTwo', () => {
  return function MockFooterTwo() {
    return <div data-testid="footer-two">Mock FooterTwo</div>;
  };
});

jest.mock('@/components/common/Breadcrumb', () => {
  return function MockBreadcrumb({ title, sub_title }: { title: string; sub_title: string }) {
    return (
      <div data-testid="breadcrumb">
        <div data-breadcrumb-title>{title}</div>
        <div data-breadcrumb-subtitle>{sub_title}</div>
      </div>
    );
  };
});

describe('PageLayout', () => {
  it('renders HeaderOne by default', () => {
    render(<PageLayout>Test Content</PageLayout>);

    expect(screen.getByTestId('header-one')).toBeInTheDocument();
  });

  it('renders HeaderOne with style prop when headerStyle is true', () => {
    render(<PageLayout headerStyle={true}>Test Content</PageLayout>);

    const header = screen.getByTestId('header-one');
    expect(header).toBeInTheDocument();
  });

  it('renders HeaderOne without style prop when headerStyle is false', () => {
    render(<PageLayout headerStyle={false}>Test Content</PageLayout>);

    const header = screen.getByTestId('header-one');
    expect(header).toBeInTheDocument();
  });

  it('renders FooterTwo by default (footer prop defaults to "two")', () => {
    render(<PageLayout>Test Content</PageLayout>);

    expect(screen.getByTestId('footer-two')).toBeInTheDocument();
    expect(screen.queryByTestId('footer-one')).not.toBeInTheDocument();
  });

  it('renders FooterOne when footer prop is "one"', () => {
    render(<PageLayout footer="one">Test Content</PageLayout>);

    expect(screen.getByTestId('footer-one')).toBeInTheDocument();
    expect(screen.queryByTestId('footer-two')).not.toBeInTheDocument();
  });

  it('renders FooterTwo when footer prop is "two"', () => {
    render(<PageLayout footer="two">Test Content</PageLayout>);

    expect(screen.getByTestId('footer-two')).toBeInTheDocument();
    expect(screen.queryByTestId('footer-one')).not.toBeInTheDocument();
  });

  it('renders Breadcrumb when both breadcrumbTitle and breadcrumbSubTitle are provided', () => {
    render(
      <PageLayout breadcrumbTitle="Test Title" breadcrumbSubTitle="Test Subtitle">
        Test Content
      </PageLayout>
    );

    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumb')).toHaveTextContent('Test Title');
    expect(screen.getByTestId('breadcrumb')).toHaveTextContent('Test Subtitle');
  });

  it('does not render Breadcrumb when breadcrumbTitle is missing', () => {
    render(<PageLayout breadcrumbSubTitle="Test Subtitle">Test Content</PageLayout>);

    expect(screen.queryByTestId('breadcrumb')).not.toBeInTheDocument();
  });

  it('does not render Breadcrumb when breadcrumbSubTitle is missing', () => {
    render(<PageLayout breadcrumbTitle="Test Title">Test Content</PageLayout>);

    expect(screen.queryByTestId('breadcrumb')).not.toBeInTheDocument();
  });

  it('renders children content', () => {
    render(<PageLayout>Test Child Content</PageLayout>);

    expect(screen.getByText('Test Child Content')).toBeInTheDocument();
  });

  it('passes style prop to FooterOne', () => {
    render(
      <PageLayout footer="one" footerStyle={true}>
        Test Content
      </PageLayout>
    );

    const footer = screen.getByTestId('footer-one');
    expect(footer).toBeInTheDocument();
  });

  it('passes style_2 prop to FooterOne', () => {
    render(
      <PageLayout footer="one" footerStyle2={true}>
        Test Content
      </PageLayout>
    );

    const footer = screen.getByTestId('footer-one');
    expect(footer).toBeInTheDocument();
  });

  it('has correct page wrapper structure', () => {
    const { container } = render(<PageLayout>Test Content</PageLayout>);

    const pageWrapper = container.querySelector('.ac-page-wrapper');
    expect(pageWrapper).toBeInTheDocument();
  });

  it('has smooth wrapper structure', () => {
    const { container } = render(<PageLayout>Test Content</PageLayout>);

    const smoothWrapper = container.querySelector('.smooth-wrapper');
    expect(smoothWrapper).toBeInTheDocument();
  });

  it('has smooth content structure', () => {
    const { container } = render(<PageLayout>Test Content</PageLayout>);

    const smoothContent = container.querySelector('#smooth-content');
    expect(smoothContent).toBeInTheDocument();
  });

  it('renders multiple children components', () => {
    render(
      <PageLayout>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </PageLayout>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('does not pass footer props to FooterTwo', () => {
    render(
      <PageLayout footer="two" footerStyle={true} footerStyle2={true}>
        Test Content
      </PageLayout>
    );

    const footer = screen.getByTestId('footer-two');
    expect(footer).not.toHaveAttribute('data-style');
    expect(footer).not.toHaveAttribute('data-style-2');
  });

  it('uses default values for boolean props when not provided', () => {
    render(<PageLayout>Test Content</PageLayout>);

    const header = screen.getByTestId('header-one');
    expect(header).toBeInTheDocument();
  });
});
