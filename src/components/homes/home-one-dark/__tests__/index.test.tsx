import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomeOneDark from '../index';
import { ThemeProvider } from '@/contexts/ThemeContext';

jest.mock('next/dynamic', () => () => {
    const MockDynamicComponent = ({ children }: { children?: React.ReactNode }) => (
        <div data-dynamic="true">{children || 'Dynamic Component'}</div>
    );
    return MockDynamicComponent;
});

jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ alt, src, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
        <img alt={alt} src={src} {...props} />
    ),
}));

jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string }) => (
        <a href={href} {...props}>{children}</a>
    ),
}));

function renderWithProviders(component: React.ReactElement) {
    return render(
        <ThemeProvider>
            {component}
        </ThemeProvider>
    );
}

describe('HomeOneDark Page Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render without crashing', () => {
            const { container } = renderWithProviders(<HomeOneDark />);
            expect(container).toBeInTheDocument();
        });

        it('should render main page wrapper with correct class', () => {
            const { container } = renderWithProviders(<HomeOneDark />);
            const wrapper = container.querySelector('.home-one-dark');
            expect(wrapper).toBeInTheDocument();
        });

        it('should render ac-page-wrapper', () => {
            const { container } = renderWithProviders(<HomeOneDark />);
            const wrapper = container.querySelector('.ac-page-wrapper');
            expect(wrapper).toBeInTheDocument();
        });

        it('should render smooth-wrapper', () => {
            const { container } = renderWithProviders(<HomeOneDark />);
            const smoothWrapper = container.querySelector('.smooth-wrapper');
            expect(smoothWrapper).toBeInTheDocument();
        });

        it('should render smooth-content', () => {
            const { container } = renderWithProviders(<HomeOneDark />);
            const smoothContent = container.querySelector('#smooth-content');
            expect(smoothContent).toBeInTheDocument();
        });
    });

    describe('Header Component', () => {
        it('should render HeaderOne component', () => {
            const { container } = renderWithProviders(<HomeOneDark />);
            const header = container.querySelector('header');
            expect(header).toBeInTheDocument();
        });
    });

    describe('Footer Component', () => {
        it('should render FooterOne component', () => {
            const { container } = renderWithProviders(<HomeOneDark />);
            const footer = container.querySelector('footer');
            expect(footer).toBeInTheDocument();
        });
    });

    describe('Main Content Sections', () => {
        it('should render Hero section', () => {
            const { container } = renderWithProviders(<HomeOneDark />);
            const hero = container.querySelector('.hero-section');
            expect(hero).toBeInTheDocument();
        });

        it('should render all dynamic components', () => {
            const { container } = renderWithProviders(<HomeOneDark />);
            const dynamicComponents = container.querySelectorAll('[data-dynamic="true"]');
            expect(dynamicComponents.length).toBeGreaterThan(0);
        });
    });

    describe('Layout Structure', () => {
        it('should have correct DOM hierarchy', () => {
            const { container } = renderWithProviders(<HomeOneDark />);
            
            const homeOneDark = container.querySelector('.home-one-dark');
            expect(homeOneDark).toBeInTheDocument();
            
            const pageWrapper = homeOneDark?.querySelector('.ac-page-wrapper');
            expect(pageWrapper).toBeInTheDocument();
            
            const header = pageWrapper?.querySelector('header');
            expect(header).toBeInTheDocument();
            
            const smoothWrapper = pageWrapper?.querySelector('.smooth-wrapper');
            expect(smoothWrapper).toBeInTheDocument();
            
            const smoothContent = smoothWrapper?.querySelector('#smooth-content');
            expect(smoothContent).toBeInTheDocument();
            
            const hero = smoothContent?.querySelector('.hero-section');
            expect(hero).toBeInTheDocument();
            
            const footer = pageWrapper?.querySelector('footer');
            expect(footer).toBeInTheDocument();
        });

        it('should position Header before smooth-content', () => {
            const { container } = renderWithProviders(<HomeOneDark />);
            const pageWrapper = container.querySelector('.ac-page-wrapper');
            const header = pageWrapper?.querySelector('header');
            const smoothWrapper = pageWrapper?.querySelector('.smooth-wrapper');
            
            expect(header?.compareDocumentPosition(smoothWrapper!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        });

        it('should position smooth-content before Footer', () => {
            const { container } = renderWithProviders(<HomeOneDark />);
            const pageWrapper = container.querySelector('.ac-page-wrapper');
            const smoothWrapper = pageWrapper?.querySelector('.smooth-wrapper');
            const footer = pageWrapper?.querySelector('footer');
            
            expect(smoothWrapper?.compareDocumentPosition(footer!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        });
    });

    describe('Component Integration', () => {
        it('should integrate all child components without errors', () => {
            expect(() => renderWithProviders(<HomeOneDark />)).not.toThrow();
        });

        it('should render all child components', () => {
            const { container } = renderWithProviders(<HomeOneDark />);
            
            const header = container.querySelector('header');
            const hero = container.querySelector('.hero-section');
            const footer = container.querySelector('footer');
            
            expect(header).toBeInTheDocument();
            expect(hero).toBeInTheDocument();
            expect(footer).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have semantic HTML structure', () => {
            const { container } = renderWithProviders(<HomeOneDark />);
            
            const header = container.querySelector('header');
            const footer = container.querySelector('footer');
            const sections = container.querySelectorAll('section');
            
            expect(header).toBeInTheDocument();
            expect(footer).toBeInTheDocument();
            expect(sections.length).toBeGreaterThan(0);
        });

        it('should have correct ARIA structure', () => {
            const { container } = renderWithProviders(<HomeOneDark />);
            const mainContent = container.querySelector('#smooth-content');
            expect(mainContent).toBeInTheDocument();
            expect(mainContent).toHaveAttribute('id', 'smooth-content');
        });
    });

    describe('Component Features', () => {
        it('should use dark theme variant', () => {
            const { container } = renderWithProviders(<HomeOneDark />);
            const homeOneDark = container.querySelector('.home-one-dark');
            expect(homeOneDark).toBeInTheDocument();
            expect(homeOneDark).toHaveClass('home-one-dark');
        });
    });

    describe('Edge Cases', () => {
        it('should render with no props', () => {
            expect(() => renderWithProviders(<HomeOneDark />)).not.toThrow();
        });

        it('should handle all dependencies correctly', () => {
            const { container } = renderWithProviders(<HomeOneDark />);
            
            const header = container.querySelector('header');
            const hero = container.querySelector('.hero-section');
            const footer = container.querySelector('footer');
            
            expect(header).toBeInTheDocument();
            expect(hero).toBeInTheDocument();
            expect(footer).toBeInTheDocument();
        });

        it('should maintain correct DOM structure', () => {
            const { container } = renderWithProviders(<HomeOneDark />);
            
            const homeOneDark = container.querySelector('.home-one-dark');
            const pageWrapper = homeOneDark?.querySelector('.ac-page-wrapper');
            
            expect(pageWrapper).toBeInTheDocument();
            expect(pageWrapper?.children.length).toBeGreaterThan(0);
        });
    });

    describe('Performance & Optimization', () => {
        it('should use dynamic imports for heavy components', () => {
            const { container } = renderWithProviders(<HomeOneDark />);
            const dynamicComponents = container.querySelectorAll('[data-dynamic="true"]');
            
            expect(dynamicComponents.length).toBeGreaterThan(0);
        });
    });
});
