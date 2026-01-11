import { render, screen } from "@testing-library/react"
import Feedback from "../Feedback"

jest.mock("next/image", () => ({
   __esModule: true,
   default: ({ src, alt }: { src: string; alt: string }) => {
      return <img src={src} alt={alt} />
   }
}))

jest.mock("@/data/FeedbackData", () => ({
   home_1_feedback: [
      {
         id: 1,
         page: "home_1",
         name: "Rizky Pratama",
         designation: "IT Manager, Retail Nasional",
         avatar: "https://example.com/avatar.jpg",
         rating: "4.9",
         desc: "SLA Maskom selalu tercapai. Saat ada kendala di salah satu cabang, tim NOC langsung koordinasi dan memberikan solusi sementara sambil menyiapkan perbaikan permanen."
      }
   ]
}))

describe("Feedback Component", () => {
   it("renders feedback items", () => {
      render(<Feedback />)
      expect(screen.getByText("Rizky Pratama")).toBeInTheDocument()
      expect(screen.getByText("IT Manager, Retail Nasional")).toBeInTheDocument()
   })

   it("renders section title with SectionTitle component", () => {
      render(<Feedback />)
      expect(screen.getByText("Testimoni")).toBeInTheDocument()
      expect(screen.getByText("Apa Kata Partner Kami")).toBeInTheDocument()
   })

   it("renders with BackgroundSection component", () => {
      const { container } = render(<Feedback />)
      expect(container.querySelector(".bg_cover")).toBeInTheDocument()
   })

   it("renders correct section id", () => {
      const { container } = render(<Feedback />)
      const section = container.querySelector("#testimoni")
      expect(section).toBeInTheDocument()
   })

   it("renders animation classes through AnimationWrapper", () => {
      const { container } = render(<Feedback />)
      expect(container.querySelector(".wow")).toBeInTheDocument()
   })
})
