import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import PricingTabs from '../PricingTabs'
import type { PriceDetailItem } from '@/types/data'

const mockPricingData: Array<{
    id: number
    price_details: PriceDetailItem[]
}> = [
    {
        id: 1,
        price_details: [
            {
                id: 1,
                sub_title: 'Paket Basic',
                price: 500000,
                btn: 'Pilih Paket',
                feature: ['Kecepatan 10 Mbps', 'Unlimited Kuota', '24/7 Support']
            },
            {
                id: 2,
                sub_title: 'Paket Pro',
                price: 1000000,
                btn: 'Pilih Paket',
                feature: ['Kecepatan 50 Mbps', 'Unlimited Kuota', '24/7 Support', 'IP Static']
            }
        ]
    },
    {
        id: 2,
        price_details: [
            {
                id: 3,
                sub_title: 'Paket Enterprise',
                price: 5000000,
                btn: 'Pilih Paket',
                feature: ['Kecepatan 100 Mbps', 'Unlimited Kuota', '24/7 Support', 'IP Static', 'SLA 99.9%']
            }
        ]
    }
]

const mockTabTitles = ['Kontrak 12 Bulan', 'Kontrak 36 Bulan']

const mockSectionTitle = {
    subtitle: 'Paket Layanan',
    title: 'Pilih Skema Layanan Sesuai Kebutuhan Anda',
    description: 'Seluruh paket sudah termasuk instalasi, monitoring proaktif, dan dukungan engineer Maskom sesuai SLA yang disepakati.',
    align: 'center' as const,
    className: 'mb-50',
    animation: 'fadeInDown' as const
}

describe('PricingTabs Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Rendering Tests', () => {
        test('should render section with pricing-section class', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const section = document.querySelector('.pricing-section')
            expect(section).toBeInTheDocument()
        })

        test('should apply wrapperClassName prop', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                    wrapperClassName="custom-wrapper"
                />
            )
            const wrapper = document.querySelector('.pricing-wrapper.custom-wrapper')
            expect(wrapper).toBeInTheDocument()
        })

        test('should apply sectionClassName prop', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                    sectionClassName="custom-section"
                />
            )
            const section = document.querySelector('.pricing-section.custom-section')
            expect(section).toBeInTheDocument()
        })

        test('should render section title component', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            expect(screen.getByText('Paket Layanan')).toBeInTheDocument()
            expect(screen.getByText('Pilih Skema Layanan Sesuai Kebutuhan Anda')).toBeInTheDocument()
        })

        test('should render pricing tabs navigation', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const tabList = document.querySelector('.nav-tabs')
            expect(tabList).toBeInTheDocument()
        })

        test('should render pricing cards', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            expect(screen.getByText('Paket Basic')).toBeInTheDocument()
            expect(screen.getByText('Paket Pro')).toBeInTheDocument()
        })
    })

    describe('Tab Functionality Tests', () => {
        test('should set first tab as active by default', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const firstTab = document.querySelectorAll('.nav-tabs button')[0]
            expect(firstTab).toHaveClass('active')
            expect(firstTab).toHaveAttribute('aria-selected', 'true')
        })

        test('should not set other tabs as active by default', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const secondTab = document.querySelectorAll('.nav-tabs button')[1]
            expect(secondTab).not.toHaveClass('active')
            expect(secondTab).toHaveAttribute('aria-selected', 'false')
        })

        test('should show first tab panel by default', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const firstTabPanel = document.querySelector('#price-tabpanel-0')
            expect(firstTabPanel).toHaveClass('show', 'active')
        })

        test('should hide other tab panels by default', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const secondTabPanel = document.querySelector('#price-tabpanel-1')
            expect(secondTabPanel).not.toHaveClass('show', 'active')
            expect(secondTabPanel).toHaveAttribute('hidden', '')
        })

        test('should handle tab click', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const secondTab = document.querySelectorAll('.nav-tabs button')[1]
            fireEvent.click(secondTab)
        })

        test('should handle keyboard navigation', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const firstTab = document.querySelectorAll('.nav-tabs button')[0]
            fireEvent.keyDown(firstTab, { key: 'ArrowRight' })
        })
    })

    describe('Data Integration Tests', () => {
        test('should render correct number of tabs', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const tabs = document.querySelectorAll('.nav-tabs button')
            expect(tabs.length).toBe(2)
        })

        test('should render correct tab titles', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            expect(screen.getByText('Kontrak 12 Bulan')).toBeInTheDocument()
            expect(screen.getByText('Kontrak 36 Bulan')).toBeInTheDocument()
        })

        test('should render pricing cards from data array', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            expect(screen.getByText('Paket Basic')).toBeInTheDocument()
            expect(screen.getByText('Paket Pro')).toBeInTheDocument()
            expect(screen.getByText('Paket Enterprise')).toBeInTheDocument()
        })

        test('should render pricing features', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            expect(screen.getByText('Kecepatan 10 Mbps')).toBeInTheDocument()
            expect(screen.getAllByText('Unlimited Kuota').length).toBeGreaterThan(0)
            expect(screen.getAllByText('24/7 Support').length).toBeGreaterThan(0)
        })
    })

    describe('Accessibility Tests', () => {
        test('should have correct ARIA attributes on tabs', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const tabs = document.querySelectorAll('.nav-tabs button')
            tabs.forEach((tab, index) => {
                expect(tab).toHaveAttribute('role', 'tab')
                expect(tab).toHaveAttribute('aria-controls', `price-tabpanel-${index}`)
                expect(tab).toHaveAttribute('id', `price-tab-${index}`)
            })
        })

        test('should have correct ARIA attributes on tab panels', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const tabPanels = document.querySelectorAll('.tab-pane')
            tabPanels.forEach((panel, index) => {
                expect(panel).toHaveAttribute('role', 'tabpanel')
                expect(panel).toHaveAttribute('id', `price-tabpanel-${index}`)
                expect(panel).toHaveAttribute('aria-labelledby', `price-tab-${index}`)
            })
        })

        test('should set correct aria-selected on tabs', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const firstTab = document.querySelectorAll('.nav-tabs button')[0]
            const secondTab = document.querySelectorAll('.nav-tabs button')[1]
            expect(firstTab).toHaveAttribute('aria-selected', 'true')
            expect(secondTab).toHaveAttribute('aria-selected', 'false')
        })

        test('should set correct tabIndex on tabs', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const firstTab = document.querySelectorAll('.nav-tabs button')[0]
            const secondTab = document.querySelectorAll('.nav-tabs button')[1]
            expect(firstTab).toHaveAttribute('tabIndex', '0')
            expect(secondTab).toHaveAttribute('tabIndex', '-1')
        })

        test('should have tablist role on ul', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const tabList = document.querySelector('.nav-tabs')
            expect(tabList).toHaveAttribute('role', 'tablist')
        })

        test('should apply ariaLabel to section', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                    ariaLabel="Pricing Section"
                />
            )
            const section = document.querySelector('.pricing-section')
            expect(section).toHaveAttribute('aria-label', 'Pricing Section')
        })

        test('should apply tablistAriaLabel to tablist', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                    tablistAriaLabel="Pricing Tabs"
                />
            )
            const tabList = document.querySelector('.nav-tabs')
            expect(tabList).toHaveAttribute('aria-label', 'Pricing Tabs')
        })
    })

    describe('Props Tests', () => {
        test('should pass sectionTitle props correctly', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            expect(screen.getByText('Paket Layanan')).toBeInTheDocument()
            expect(screen.getByText('Pilih Skema Layanan Sesuai Kebutuhan Anda')).toBeInTheDocument()
        })

        test('should apply sectionId prop', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                    sectionId="pricing"
                />
            )
            const section = document.querySelector('#pricing')
            expect(section).toBeInTheDocument()
        })

        test('should use default idPrefix value', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const firstTab = document.querySelector('#price-tab-0')
            expect(firstTab).toBeInTheDocument()
        })

        test('should accept custom idPrefix value', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                    idPrefix="custom"
                />
            )
            const firstTab = document.querySelector('#custom-tab-0')
            expect(firstTab).toBeInTheDocument()
        })
    })

    describe('Edge Cases Tests', () => {
        test('should handle empty data array', () => {
            render(
                <PricingTabs
                    data={[]}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const section = document.querySelector('.pricing-section')
            expect(section).toBeInTheDocument()
        })

        test('should handle single tab', () => {
            render(
                <PricingTabs
                    data={[mockPricingData[0]]}
                    tabTitles={['Single Tab']}
                    sectionTitle={mockSectionTitle}
                />
            )
            const tabs = document.querySelectorAll('.nav-tabs button')
            expect(tabs.length).toBe(1)
        })

        test('should handle missing optional props', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const section = document.querySelector('.pricing-section')
            expect(section).toBeInTheDocument()
        })

        test('should handle empty pricing details array', () => {
            render(
                <PricingTabs
                    data={[{ id: 1, price_details: [] }]}
                    tabTitles={['Empty Tab']}
                    sectionTitle={mockSectionTitle}
                />
            )
            const section = document.querySelector('.pricing-section')
            expect(section).toBeInTheDocument()
        })

        test('should handle empty features array in pricing card', () => {
            const dataWithEmptyFeatures = [
                {
                    id: 1,
                    price_details: [
                        {
                            id: 1,
                            sub_title: 'Basic',
                            price: 100,
                            btn: 'Select',
                            feature: []
                        }
                    ]
                }
            ]
            render(
                <PricingTabs
                    data={dataWithEmptyFeatures}
                    tabTitles={['Tab 1']}
                    sectionTitle={mockSectionTitle}
                />
            )
            expect(screen.getByText('Basic')).toBeInTheDocument()
        })

        test('should handle large number of tabs', () => {
            const manyTabs = Array.from({ length: 10 }, (_, i) => `Tab ${i + 1}`)
            const manyData = Array.from({ length: 10 }, (_, i) => ({
                id: i + 1,
                price_details: [
                    {
                        id: 1,
                        sub_title: `Paket ${i + 1}`,
                        price: 100 * (i + 1),
                        btn: 'Pilih',
                        feature: ['Fitur 1']
                    }
                ]
            }))
            render(
                <PricingTabs
                    data={manyData}
                    tabTitles={manyTabs}
                    sectionTitle={mockSectionTitle}
                />
            )
            const tabs = document.querySelectorAll('.nav-tabs button')
            expect(tabs.length).toBe(10)
        })
    })

    describe('Memoization Tests', () => {
        test('should have displayName set to PricingTabs', () => {
            expect(PricingTabs.displayName).toBe('PricingTabs')
        })

        test('should be memoized with React.memo', () => {
            const { rerender } = render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const section = document.querySelector('.pricing-section')
            expect(section).toBeInTheDocument()

            rerender(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )

            const rerenderedSection = document.querySelector('.pricing-section')
            expect(rerenderedSection).toBeInTheDocument()
        })
    })

    describe('DOM Structure Tests', () => {
        test('should maintain correct DOM hierarchy for tabs', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const tabList = document.querySelector('.nav-tabs')
            const tabs = tabList?.querySelectorAll('li')
            expect(tabs?.length).toBe(2)
            tabs?.forEach((tab) => {
                expect(tab.querySelector('button')).toBeInTheDocument()
            })
        })

        test('should maintain correct DOM hierarchy for tab panels', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const tabContent = document.querySelector('.tab-content')
            const tabPanels = tabContent?.querySelectorAll('.tab-pane')
            expect(tabPanels?.length).toBe(2)
        })

        test('should render pricing cards in grid layout', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const cards = document.querySelectorAll('.tab-pane .row > div')
            expect(cards.length).toBeGreaterThan(0)
        })
    })

    describe('CSS Classes Tests', () => {
        test('should apply pricing-section base class', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const section = document.querySelector('.pricing-section')
            expect(section).toBeInTheDocument()
        })

        test('should apply pricing-wrapper base class', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const wrapper = document.querySelector('.pricing-wrapper')
            expect(wrapper).toBeInTheDocument()
        })

        test('should apply pricing-tabs style-one class', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const tabs = document.querySelector('.pricing-tabs.style-one')
            expect(tabs).toBeInTheDocument()
        })

        test('should apply tab-content class', () => {
            render(
                <PricingTabs
                    data={mockPricingData}
                    tabTitles={mockTabTitles}
                    sectionTitle={mockSectionTitle}
                />
            )
            const tabContent = document.querySelector('.tab-content')
            expect(tabContent).toBeInTheDocument()
        })
    })
})
