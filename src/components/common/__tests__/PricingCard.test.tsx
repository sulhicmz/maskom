import React from "react"
import { render, screen } from "@testing-library/react"
import PricingCard from "../PricingCard"

describe("PricingCard Component", () => {
   const mockPriceDetailItem = {
      id: 1,
      sub_title: "Essential Connect",
      price: 4500000,
      currency: "IDR",
      btn: "Minta Proposal",
      note: "Harga per lokasi per bulan",
      feature: [
         "Internet dedicated hingga 50 Mbps",
         "Monitoring NOC 8x5",
         "Backup link seluler opsional",
         "Laporan performa bulanan",
      ],
   }

   it("renders pricing card with all required props", () => {
      render(<PricingCard item={mockPriceDetailItem} />)
      expect(screen.getByText("Essential Connect")).toBeInTheDocument()
      expect(screen.getByText("Rp")).toBeInTheDocument()
      expect(screen.getByText("4.500.000")).toBeInTheDocument()
      expect(screen.getByText("Harga per lokasi per bulan")).toBeInTheDocument()
      expect(screen.getByText("Minta Proposal")).toBeInTheDocument()
   })

   it("renders with price_label instead of price", () => {
      const itemWithLabel = {
         ...mockPriceDetailItem,
         price: 0,
         price_label: "Hubungi Kami",
      }
      render(<PricingCard item={itemWithLabel} />)
      expect(screen.getByText("Hubungi Kami")).toBeInTheDocument()
      expect(screen.queryByText(/Rp/)).not.toBeInTheDocument()
   })

   it("renders note only when provided", () => {
      const { container } = render(<PricingCard item={mockPriceDetailItem} />)
      const noteElement = container.querySelector(".mt-10")
      expect(noteElement).toBeInTheDocument()
      expect(noteElement).toHaveTextContent("Harga per lokasi per bulan")
   })

   it("does not render note when not provided", () => {
      const itemWithoutNote = { ...mockPriceDetailItem, note: undefined }
      const { container } = render(<PricingCard item={itemWithoutNote} />)
      const noteElement = container.querySelector(".mt-10")
      expect(noteElement).not.toBeInTheDocument()
   })

   it("renders all features as check list items", () => {
      const { container } = render(<PricingCard item={mockPriceDetailItem} />)
      mockPriceDetailItem.feature.forEach((feature) => {
         expect(screen.getByText(feature)).toBeInTheDocument()
      })
      const checkIcons = container.querySelectorAll(".flaticon-check")
      expect(checkIcons).toHaveLength(4)
   })

   it("formats IDR price with Indonesian locale", () => {
      render(<PricingCard item={mockPriceDetailItem} />)
      expect(screen.getByText("4.500.000")).toBeInTheDocument()
      expect(screen.getByText("Rp")).toBeInTheDocument()
   })

   it("formats USD price with 2 decimal places", () => {
      const usdItem = { ...mockPriceDetailItem, price: 100.5, currency: "USD" }
      render(<PricingCard item={usdItem} />)
      expect(screen.getByText("$")).toBeInTheDocument()
      expect(screen.getByText("100.50")).toBeInTheDocument()
   })

   it("renders pricing item wrapper with correct classes", () => {
      const { container } = render(<PricingCard item={mockPriceDetailItem} />)
      const pricingItem = container.querySelector(".pricing-item")
      expect(pricingItem).toHaveClass("style-one")
      expect(pricingItem).toHaveClass("mb-40")
   })

   it("renders pricing head text-center class", () => {
      const { container } = render(<PricingCard item={mockPriceDetailItem} />)
      const pricingHead = container.querySelector(".pricing-head")
      expect(pricingHead).toHaveClass("text-center")
   })

   it("renders package span with sub_title", () => {
      const { container } = render(<PricingCard item={mockPriceDetailItem} />)
      const packageSpan = container.querySelector(".package")
      expect(packageSpan).toBeInTheDocument()
      expect(packageSpan).toHaveTextContent("Essential Connect")
   })

   it("renders price in h3 element", () => {
      const { container } = render(<PricingCard item={mockPriceDetailItem} />)
      const priceHeading = container.querySelector("h3")
      expect(priceHeading).toBeInTheDocument()
      expect(priceHeading).toContainHTML("span")
      expect(priceHeading).toHaveTextContent(/Rp/)
   })

   it("renders button with correct link and class", () => {
      const { container } = render(<PricingCard item={mockPriceDetailItem} />)
      const button = container.querySelector("a.theme-btn.style-two")
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent("Minta Proposal")
      expect(button).toHaveAttribute("href", "/contact")
   })

   it("renders check list with style-one class", () => {
      const { container } = render(<PricingCard item={mockPriceDetailItem} />)
      const checkList = container.querySelector("ul.check-list.style-one")
      expect(checkList).toBeInTheDocument()
   })

   it("renders with default fadeInUp animation", () => {
      const { container } = render(<PricingCard item={mockPriceDetailItem} />)
      const animationWrapper = container.querySelector(".wow")
      expect(animationWrapper).toBeInTheDocument()
      expect(animationWrapper).toHaveClass("fadeInUp")
   })

   it("renders with custom animation", () => {
      const { container } = render(<PricingCard item={mockPriceDetailItem} animation="fadeInDown" />)
      const animationWrapper = container.querySelector(".wow")
      expect(animationWrapper).toHaveClass("fadeInDown")
   })

   it("renders with no animation when animation is none", () => {
      const { container } = render(<PricingCard item={mockPriceDetailItem} animation="none" />)
      const animationWrapper = container.querySelector(".wow")
      expect(animationWrapper).not.toBeInTheDocument()
   })

   it("renders pricing body with check list", () => {
      const { container } = render(<PricingCard item={mockPriceDetailItem} />)
      const pricingBody = container.querySelector(".pricing-body")
      expect(pricingBody).toBeInTheDocument()
      expect(pricingBody).toContainElement(container.querySelector("ul.check-list"))
   })

   it("handles empty feature array", () => {
      const itemWithNoFeatures = { ...mockPriceDetailItem, feature: [] }
      const { container } = render(<PricingCard item={itemWithNoFeatures} />)
      const checkList = container.querySelector("ul.check-list")
      expect(checkList).toBeInTheDocument()
      expect(checkList).toBeEmptyDOMElement()
   })

   it("handles large price numbers correctly", () => {
      const largePriceItem = { ...mockPriceDetailItem, price: 12500000 }
      render(<PricingCard item={largePriceItem} />)
      expect(screen.getByText("Rp")).toBeInTheDocument()
      expect(screen.getByText("12.500.000")).toBeInTheDocument()
   })

   it("handles zero price with price_label", () => {
      const zeroPriceItem = { ...mockPriceDetailItem, price: 0, price_label: "Konsultasi Gratis" }
      render(<PricingCard item={zeroPriceItem} />)
      expect(screen.getByText("Konsultasi Gratis")).toBeInTheDocument()
      expect(screen.queryByText(/Rp/)).not.toBeInTheDocument()
   })
})
