import { render, screen } from "@testing-library/react"
import Cause from "../Cause"

jest.mock("@/data/CauseData", () => ({
   home_1_cause: [
      {
         id: 1,
         page: "home_1",
         icon: "fas fa-network-wired",
         title: "Jaringan Fiber Optic",
         desc: "Koneksi internet dedicated dengan kecepatan hingga 10 Gbps dan SLA 99.9%."
      }
   ]
}))

describe("Cause Component", () => {
   it("renders cause items", () => {
      render(<Cause />)
      expect(screen.getByText("Jaringan Fiber Optic")).toBeInTheDocument()
   })

   it("renders section title with SectionTitle component", () => {
      const { container } = render(<Cause />)
      expect(screen.getByText("Solusi Maskom")).toBeInTheDocument()
      expect(screen.getByText("Layanan Terintegrasi Untuk Bisnis Selalu Terkoneksi")).toBeInTheDocument()
      expect(container.querySelector(".section-title")).toBeInTheDocument()
   })

   it("renders correct section id", () => {
      const { container } = render(<Cause />)
      const section = container.querySelector("#solusi")
      expect(section).toBeInTheDocument()
   })

   it("renders animation classes through AnimationWrapper", () => {
      const { container } = render(<Cause />)
      expect(container.querySelector(".wow")).toBeInTheDocument()
   })
})
