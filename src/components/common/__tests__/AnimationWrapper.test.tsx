import React from "react"
import { render, screen } from "@testing-library/react"
import AnimationWrapper from "../AnimationWrapper"

describe("AnimationWrapper Component", () => {
   it("renders children with fadeInUp animation by default", () => {
      const { container } = render(<AnimationWrapper>Content</AnimationWrapper>)
      const wrapper = container.querySelector(".wow")
      expect(wrapper).toHaveClass("fadeInUp")
      expect(screen.getByText("Content")).toBeInTheDocument()
   })

   it("renders children without animation when animation is none", () => {
      const { container } = render(<AnimationWrapper animation="none">Content</AnimationWrapper>)
      const wrapper = container.querySelector(".wow")
      expect(wrapper).not.toBeInTheDocument()
      expect(screen.getByText("Content")).toBeInTheDocument()
   })

   it("renders with fadeInDown animation", () => {
      const { container } = render(<AnimationWrapper animation="fadeInDown">Content</AnimationWrapper>)
      const wrapper = container.querySelector(".wow")
      expect(wrapper).toHaveClass("fadeInDown")
   })

   it("renders with fadeInLeft animation", () => {
      const { container } = render(<AnimationWrapper animation="fadeInLeft">Content</AnimationWrapper>)
      const wrapper = container.querySelector(".wow")
      expect(wrapper).toHaveClass("fadeInLeft")
   })

   it("renders with fadeInRight animation", () => {
      const { container } = render(<AnimationWrapper animation="fadeInRight">Content</AnimationWrapper>)
      const wrapper = container.querySelector(".wow")
      expect(wrapper).toHaveClass("fadeInRight")
   })

   it("renders with delay data attribute", () => {
      const { container } = render(<AnimationWrapper animation="fadeInDown" delay="0.5s">Content</AnimationWrapper>)
      const wrapper = container.querySelector(".wow")
      expect(wrapper).toHaveAttribute("data-wow-delay", "0.5s")
   })

   it("renders without delay data attribute when delay is not provided", () => {
      const { container } = render(<AnimationWrapper>Content</AnimationWrapper>)
      const wrapper = container.querySelector(".wow")
      expect(wrapper).not.toHaveAttribute("data-wow-delay")
   })

   it("renders with offset data attribute", () => {
      const { container } = render(<AnimationWrapper animation="fadeInDown" offset="100">Content</AnimationWrapper>)
      const wrapper = container.querySelector(".wow")
      expect(wrapper).toHaveAttribute("data-wow-offset", "100")
   })

   it("renders without offset data attribute when offset is not provided", () => {
      const { container } = render(<AnimationWrapper>Content</AnimationWrapper>)
      const wrapper = container.querySelector(".wow")
      expect(wrapper).not.toHaveAttribute("data-wow-offset")
   })

   it("renders with duration data attribute", () => {
      const { container } = render(<AnimationWrapper animation="fadeInDown" duration="1s">Content</AnimationWrapper>)
      const wrapper = container.querySelector(".wow")
      expect(wrapper).toHaveAttribute("data-wow-duration", "1s")
   })

   it("renders without duration data attribute when duration is not provided", () => {
      const { container } = render(<AnimationWrapper>Content</AnimationWrapper>)
      const wrapper = container.querySelector(".wow")
      expect(wrapper).not.toHaveAttribute("data-wow-duration")
   })

   it("renders with custom className", () => {
      const { container } = render(<AnimationWrapper className="custom-class">Content</AnimationWrapper>)
      const wrapper = container.querySelector(".wow")
      expect(wrapper).toHaveClass("custom-class")
      expect(wrapper).toHaveClass("fadeInUp")
   })

   it("renders complex children", () => {
      render(
         <AnimationWrapper>
            <div>
               <span>Nested Content</span>
            </div>
         </AnimationWrapper>
      )
      expect(screen.getByText("Nested Content")).toBeInTheDocument()
   })

   it("renders with all animation props", () => {
      const { container } = render(
         <AnimationWrapper animation="fadeInLeft" delay="0.3s" offset="50" duration="0.8s" className="mb-50">
            Content
         </AnimationWrapper>
      )
      const wrapper = container.querySelector(".wow")
      expect(wrapper).toHaveClass("wow")
      expect(wrapper).toHaveClass("fadeInLeft")
      expect(wrapper).toHaveClass("mb-50")
      expect(wrapper).toHaveAttribute("data-wow-delay", "0.3s")
      expect(wrapper).toHaveAttribute("data-wow-offset", "50")
      expect(wrapper).toHaveAttribute("data-wow-duration", "0.8s")
   })
})
