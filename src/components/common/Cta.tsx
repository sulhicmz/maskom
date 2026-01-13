import cta_1 from "@/assets/images/gallery/robot2.webp"
import cta_2 from "@/assets/images/gallery/base2.png"
import CtaWrapper from "./CtaWrapper"

const Cta = () => (
   <CtaWrapper
      heading="Bangun Infrastruktur Digital yang Tangguh"
      description="Maskom siap mendampingi perjalanan transformasi digital Anda mulai dari perencanaan hingga operasional sehari-hari."
      buttonText="Konsultasi dengan Kami"
      buttonLink="/contact"
      images={[
         { src: cta_1, alt: "Robot AI yang mendukung infrastruktur digital", className: "image-one" },
         { src: cta_2, alt: "Dasar platform teknologi modern", className: "image-two" }
      ]}
      sectionClassName="cta-section pb-120"
   />
)

export default Cta
