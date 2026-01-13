import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PageBuilder, PageBuilderWithSections } from '../PageBuilder';

jest.mock('@/layouts/headers/HeaderOne', () => ({
    __esModule: true,
    default: ({ style }: { style?: boolean }) => <div data-testid="header-one">HeaderOne (style={String(style)})</div>
}));

jest.mock('@/layouts/footers/FooterOne', () => ({
    __esModule: true,
    default: ({ style, style_2 }: { style?: boolean; style_2?: boolean }) => (
        <div data-testid="footer-one">
            FooterOne (style={String(style)}, style_2={String(style_2)})
        </div>
    )
}));

jest.mock('@/layouts/footers/FooterTwo', () => ({
    __esModule: true,
    default: () => <div data-testid="footer-two">FooterTwo</div>
}));

jest.mock('@/components/common/Breadcrumb', () => ({
    __esModule: true,
    default: ({ title, sub_title }: { title: string; sub_title: string }) => (
        <div data-testid="breadcrumb">
            Breadcrumb (title={title}, sub_title={sub_title})
        </div>
    )
}));

describe('PageBuilder', () => {
    describe('default rendering', () => {
        it('should render page wrapper with HeaderOne, Breadcrumb, content, and FooterTwo', () => {
            const testContent = <div data-testid="test-content">Test Content</div>;
            
            render(
                <PageBuilder
                    title="Test Page"
                    subTitle="Test Subtitle"
                    content={testContent}
                />
            );

            expect(screen.getByTestId('header-one')).toBeInTheDocument();
            expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
            expect(screen.getByTestId('test-content')).toBeInTheDocument();
            expect(screen.getByTestId('footer-two')).toBeInTheDocument();
            expect(screen.queryByTestId('footer-one')).not.toBeInTheDocument();
        });

        it('should pass title and subTitle to Breadcrumb', () => {
            render(
                <PageBuilder
                    title="My Title"
                    subTitle="My Subtitle"
                    content={<div>Content</div>}
                />
            );

            const breadcrumb = screen.getByTestId('breadcrumb');
            expect(breadcrumb).toHaveTextContent('title=My Title');
            expect(breadcrumb).toHaveTextContent('sub_title=My Subtitle');
        });
    });

    describe('footer selection', () => {
        it('should render FooterTwo when footer prop is "two" (default)', () => {
            render(
                <PageBuilder
                    title="Test"
                    subTitle="Test"
                    content={<div>Content</div>}
                    footer="two"
                />
            );

            expect(screen.getByTestId('footer-two')).toBeInTheDocument();
            expect(screen.queryByTestId('footer-one')).not.toBeInTheDocument();
        });

        it('should render FooterOne when footer prop is "one"', () => {
            render(
                <PageBuilder
                    title="Test"
                    subTitle="Test"
                    content={<div>Content</div>}
                    footer="one"
                />
            );

            expect(screen.getByTestId('footer-one')).toBeInTheDocument();
            expect(screen.queryByTestId('footer-two')).not.toBeInTheDocument();
        });
    });

    describe('header styling', () => {
        it('should render HeaderOne with style=true by default', () => {
            render(
                <PageBuilder
                    title="Test"
                    subTitle="Test"
                    content={<div>Content</div>}
                />
            );

            const header = screen.getByTestId('header-one');
            expect(header).toHaveTextContent('style=true');
        });

        it('should render HeaderOne with style=true when headerStyle prop is true', () => {
            render(
                <PageBuilder
                    title="Test"
                    subTitle="Test"
                    content={<div>Content</div>}
                    headerStyle={true}
                />
            );

            const header = screen.getByTestId('header-one');
            expect(header).toHaveTextContent('style=true');
        });

        it('should render HeaderOne with style=false when headerStyle prop is false', () => {
            render(
                <PageBuilder
                    title="Test"
                    subTitle="Test"
                    content={<div>Content</div>}
                    headerStyle={false}
                />
            );

            const header = screen.getByTestId('header-one');
            expect(header).toHaveTextContent('style=false');
        });
    });

    describe('footer styling (FooterOne)', () => {
        it('should render FooterOne with default styles when footer="one" and no style props', () => {
            render(
                <PageBuilder
                    title="Test"
                    subTitle="Test"
                    content={<div>Content</div>}
                    footer="one"
                />
            );

            const footer = screen.getByTestId('footer-one');
            expect(footer).toHaveTextContent('style=false');
            expect(footer).toHaveTextContent('style_2=false');
        });

        it('should render FooterOne with style=true when footerStyle prop is true', () => {
            render(
                <PageBuilder
                    title="Test"
                    subTitle="Test"
                    content={<div>Content</div>}
                    footer="one"
                    footerStyle={true}
                />
            );

            const footer = screen.getByTestId('footer-one');
            expect(footer).toHaveTextContent('style=true');
            expect(footer).toHaveTextContent('style_2=false');
        });

        it('should render FooterOne with style_2=true when footerStyle2 prop is true', () => {
            render(
                <PageBuilder
                    title="Test"
                    subTitle="Test"
                    content={<div>Content</div>}
                    footer="one"
                    footerStyle2={true}
                />
            );

            const footer = screen.getByTestId('footer-one');
            expect(footer).toHaveTextContent('style=false');
            expect(footer).toHaveTextContent('style_2=true');
        });

        it('should render FooterOne with both style and style_2 set', () => {
            render(
                <PageBuilder
                    title="Test"
                    subTitle="Test"
                    content={<div>Content</div>}
                    footer="one"
                    footerStyle={true}
                    footerStyle2={true}
                />
            );

            const footer = screen.getByTestId('footer-one');
            expect(footer).toHaveTextContent('style=true');
            expect(footer).toHaveTextContent('style_2=true');
        });
    });

    describe('content rendering', () => {
        it('should render simple text content', () => {
            render(
                <PageBuilder
                    title="Test"
                    subTitle="Test"
                    content="Simple text content"
                />
            );

            expect(screen.getByText('Simple text content')).toBeInTheDocument();
        });

        it('should render complex React component as content', () => {
            const ComplexComponent = () => (
                <div>
                    <h1>Heading</h1>
                    <p>Paragraph</p>
                </div>
            );

            render(
                <PageBuilder
                    title="Test"
                    subTitle="Test"
                    content={<ComplexComponent />}
                />
            );

            expect(screen.getByText('Heading')).toBeInTheDocument();
            expect(screen.getByText('Paragraph')).toBeInTheDocument();
        });

        it('should render null content gracefully', () => {
            render(
                <PageBuilder
                    title="Test"
                    subTitle="Test"
                    content={null}
                />
            );

            expect(screen.getByTestId('header-one')).toBeInTheDocument();
            expect(screen.getByTestId('footer-two')).toBeInTheDocument();
        });

        it('should render array of elements as content', () => {
            render(
                <PageBuilder
                    title="Test"
                    subTitle="Test"
                    content={
                        <>
                            <div>First</div>
                            <div>Second</div>
                            <div>Third</div>
                        </>
                    }
                />
            );

            expect(screen.getByText('First')).toBeInTheDocument();
            expect(screen.getByText('Second')).toBeInTheDocument();
            expect(screen.getByText('Third')).toBeInTheDocument();
        });
    });

    describe('DOM structure', () => {
        it('should render with correct CSS classes', () => {
            const { container } = render(
                <PageBuilder
                    title="Test"
                    subTitle="Test"
                    content={<div>Content</div>}
                />
            );

            const pageWrapper = container.querySelector('.ac-page-wrapper');
            expect(pageWrapper).toBeInTheDocument();

            const smoothWrapper = container.querySelector('.smooth-wrapper');
            expect(smoothWrapper).toBeInTheDocument();

            const smoothContent = container.querySelector('#smooth-content');
            expect(smoothContent).toBeInTheDocument();
        });

        it('should maintain correct component hierarchy', () => {
            const { container } = render(
                <PageBuilder
                    title="Test"
                    subTitle="Test"
                    content={<div>Content</div>}
                />
            );

            const pageWrapper = container.querySelector('.ac-page-wrapper');
            const headerOne = pageWrapper?.querySelector('[data-testid="header-one"]');
            const smoothWrapper = pageWrapper?.querySelector('.smooth-wrapper');
            const smoothContent = smoothWrapper?.querySelector('#smooth-content');
            const breadcrumb = smoothContent?.querySelector('[data-testid="breadcrumb"]');
            const footerTwo = pageWrapper?.querySelector('[data-testid="footer-two"]');

            expect(headerOne).toBeInTheDocument();
            expect(breadcrumb).toBeInTheDocument();
            expect(footerTwo).toBeInTheDocument();
        });
    });
});

describe('PageBuilderWithSections', () => {
    describe('default rendering', () => {
        it('should render page wrapper with HeaderOne, Breadcrumb, sections, and FooterTwo', () => {
            const testSections = [
                <div key="1" data-testid="section-1">Section 1</div>,
                <div key="2" data-testid="section-2">Section 2</div>
            ];

            render(
                <PageBuilderWithSections
                    title="Test Page"
                    subTitle="Test Subtitle"
                    sections={testSections}
                />
            );

            expect(screen.getByTestId('header-one')).toBeInTheDocument();
            expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
            expect(screen.getByTestId('section-1')).toBeInTheDocument();
            expect(screen.getByTestId('section-2')).toBeInTheDocument();
            expect(screen.getByTestId('footer-two')).toBeInTheDocument();
            expect(screen.queryByTestId('footer-one')).not.toBeInTheDocument();
        });

        it('should pass title and subTitle to Breadcrumb', () => {
            render(
                <PageBuilderWithSections
                    title="My Title"
                    subTitle="My Subtitle"
                    sections={[<div key="1">Section</div>]}
                />
            );

            const breadcrumb = screen.getByTestId('breadcrumb');
            expect(breadcrumb).toHaveTextContent('title=My Title');
            expect(breadcrumb).toHaveTextContent('sub_title=My Subtitle');
        });
    });

    describe('sections rendering', () => {
        it('should render single section', () => {
            const sections = [
                <div key="1" data-testid="single-section">Single Section</div>
            ];

            render(
                <PageBuilderWithSections
                    title="Test"
                    subTitle="Test"
                    sections={sections}
                />
            );

            expect(screen.getByTestId('single-section')).toBeInTheDocument();
        });

        it('should render multiple sections in order', () => {
            const sections = [
                <div key="1" data-testid="section-1">First Section</div>,
                <div key="2" data-testid="section-2">Second Section</div>,
                <div key="3" data-testid="section-3">Third Section</div>
            ];

            render(
                <PageBuilderWithSections
                    title="Test"
                    subTitle="Test"
                    sections={sections}
                />
            );

            const section1 = screen.getByTestId('section-1');
            const section2 = screen.getByTestId('section-2');
            const section3 = screen.getByTestId('section-3');

            const allSections = screen.getAllByRole('generic');
            const section1Index = allSections.indexOf(section1);
            const section2Index = allSections.indexOf(section2);
            const section3Index = allSections.indexOf(section3);

            expect(section1Index).toBeLessThan(section2Index);
            expect(section2Index).toBeLessThan(section3Index);
        });

        it('should wrap each section in section element', () => {
            const sections = [
                <div key="1" data-testid="content-1">Content 1</div>,
                <div key="2" data-testid="content-2">Content 2</div>
            ];

            const { container } = render(
                <PageBuilderWithSections
                    title="Test"
                    subTitle="Test"
                    sections={sections}
                />
            );

            const sectionElements = container.querySelectorAll('section');
            expect(sectionElements).toHaveLength(2);
        });

        it('should render complex components as sections', () => {
            const ComplexSection = ({ title }: { title: string }) => (
                <div>
                    <h2>{title}</h2>
                    <p>Section content</p>
                </div>
            );

            const sections = [
                <ComplexSection key="1" title="Section 1" />,
                <ComplexSection key="2" title="Section 2" />
            ];

            render(
                <PageBuilderWithSections
                    title="Test"
                    subTitle="Test"
                    sections={sections}
                />
            );

            expect(screen.getByText('Section 1')).toBeInTheDocument();
            expect(screen.getByText('Section 2')).toBeInTheDocument();
            expect(screen.getAllByText('Section content')).toHaveLength(2);
        });

        it('should handle empty sections array', () => {
            render(
                <PageBuilderWithSections
                    title="Test"
                    subTitle="Test"
                    sections={[]}
                />
            );

            expect(screen.getByTestId('header-one')).toBeInTheDocument();
            expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
            expect(screen.getByTestId('footer-two')).toBeInTheDocument();

            const { container } = render(
                <PageBuilderWithSections
                    title="Test"
                    subTitle="Test"
                    sections={[]}
                />
            );

            const sectionElements = container.querySelectorAll('section');
            expect(sectionElements).toHaveLength(0);
        });
    });

    describe('footer selection', () => {
        it('should render FooterTwo when footer prop is "two" (default)', () => {
            render(
                <PageBuilderWithSections
                    title="Test"
                    subTitle="Test"
                    sections={[<div key="1">Section</div>]}
                    footer="two"
                />
            );

            expect(screen.getByTestId('footer-two')).toBeInTheDocument();
            expect(screen.queryByTestId('footer-one')).not.toBeInTheDocument();
        });

        it('should render FooterOne when footer prop is "one"', () => {
            render(
                <PageBuilderWithSections
                    title="Test"
                    subTitle="Test"
                    sections={[<div key="1">Section</div>]}
                    footer="one"
                />
            );

            expect(screen.getByTestId('footer-one')).toBeInTheDocument();
            expect(screen.queryByTestId('footer-two')).not.toBeInTheDocument();
        });
    });

    describe('header styling', () => {
        it('should render HeaderOne with style=true by default', () => {
            render(
                <PageBuilderWithSections
                    title="Test"
                    subTitle="Test"
                    sections={[<div key="1">Section</div>]}
                />
            );

            const header = screen.getByTestId('header-one');
            expect(header).toHaveTextContent('style=true');
        });

        it('should render HeaderOne with style=false when headerStyle prop is false', () => {
            render(
                <PageBuilderWithSections
                    title="Test"
                    subTitle="Test"
                    sections={[<div key="1">Section</div>]}
                    headerStyle={false}
                />
            );

            const header = screen.getByTestId('header-one');
            expect(header).toHaveTextContent('style=false');
        });
    });

    describe('footer styling (FooterOne)', () => {
        it('should render FooterOne with default styles when footer="one"', () => {
            render(
                <PageBuilderWithSections
                    title="Test"
                    subTitle="Test"
                    sections={[<div key="1">Section</div>]}
                    footer="one"
                />
            );

            const footer = screen.getByTestId('footer-one');
            expect(footer).toHaveTextContent('style=false');
            expect(footer).toHaveTextContent('style_2=false');
        });

        it('should render FooterOne with style=true when footerStyle prop is true', () => {
            render(
                <PageBuilderWithSections
                    title="Test"
                    subTitle="Test"
                    sections={[<div key="1">Section</div>]}
                    footer="one"
                    footerStyle={true}
                />
            );

            const footer = screen.getByTestId('footer-one');
            expect(footer).toHaveTextContent('style=true');
            expect(footer).toHaveTextContent('style_2=false');
        });

        it('should render FooterOne with style_2=true when footerStyle2 prop is true', () => {
            render(
                <PageBuilderWithSections
                    title="Test"
                    subTitle="Test"
                    sections={[<div key="1">Section</div>]}
                    footer="one"
                    footerStyle2={true}
                />
            );

            const footer = screen.getByTestId('footer-one');
            expect(footer).toHaveTextContent('style=false');
            expect(footer).toHaveTextContent('style_2=true');
        });

        it('should render FooterOne with both style and style_2 set', () => {
            render(
                <PageBuilderWithSections
                    title="Test"
                    subTitle="Test"
                    sections={[<div key="1">Section</div>]}
                    footer="one"
                    footerStyle={true}
                    footerStyle2={true}
                />
            );

            const footer = screen.getByTestId('footer-one');
            expect(footer).toHaveTextContent('style=true');
            expect(footer).toHaveTextContent('style_2=true');
        });
    });

    describe('DOM structure', () => {
        it('should render with correct CSS classes', () => {
            const { container } = render(
                <PageBuilderWithSections
                    title="Test"
                    subTitle="Test"
                    sections={[<div key="1">Section</div>]}
                />
            );

            const pageWrapper = container.querySelector('.ac-page-wrapper');
            expect(pageWrapper).toBeInTheDocument();

            const smoothWrapper = container.querySelector('.smooth-wrapper');
            expect(smoothWrapper).toBeInTheDocument();

            const smoothContent = container.querySelector('#smooth-content');
            expect(smoothContent).toBeInTheDocument();
        });

        it('should maintain correct component hierarchy', () => {
            const { container } = render(
                <PageBuilderWithSections
                    title="Test"
                    subTitle="Test"
                    sections={[<div key="1">Section</div>]}
                />
            );

            const pageWrapper = container.querySelector('.ac-page-wrapper');
            const headerOne = pageWrapper?.querySelector('[data-testid="header-one"]');
            const smoothWrapper = pageWrapper?.querySelector('.smooth-wrapper');
            const smoothContent = smoothWrapper?.querySelector('#smooth-content');
            const breadcrumb = smoothContent?.querySelector('[data-testid="breadcrumb"]');
            const section = smoothContent?.querySelector('section');
            const footerTwo = pageWrapper?.querySelector('[data-testid="footer-two"]');

            expect(headerOne).toBeInTheDocument();
            expect(breadcrumb).toBeInTheDocument();
            expect(section).toBeInTheDocument();
            expect(footerTwo).toBeInTheDocument();
        });
    });

    describe('integration', () => {
        it('should render all components with full configuration', () => {
            const sections = [
                <div key="1" data-testid="sec1">Section 1</div>,
                <div key="2" data-testid="sec2">Section 2</div>,
                <div key="3" data-testid="sec3">Section 3</div>
            ];

            render(
                <PageBuilderWithSections
                    title="Full Test"
                    subTitle="Full Subtitle"
                    sections={sections}
                    footer="one"
                    headerStyle={true}
                    footerStyle={true}
                    footerStyle2={true}
                />
            );

            expect(screen.getByTestId('header-one')).toHaveTextContent('style=true');
            expect(screen.getByTestId('breadcrumb')).toHaveTextContent('title=Full Test');
            expect(screen.getByTestId('breadcrumb')).toHaveTextContent('sub_title=Full Subtitle');
            expect(screen.getByTestId('sec1')).toBeInTheDocument();
            expect(screen.getByTestId('sec2')).toBeInTheDocument();
            expect(screen.getByTestId('sec3')).toBeInTheDocument();
            expect(screen.getByTestId('footer-one')).toHaveTextContent('style=true');
            expect(screen.getByTestId('footer-one')).toHaveTextContent('style_2=true');
        });
    });
});
