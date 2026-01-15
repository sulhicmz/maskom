import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import Button from "../Button"

describe("Button", () => {
   it("renders with default primary variant", () => {
      render(<Button>Click me</Button>)
      
      const button = screen.getByRole("button", { name: "Click me" })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass("btn", "btn-primary")
   })

   it("renders with secondary variant", () => {
      render(<Button variant="secondary">Click me</Button>)
      
      const button = screen.getByRole("button", { name: "Click me" })
      expect(button).toHaveClass("btn", "btn-secondary")
   })

   it("renders with text variant", () => {
      render(<Button variant="text">Click me</Button>)
      
      const button = screen.getByRole("button", { name: "Click me" })
      expect(button).toHaveClass("btn", "btn-link")
   })

   it("merges custom className with variant classes", () => {
      render(
         <Button variant="primary" className="custom-class">
            Click me
         </Button>
      )
      
      const button = screen.getByRole("button", { name: "Click me" })
      expect(button).toHaveClass("btn", "btn-primary", "custom-class")
   })

   it("calls onClick when clicked", () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      const button = screen.getByRole("button", { name: "Click me" })
      fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
   })

   it("renders with type button by default", () => {
      render(<Button>Click me</Button>)
      
      const button = screen.getByRole("button", { name: "Click me" })
      expect(button).toHaveAttribute("type", "button")
   })

   it("renders with submit type", () => {
      render(<Button type="submit">Submit</Button>)
      
      const button = screen.getByRole("button", { name: "Submit" })
      expect(button).toHaveAttribute("type", "submit")
   })

   it("renders with reset type", () => {
      render(<Button type="reset">Reset</Button>)
      
      const button = screen.getByRole("button", { name: "Reset" })
      expect(button).toHaveAttribute("type", "reset")
   })

   it("has aria-label when provided", () => {
      render(<Button ariaLabel="Accessible button">Click me</Button>)
      
      const button = screen.getByRole("button", { name: "Accessible button" })
      expect(button).toBeInTheDocument()
   })

   it("renders children correctly", () => {
      render(<Button><span>Button content</span></Button>)
      
      const button = screen.getByRole("button")
      expect(button).toContainHTML("<span>Button content</span>")
   })
})
