import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import BlogCategoryFilter from "../BlogCategoryFilter"

const mockRouter = {
   push: jest.fn(),
}

jest.mock("next/navigation", () => ({
   useRouter: () => mockRouter,
   usePathname: () => "/blog",
   useSearchParams: () => new URLSearchParams(""),
}))

describe("BlogCategoryFilter", () => {
   beforeEach(() => {
      jest.clearAllMocks()
   })

   it("renders category dropdown with all categories", () => {
      render(<BlogCategoryFilter selectedCategory={null} onCategoryChange={jest.fn()} />)
      
      const title = screen.getByText("Kategori")
      expect(title).toBeInTheDocument()
      expect(title.tagName).toBe("H3")
      
      const select = screen.getByLabelText("Filter kategori artikel")
      expect(select).toBeInTheDocument()
      
      expect(screen.getByText("Semua Kategori")).toBeInTheDocument()
      expect(screen.getByText("Konektivitas Terkelola")).toBeInTheDocument()
      expect(screen.getByText("Keamanan Jaringan")).toBeInTheDocument()
      expect(screen.getByText("Operasional & Dukungan")).toBeInTheDocument()
      expect(screen.getByText("Transformasi Digital")).toBeInTheDocument()
      expect(screen.getByText("Infrastruktur Cloud")).toBeInTheDocument()
      expect(screen.getByText("IoT & Edge")).toBeInTheDocument()
   })

   it("shows no category selected by default", () => {
      render(<BlogCategoryFilter selectedCategory={null} onCategoryChange={jest.fn()} />)
      
      const select = screen.getByLabelText("Filter kategori artikel") as HTMLSelectElement
      expect(select.value).toBe("")
   })

    it("shows selected category", () => {
       render(
          <BlogCategoryFilter selectedCategory={1} onCategoryChange={jest.fn()} />
       )

       const select = screen.getByLabelText("Filter kategori artikel") as HTMLSelectElement
       expect(select.value).toBe("1")
    })

    it("calls onCategoryChange when category is selected", () => {
       const handleChange = jest.fn()
       render(<BlogCategoryFilter selectedCategory={null} onCategoryChange={handleChange} />)

       const select = screen.getByLabelText("Filter kategori artikel")
       fireEvent.change(select, { target: { value: "1" } })

       expect(handleChange).toHaveBeenCalledWith(1)
    })

    it("calls onCategoryChange with null when all categories selected", () => {
       const handleChange = jest.fn()
       render(
          <BlogCategoryFilter selectedCategory={1} onCategoryChange={handleChange} />
       )

       const select = screen.getByLabelText("Filter kategori artikel")
       fireEvent.change(select, { target: { value: "" } })

       expect(handleChange).toHaveBeenCalledWith(null)
    })

    it("shows clear filter button when category is selected", () => {
       render(
          <BlogCategoryFilter selectedCategory={1} onCategoryChange={jest.fn()} />
       )

       const clearButton = screen.getByText("Hapus Filter")
       expect(clearButton).toBeInTheDocument()
    })

    it("hides clear filter button when no category is selected", () => {
       render(<BlogCategoryFilter selectedCategory={null} onCategoryChange={jest.fn()} />)

       const clearButton = screen.queryByText("Hapus Filter")
       expect(clearButton).not.toBeInTheDocument()
    })

    it("clears filter when clear button is clicked", () => {
       const handleChange = jest.fn()
       render(
          <BlogCategoryFilter selectedCategory={1} onCategoryChange={handleChange} />
       )

       const clearButton = screen.getByText("Hapus Filter")
       fireEvent.click(clearButton)

       expect(handleChange).toHaveBeenCalledWith(null)
    })

    it("updates URL when category changes", () => {
       render(<BlogCategoryFilter selectedCategory={null} onCategoryChange={jest.fn()} />)

       const select = screen.getByLabelText("Filter kategori artikel")
       fireEvent.change(select, { target: { value: "1" } })

       expect(mockRouter.push).toHaveBeenCalledWith("/blog?category=1")
    })

    it("removes category from URL when category is cleared", () => {
       render(
          <BlogCategoryFilter selectedCategory={1} onCategoryChange={jest.fn()} />
       )

       const clearButton = screen.getByText("Hapus Filter")
       fireEvent.click(clearButton)
      
      expect(mockRouter.push).toHaveBeenCalledWith("/blog")
   })

   it("has proper aria-labels for accessibility", () => {
      render(<BlogCategoryFilter selectedCategory={null} onCategoryChange={jest.fn()} />)
      
      const select = screen.getByLabelText("Filter kategori artikel")
      expect(select).toBeInTheDocument()
   })
})
