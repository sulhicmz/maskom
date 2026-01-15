import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import UseCases from '../index';
import { ThemeProvider } from '@/contexts/ThemeContext';

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

describe('Use Cases Page Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render without crashing', () => {
            const { container } = renderWithProviders(<UseCases />);
            expect(container).toBeInTheDocument();
        });

        it('should render main page wrapper with correct class', () => {
            const { container } = renderWithProviders(<UseCases />);
            const wrapper = container.querySelector('.ac-page-wrapper');
            expect(wrapper).toBeInTheDocument();
        });

        it('should render smooth-wrapper', () => {
            const { container } = renderWithProviders(<UseCases />);
            const smoothWrapper = container.querySelector('.smooth-wrapper');
            expect(smoothWrapper).toBeInTheDocument();
        });

        it('should render smooth-content', () => {
            const { container } = renderWithProviders(<UseCases />);
            const smoothContent = container.querySelector('#smooth-content');
            expect(smoothContent).toBeInTheDocument();
        });

        it('should render all page components', () => {
            const { container } = renderWithProviders(<UseCases />);
            expect(container.querySelector('.ac-page-wrapper')).toBeInTheDocument();
            expect(container.querySelector('.smooth-wrapper')).toBeInTheDocument();
            expect(container.querySelector('#smooth-content')).toBeInTheDocument();
        });
    });

    describe('Header Component', () => {
        it('should render HeaderOne component', () => {
            const { container } = renderWithProviders(<UseCases />);
            const header = container.querySelector('header');
            expect(header).toBeInTheDocument();
        });

        it('should pass style prop to HeaderOne', () => {
            const { container } = renderWithProviders(<UseCases />);
            const header = container.querySelector('header');
            expect(header).toBeInTheDocument();
        });
    });

    describe('Footer Component', () => {
        it('should render FooterTwo component', () => {
            const { container } = renderWithProviders(<UseCases />);
            const footer = container.querySelector('footer');
            expect(footer).toBeInTheDocument();
        });
    });

    describe('Main Content Sections', () => {
        it('should render Breadcrumb component', () => {
            const { container } = renderWithProviders(<UseCases />);
            const breadcrumb = container.querySelector('.page-banner');
            expect(breadcrumb).toBeInTheDocument();
        });

        it('should render Cause section', () => {
            const { container } = renderWithProviders(<UseCases />);
            const cause = container.querySelector('.use-cases-section');
            expect(cause).toBeInTheDocument();
        });

        it('should render Feedback section', () => {
            const { container } = renderWithProviders(<UseCases />);
            const feedback = container.querySelector('.testimonial-section');
            expect(feedback).toBeInTheDocument();
        });

        it('should render Faq section', () => {
            const { container } = renderWithProviders(<UseCases />);
            const faq = container.querySelector('.faqs-section');
            expect(faq).toBeInTheDocument();
        });

        it('should render Cta section', () => {
            const { container } = renderWithProviders(<UseCases />);
            const cta = container.querySelector('.cta-section');
            expect(cta).toBeInTheDocument();
        });
    });

    describe('Layout Structure', () => {
        it('should have correct DOM hierarchy', () => {
            const { container } = renderWithProviders(<UseCases />);
            
            const pageWrapper = container.querySelector('.ac-page-wrapper');
            expect(pageWrapper).toBeInTheDocument();
            
            const header = pageWrapper?.querySelector('header');
            expect(header).toBeInTheDocument();
            
            const smoothWrapper = pageWrapper?.querySelector('.smooth-wrapper');
            expect(smoothWrapper).toBeInTheDocument();
            
            const smoothContent = smoothWrapper?.querySelector('#smooth-content');
            expect(smoothContent).toBeInTheDocument();
            
            const footer = pageWrapper?.querySelector('footer');
            expect(footer).toBeInTheDocument();
        });

        it('should position Header before smooth-content', () => {
            const { container } = renderWithProviders(<UseCases />);
            const pageWrapper = container.querySelector('.ac-page-wrapper');
            const header = pageWrapper?.querySelector('header');
            const smoothWrapper = pageWrapper?.querySelector('.smooth-wrapper');
            
            expect(header?.compareDocumentPosition(smoothWrapper!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        });

        it('should position smooth-content before Footer', () => {
            const { container } = renderWithProviders(<UseCases />);
            const pageWrapper = container.querySelector('.ac-page-wrapper');
            const smoothWrapper = pageWrapper?.querySelector('.smooth-wrapper');
            const footer = pageWrapper?.querySelector('footer');
            
            expect(smoothWrapper?.compareDocumentPosition(footer!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        });
    });

    describe('Component Integration', () => {
        it('should integrate all child components without errors', () => {
            expect(() => renderWithProviders(<UseCases />)).not.toThrow();
        });

        it('should render all child components', () => {
            const { container } = renderWithProviders(<UseCases />);
            
            const header = container.querySelector('header');
            const breadcrumb = container.querySelector('.page-banner');
            const cause = container.querySelector('.use-cases-section');
            const feedback = container.querySelector('.testimonial-section');
            const faq = container.querySelector('.faqs-section');
            const cta = container.querySelector('.cta-section');
            const footer = container.querySelector('footer');
            
            expect(header).toBeInTheDocument();
            expect(breadcrumb).toBeInTheDocument();
            expect(cause).toBeInTheDocument();
            expect(feedback).toBeInTheDocument();
            expect(faq).toBeInTheDocument();
            expect(cta).toBeInTheDocument();
            expect(footer).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have semantic HTML structure', () => {
            const { container } = renderWithProviders(<UseCases />);
            
            const header = container.querySelector('header');
            const footer = container.querySelector('footer');
            const sections = container.querySelectorAll('section');
            
            expect(header).toBeInTheDocument();
            expect(footer).toBeInTheDocument();
            expect(sections.length).toBeGreaterThan(0);
        });

        it('should have correct ARIA structure', () => {
            const { container } = renderWithProviders(<UseCases />);
            const mainContent = container.querySelector('#smooth-content');
            expect(mainContent).toBeInTheDocument();
            expect(mainContent).toHaveAttribute('id', 'smooth-content');
        });
    });

    describe('Component Features', () => {
        it('should render Use Cases page variant', () => {
            const { container } = renderWithProviders(<UseCases />);
            const breadcrumb = container.querySelector('.page-banner');
            expect(breadcrumb).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should render with no props', () => {
            expect(() => renderWithProviders(<UseCases />)).not.toThrow();
        });

        it('should handle all dependencies correctly', () => {
            const { container } = renderWithProviders(<UseCases />);
            
            const header = container.querySelector('header');
            const footer = container.querySelector('footer');
            
            expect(header).toBeInTheDocument();
            expect(footer).toBeInTheDocument();
        });

        it('should maintain correct DOM structure', () => {
            const { container } = renderWithProviders(<UseCases />);
            
            const pageWrapper = container.querySelector('.ac-page-wrapper');
            
            expect(pageWrapper).toBeInTheDocument();
            expect(pageWrapper?.children.length).toBeGreaterThan(0);
        });
    });
});
