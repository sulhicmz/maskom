import React from "react"
import { render, screen } from "@testing-library/react"
import BackgroundSection from "../BackgroundSection"

describe("BackgroundSection Component", () => {
   it("renders children with background image", () => {
      const { container } = render(
         <BackgroundSection backgroundImage="/assets/images/bg/testimonial-bg.webp">Content</BackgroundSection>
      )
      const section = container.querySelector(".bg_cover")
      expect(section).toBeInTheDocument()
      expect(section).toHaveStyle({ backgroundImage: 'url(/assets/images/bg/testimonial-bg.webp)' })
      expect(screen.getByText("Content")).toBeInTheDocument()
   })

   it("renders with custom className", () => {
      const { container } = render(
         <BackgroundSection backgroundImage="/assets/images/bg/testimonial-bg.webp" className="pt-110 pb-90">
            Content
         </BackgroundSection>
      )
      const section = container.querySelector(".bg_cover")
      expect(section).toHaveClass("pt-110")
      expect(section).toHaveClass("pb-90")
   })

   it("renders with id attribute", () => {
      const { container } = render(
         <BackgroundSection backgroundImage="/assets/images/bg/testimonial-bg.webp" id="testimoni">
            Content
         </BackgroundSection>
      )
      const section = container.querySelector(".bg_cover")
      expect(section).toHaveAttribute("id", "testimoni")
   })

   it("renders without id when not provided", () => {
      const { container } = render(
         <BackgroundSection backgroundImage="/assets/images/bg/testimonial-bg.webp">Content</BackgroundSection>
      )
      const section = container.querySelector(".bg_cover")
      expect(section).not.toHaveAttribute("id")
   })

   it("renders as section element", () => {
      const { container } = render(
         <BackgroundSection backgroundImage="/assets/images/bg/testimonial-bg.webp">Content</BackgroundSection>
      )
      const section = container.querySelector("section")
      expect(section).toBeInTheDocument()
   })

   it("renders complex children", () => {
      render(
         <BackgroundSection backgroundImage="/assets/images/bg/testimonial-bg.webp">
            <div>
               <span>Nested Content</span>
            </div>
         </BackgroundSection>
      )
      expect(screen.getByText("Nested Content")).toBeInTheDocument()
   })

   it("renders with all props", () => {
      const { container } = render(
         <BackgroundSection backgroundImage="/assets/images/bg/testimonial-bg.webp" className="pt-110 pb-90" id="testimoni">
            Content
         </BackgroundSection>
      )
      const section = container.querySelector(".bg_cover")
      expect(section).toHaveClass("bg_cover")
      expect(section).toHaveClass("pt-110")
      expect(section).toHaveClass("pb-90")
      expect(section).toHaveStyle({ backgroundImage: 'url(/assets/images/bg/testimonial-bg.webp)' })
      expect(section).toHaveAttribute("id", "testimoni")
   })
})
