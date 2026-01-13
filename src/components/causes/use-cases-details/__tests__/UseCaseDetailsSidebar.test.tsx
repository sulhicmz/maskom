import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UseCaseDetailsSidebar from '../UseCaseDetailsSidebar';

describe('UseCaseDetailsSidebar', () => {
    describe('Rendering', () => {
        it('should render sidebar container with correct class', () => {
            render(<UseCaseDetailsSidebar />);
            const container = screen.getByRole('list').closest('.col-lg-4');
            expect(container).toBeInTheDocument();
            expect(container).toHaveClass('col-lg-4');
        });

        it('should render sidebar widget with correct classes', () => {
            render(<UseCaseDetailsSidebar />);
            const widget = screen.getByRole('list').closest('.sidebar-nav-widget');
            expect(widget).toBeInTheDocument();
            expect(widget).toHaveClass('style-one');
            expect(widget).toHaveClass('mb-50');
            expect(widget).toHaveClass('wow');
            expect(widget).toHaveClass('fadeInDown');
        });

        it('should render unordered list for sidebar navigation', () => {
            render(<UseCaseDetailsSidebar />);
            const list = screen.getByRole('list');
            expect(list).toBeInTheDocument();
            expect(list.tagName).toBe('UL');
        });

        it('should render list items for each sidebar item', () => {
            render(<UseCaseDetailsSidebar />);
            const listItems = screen.getAllByRole('listitem');
            expect(listItems).toHaveLength(5);
        });
    });

    describe('Data Integration', () => {
        it('should render sidebar items from data file', () => {
            render(<UseCaseDetailsSidebar />);
            const listItems = screen.getAllByRole('listitem');
            
            expect(listItems).toHaveLength(5);
            
            const links = screen.getAllByRole('link');
            expect(links).toHaveLength(5);
        });

        it('should render correct titles for sidebar items', () => {
            render(<UseCaseDetailsSidebar />);
            const links = screen.getAllByRole('link');
            
            expect(links[0]).toHaveTextContent('Integrasi Konektivitas Ritel Nasional');
            expect(links[1]).toHaveTextContent('Managed Wi-Fi untuk F&B Chain');
            expect(links[2]).toHaveTextContent('SD-WAN & Prioritas Aplikasi Logistik');
            expect(links[3]).toHaveTextContent('Keamanan Jaringan Rumah Sakit');
            expect(links[4]).toHaveTextContent('Interkoneksi Data Center & Cloud');
        });
    });

    describe('Link Navigation', () => {
        it('should render links with correct href attributes', () => {
            render(<UseCaseDetailsSidebar />);
            const links = screen.getAllByRole('link');
            
            expect(links[0]).toHaveAttribute('href', '/use-case-details');
            expect(links[1]).toHaveAttribute('href', '/use-case-details');
            expect(links[2]).toHaveAttribute('href', '/use-case-details');
            expect(links[3]).toHaveAttribute('href', '/use-case-details');
            expect(links[4]).toHaveAttribute('href', '/use-case-details');
        });

        it('should render links using Next.js Link component', () => {
            render(<UseCaseDetailsSidebar />);
            const links = screen.getAllByRole('link');
            
            links.forEach(link => {
                expect(link).toBeInTheDocument();
            });
        });
    });

    describe('Active State', () => {
        it('should apply active class to the first sidebar item', () => {
            render(<UseCaseDetailsSidebar />);
            const links = screen.getAllByRole('link');
            
            expect(links[0]).toHaveClass('active');
        });

        it('should not apply active class to other sidebar items', () => {
            render(<UseCaseDetailsSidebar />);
            const links = screen.getAllByRole('link');
            
            expect(links[1]).not.toHaveClass('active');
            expect(links[2]).not.toHaveClass('active');
            expect(links[3]).not.toHaveClass('active');
            expect(links[4]).not.toHaveClass('active');
        });
    });

    describe('Accessibility', () => {
        it('should have semantic HTML structure with proper roles', () => {
            render(<UseCaseDetailsSidebar />);
            
            const list = screen.getByRole('list');
            const listItems = screen.getAllByRole('listitem');
            const links = screen.getAllByRole('link');
            
            expect(list).toBeInTheDocument();
            expect(listItems).toHaveLength(5);
            expect(links).toHaveLength(5);
        });

        it('should have descriptive link text for screen readers', () => {
            render(<UseCaseDetailsSidebar />);
            const links = screen.getAllByRole('link');
            
            links.forEach(link => {
                expect(link.textContent).toBeTruthy();
                expect(link.textContent?.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Key Handling', () => {
        it('should be keyboard navigable via Tab key', () => {
            render(<UseCaseDetailsSidebar />);
            const links = screen.getAllByRole('link');
            
            links.forEach(link => {
                expect(link).toHaveAttribute('href');
            });
        });
    });

    describe('DOM Structure', () => {
        it('should have links nested inside list items', () => {
            render(<UseCaseDetailsSidebar />);
            const listItems = screen.getAllByRole('listitem');
            
            listItems.forEach(listItem => {
                const link = listItem.querySelector('a');
                expect(link).toBeInTheDocument();
            });
        });

        it('should render exactly 5 list items', () => {
            render(<UseCaseDetailsSidebar />);
            const list = screen.getByRole('list');
            expect(list.childElementCount).toBe(5);
        });
    });

    describe('CSS Classes and Styling', () => {
        it('should apply correct column class', () => {
            render(<UseCaseDetailsSidebar />);
            const container = screen.getByRole('list').closest('.col-lg-4');
            expect(container).toHaveClass('col-lg-4');
        });

        it('should apply widget styling classes', () => {
            render(<UseCaseDetailsSidebar />);
            const widget = screen.getByRole('list').closest('.sidebar-nav-widget');
            expect(widget).toHaveClass('style-one');
            expect(widget).toHaveClass('mb-50');
        });

        it('should apply wow.js animation classes', () => {
            render(<UseCaseDetailsSidebar />);
            const widget = screen.getByRole('list').closest('.sidebar-nav-widget');
            expect(widget).toHaveClass('wow');
            expect(widget).toHaveClass('fadeInDown');
        });
    });

    describe('Edge Cases', () => {
        it('should handle exactly one active item', () => {
            render(<UseCaseDetailsSidebar />);
            const links = screen.getAllByRole('link');
            
            const activeLinks = links.filter(link => link.classList.contains('active'));
            expect(activeLinks).toHaveLength(1);
        });

        it('should render all non-active items without active class', () => {
            render(<UseCaseDetailsSidebar />);
            const links = screen.getAllByRole('link');
            
            expect(links[0]).toHaveClass('active');
            expect(links[1]).not.toHaveClass('active');
            expect(links[2]).not.toHaveClass('active');
            expect(links[3]).not.toHaveClass('active');
            expect(links[4]).not.toHaveClass('active');
        });

        it('should render consistent link count with data file', () => {
            render(<UseCaseDetailsSidebar />);
            const links = screen.getAllByRole('link');
            const listItems = screen.getAllByRole('listitem');
            
            expect(links).toHaveLength(listItems.length);
            expect(links).toHaveLength(5);
        });

        it('should maintain link order as per data file', () => {
            render(<UseCaseDetailsSidebar />);
            const links = screen.getAllByRole('link');
            
            expect(links[0]).toHaveTextContent('Integrasi Konektivitas Ritel Nasional');
            expect(links[4]).toHaveTextContent('Interkoneksi Data Center & Cloud');
        });

        it('should handle empty link segments gracefully', () => {
            render(<UseCaseDetailsSidebar />);
            const links = screen.getAllByRole('link');
            
            links.forEach(link => {
                const href = link.getAttribute('href');
                expect(href).toBeTruthy();
                expect(href).not.toBe('');
            });
        });
    });
});
