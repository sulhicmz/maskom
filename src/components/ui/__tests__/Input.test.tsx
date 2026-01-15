import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import Input from "../Input"

describe("Input", () => {
   it("renders input with default type text", () => {
      render(
         <Input
            type="text"
            value=""
            onChange={jest.fn()}
         />
      )
      
      const input = screen.getByRole("textbox")
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute("type", "text")
   })

   it("renders input with custom type", () => {
      render(
         <Input
            type="email"
            value=""
            onChange={jest.fn()}
         />
      )
      
      const input = screen.getByRole("textbox")
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute("type", "email")
   })

   it("renders with placeholder text", () => {
      render(
         <Input
            placeholder="Enter text"
            value=""
            onChange={jest.fn()}
         />
      )
      
      const input = screen.getByPlaceholderText("Enter text")
      expect(input).toBeInTheDocument()
   })

   it("displays the provided value", () => {
      render(
         <Input
            value="Test value"
            onChange={jest.fn()}
         />
      )
      
      const input = screen.getByDisplayValue("Test value")
      expect(input).toBeInTheDocument()
   })

   it("calls onChange when input changes", () => {
      const handleChange = jest.fn()
      render(
         <Input
            value=""
            onChange={handleChange}
         />
      )
      
      const input = screen.getByRole("textbox")
      fireEvent.change(input, { target: { value: "New value" } })
      
      expect(handleChange).toHaveBeenCalledTimes(1)
   })

   it("has form-control class by default", () => {
      render(
         <Input
            value=""
            onChange={jest.fn()}
         />
      )
      
      const input = screen.getByRole("textbox")
      expect(input).toHaveClass("form-control")
   })

   it("merges custom className with form-control", () => {
      render(
         <Input
            value=""
            onChange={jest.fn()}
            className="custom-class"
         />
      )
      
      const input = screen.getByRole("textbox")
      expect(input).toHaveClass("form-control", "custom-class")
   })

   it("has aria-label when provided", () => {
      render(
         <Input
            value=""
            onChange={jest.fn()}
            ariaLabel="Test input"
         />
      )
      
      const input = screen.getByLabelText("Test input")
      expect(input).toBeInTheDocument()
   })
})
