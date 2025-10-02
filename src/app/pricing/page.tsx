import Pricing from "@/components/pages/pricing";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "Harga Layanan Maskom - Paket Internet Dedicated & Managed Service",
  description: "Detail paket konektivitas dan managed service Maskom untuk berbagai kebutuhan bisnis. Dapatkan SLA 99.9%, dukungan 24/7, dan solusi terkelola untuk infrastruktur digital Anda.",
  keywords: "harga maskom, paket internet dedicated, managed service pricing, biaya layanan jaringan, paket konektivitas bisnis",
  openGraph: {
    title: "Harga Layanan Maskom - Paket Internet Dedicated & Managed Service",
    description: "Detail paket konektivitas dan managed service Maskom untuk berbagai kebutuhan bisnis.",
    url: "https://maskom.co.id/pricing",
    siteName: "Maskom Network",
    locale: "id_ID",
    type: "website",
  },
};
const page = () => {
  return (
    <Wrapper>
      <Pricing />
    </Wrapper>
  )
}

export default page