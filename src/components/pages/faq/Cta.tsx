import thumb from "@/assets/images/gallery/faq.png"
import CtaWrapper from "@/components/common/CtaWrapper"

const Cta = () => (
   <CtaWrapper
      heading="Butuh bantuan memilih paket Maskom?"
      description="Tim solusi kami siap membantu melakukan assesment awal, menghitung estimasi investasi, dan menyiapkan demo layanan sesuai kebutuhan perusahaan Anda."
      buttonText="Jadwalkan Konsultasi"
      buttonLink="/contact"
      images={[{ src: thumb, alt: "faq-image" }]}
      sectionClassName="cta-section"
      contentClassName="cta-one_content-box mb-20"
      imageBoxClassName="cta-one_image-box text-end p-r z-1 mb-20"
      backgroundImage="/assets/images/bg/faq-bg.webp"
      animation="fadeInLeft"
      animationType="wow"
      shapes={true}
      paddingBottom="pt-50 pb-30"
   />
)

export default Cta
