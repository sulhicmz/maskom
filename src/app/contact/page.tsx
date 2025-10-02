import Contact from "@/components/contact";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "Kontak Maskom - Konsultasi Layanan Konektivitas & Managed Service",
  description: "Hubungi tim Maskom untuk konsultasi layanan konektivitas dedicated, managed service, dan dukungan teknis 24/7. Dapatkan solusi infrastruktur digital terbaik untuk bisnis Anda.",
  keywords: "kontak maskom, konsultasi layanan IT, managed service provider indonesia, koneksi internet dedicated, konsultasi konektivitas",
  openGraph: {
    title: "Kontak Maskom - Konsultasi Layanan Konektivitas & Managed Service",
    description: "Hubungi tim Maskom untuk konsultasi layanan konektivitas dedicated, managed service, dan dukungan teknis 24/7.",
    url: "https://maskom.co.id/contact",
    siteName: "Maskom Network",
    locale: "id_ID",
    type: "website",
  },
};
const page = () => {
  return (
    <Wrapper>
      <Contact />
    </Wrapper>
  )
}

export default page