import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import BlogSearch from "../BlogSearch"

describe("BlogSearch", () => {
   it("renders search input with placeholder", () => {
      render(<BlogSearch value="" onChange={jest.fn()} />)
      
      const input = screen.getByPlaceholderText("Cari judul atau deskripsi...")
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute("type", "text")
   })

   it("displays current search value", () => {
      render(<BlogSearch value="test query" onChange={jest.fn()} />)
      
      const input = screen.getByDisplayValue("test query")
      expect(input).toBeInTheDocument()
   })

   it("calls onChange with debounced value", async () => {
      const handleChange = jest.fn()
      render(<BlogSearch value="" onChange={handleChange} />)
      
      const input = screen.getByPlaceholderText("Cari judul atau deskripsi...")
      fireEvent.change(input, { target: { value: "test" } })
      
      await waitFor(() => {
         expect(handleChange).toHaveBeenCalledWith("test")
      }, { timeout: 350 })
   })

   it("debounces input changes", async () => {
      const handleChange = jest.fn()
      render(<BlogSearch value="" onChange={handleChange} />)
      
      const input = screen.getByPlaceholderText("Cari judul atau deskripsi...")
      
      fireEvent.change(input, { target: { value: "t" } })
      fireEvent.change(input, { target: { value: "te" } })
      fireEvent.change(input, { target: { value: "tes" } })
      fireEvent.change(input, { target: { value: "test" } })
      
      await waitFor(() => {
         expect(handleChange).toHaveBeenCalledTimes(1)
         expect(handleChange).toHaveBeenCalledWith("test")
      }, { timeout: 350 })
   })

   it("shows clear button when value is present", () => {
      render(<BlogSearch value="test query" onChange={jest.fn()} />)
      
      const clearButton = screen.getByLabelText("Hapus pencarian")
      expect(clearButton).toBeInTheDocument()
      expect(clearButton).toHaveTextContent("×")
   })

   it("hides clear button when value is empty", () => {
      render(<BlogSearch value="" onChange={jest.fn()} />)
      
      const clearButton = screen.queryByLabelText("Hapus pencarian")
      expect(clearButton).not.toBeInTheDocument()
   })

   it("clears search when clear button is clicked", () => {
      const handleChange = jest.fn()
      render(<BlogSearch value="test query" onChange={handleChange} />)
      
      const clearButton = screen.getByLabelText("Hapus pencarian")
      fireEvent.click(clearButton)
      
      expect(handleChange).toHaveBeenCalledWith("")
   })

   it("has proper aria-labels for accessibility", () => {
      render(<BlogSearch value="" onChange={jest.fn()} />)
      
      const input = screen.getByLabelText("Cari artikel")
      expect(input).toBeInTheDocument()
   })

   it("updates search value when prop changes", () => {
      const { rerender } = render(<BlogSearch value="" onChange={jest.fn()} />)
      
      let input = screen.getByPlaceholderText("Cari judul atau deskripsi...")
      expect(input).toHaveValue("")
      
      rerender(<BlogSearch value="new value" onChange={jest.fn()} />)
      
      input = screen.getByPlaceholderText("Cari judul atau deskripsi...")
      expect(input).toHaveValue("new value")
   })

   it("has widget title", () => {
      render(<BlogSearch value="" onChange={jest.fn()} />)
      
      const title = screen.getByText("Cari Artikel")
      expect(title).toBeInTheDocument()
      expect(title.tagName).toBe("H3")
   })
})
