import cta_1 from "@/assets/images/gallery/robot2.svg"
import cta_2 from "@/assets/images/gallery/base2.svg"
import CtaWrapper from "@/components/common/CtaWrapper"

const Cta = () => (
   <CtaWrapper
      heading="Siap Tingkatkan Kualitas Konektivitas Anda?"
      description="Diskusikan kebutuhan jaringan dan managed service bersama konsultan Maskom. Kami bantu rancang solusi paling efisien."
      buttonText="Hubungi Maskom"
      buttonLink="/contact"
      images={[
         { src: cta_1, alt: "Robot ilustrasi layanan konektivitas Maskom", className: "image-one" },
         { src: cta_2, alt: "Base ilustrasi infrastruktur jaringan", className: "image-two" }
      ]}
      sectionClassName="cta-section"
      id="hubungi"
   />
)

export default Cta
