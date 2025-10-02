import About from "@/components/about";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "Tentang Maskom - Penyedia Layanan Konektivitas & Managed Service Indonesia",
  description: "Pelajari perjalanan Maskom dalam menghadirkan layanan konektivitas dedicated, managed service, dan solusi infrastruktur digital untuk perusahaan di Indonesia.",
  keywords: "tentang maskom, managed service provider indonesia, penyedia internet dedicated, layanan jaringan terkelola, maskom network",
  openGraph: {
    title: "Tentang Maskom - Penyedia Layanan Konektivitas & Managed Service Indonesia",
    description: "Pelajari perjalanan Maskom dalam menghadirkan layanan konektivitas dedicated, managed service, dan solusi infrastruktur digital untuk perusahaan di Indonesia.",
    url: "https://maskom.co.id/about",
    siteName: "Maskom Network",
    locale: "id_ID",
    type: "website",
  },
};
const page = () => {
  return (
    <Wrapper>
      <About />
    </Wrapper>
  )
}

export default page