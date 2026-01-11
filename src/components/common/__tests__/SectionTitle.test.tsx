import React from "react"
import { render, screen } from "@testing-library/react"
import SectionTitle from "../SectionTitle"

describe("SectionTitle Component", () => {
   it("renders title with subtitle and description", () => {
      render(<SectionTitle title="Main Title" subtitle="Subtitle" description="Description text" />)
      expect(screen.getByText("Main Title")).toBeInTheDocument()
      expect(screen.getByText("Subtitle")).toBeInTheDocument()
      expect(screen.getByText("Description text")).toBeInTheDocument()
   })

   it("renders title without optional props", () => {
      const { container } = render(<SectionTitle title="Only Title" />)
      expect(screen.getByText("Only Title")).toBeInTheDocument()
      expect(container.querySelector(".sub-title")).not.toBeInTheDocument()
      expect(container.querySelector("p")).not.toBeInTheDocument()
   })

   it("renders with center alignment by default", () => {
      const { container } = render(<SectionTitle title="Title" />)
      const section = container.querySelector(".section-title")
      expect(section).toHaveClass("text-center")
   })

   it("renders with left alignment", () => {
      const { container } = render(<SectionTitle title="Title" align="left" />)
      const section = container.querySelector(".section-title")
      expect(section).toHaveClass("text-left")
   })

   it("renders with right alignment", () => {
      const { container } = render(<SectionTitle title="Title" align="right" />)
      const section = container.querySelector(".section-title")
      expect(section).toHaveClass("text-right")
   })

   it("renders with fadeInDown animation by default", () => {
      const { container } = render(<SectionTitle title="Title" />)
      const section = container.querySelector(".section-title")
      expect(section).toHaveClass("wow")
      expect(section).toHaveClass("fadeInDown")
   })

   it("renders with fadeInUp animation", () => {
      const { container } = render(<SectionTitle title="Title" animation="fadeInUp" />)
      const section = container.querySelector(".section-title")
      expect(section).toHaveClass("wow")
      expect(section).toHaveClass("fadeInUp")
   })

   it("renders without animation when animation is none", () => {
      const { container } = render(<SectionTitle title="Title" animation="none" />)
      const section = container.querySelector(".section-title")
      expect(section).not.toHaveClass("wow")
      expect(section).not.toHaveClass("fadeInDown")
      expect(section).not.toHaveClass("fadeInUp")
   })

   it("renders with white text", () => {
      const { container } = render(<SectionTitle title="Title" whiteText />)
      const section = container.querySelector(".section-title")
      expect(section).toHaveClass("title-white")
   })

   it("renders with custom className", () => {
      const { container } = render(<SectionTitle title="Title" className="custom-class" />)
      const section = container.querySelector(".section-title")
      expect(section).toHaveClass("custom-class")
   })

   it("renders subtitle with style-one class", () => {
      const { container } = render(<SectionTitle title="Title" subtitle="Subtitle" />)
      const subtitle = container.querySelector(".sub-title")
      expect(subtitle).toHaveClass("style-one")
   })

   it("renders title in h2 element", () => {
      const { container } = render(<SectionTitle title="Title" />)
      const title = container.querySelector("h2")
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent("Title")
   })

   it("renders description in p element", () => {
      const { container } = render(<SectionTitle title="Title" description="Description" />)
      const description = container.querySelector("p")
      expect(description).toBeInTheDocument()
      expect(description).toHaveTextContent("Description")
   })

   it("combines all classes correctly", () => {
      const { container } = render(
         <SectionTitle title="Title" subtitle="Sub" description="Desc" align="center" animation="fadeInUp" whiteText className="mb-50" />
      )
      const section = container.querySelector(".section-title")
      expect(section).toHaveClass("section-title")
      expect(section).toHaveClass("text-center")
      expect(section).toHaveClass("title-white")
      expect(section).toHaveClass("mb-50")
      expect(section).toHaveClass("wow")
      expect(section).toHaveClass("fadeInUp")
   })
})
