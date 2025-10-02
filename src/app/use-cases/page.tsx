import UseCases from "@/components/causes/use-cases";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "Solusi Maskom - Layanan Konektivitas & Managed Service untuk Berbagai Industri",
  description: "Lihat rangkaian solusi konektivitas dedicated, managed service, dan solusi infrastruktur digital Maskom untuk berbagai sektor industri di Indonesia.",
  keywords: "solusi maskom, layanan konektivitas, managed service, internet dedicated, fiber optic indonesia, solusi jaringan",
  openGraph: {
    title: "Solusi Maskom - Layanan Konektivitas & Managed Service untuk Berbagai Industri",
    description: "Lihat rangkaian solusi konektivitas dan managed service Maskom untuk berbagai sektor industri.",
    url: "https://maskom.co.id/use-cases",
    siteName: "Maskom Network",
    locale: "id_ID",
    type: "website",
  },
};
const page = () => {
  return (
    <Wrapper>
      <UseCases />
    </Wrapper>
  )
}

export default page