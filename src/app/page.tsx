import HomeOne from "@/components/homes/home-one";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "Maskom Network | Layanan Konektivitas & Managed Service Indonesia",
  description: "Maskom menyediakan layanan konektivitas dedicated, managed service, dan solusi infrastruktur digital untuk bisnis di seluruh Indonesia. SLA 99.9%, dukungan 24/7, dan infrastruktur terkelola.",
  keywords: "layanan internet dedicated, managed service provider, fiber optic indonesia, konektivitas bisnis, SLA 99.9%, network operation center, maskom network",
  openGraph: {
    title: "Maskom Network | Layanan Konektivitas & Managed Service Indonesia",
    description: "Maskom menyediakan layanan konektivitas dedicated, managed service, dan solusi infrastruktur digital untuk bisnis di seluruh Indonesia.",
    url: "https://maskom.co.id",
    siteName: "Maskom Network",
    images: [
      {
        url: "https://maskom.co.id/og-image.jpg", // Replace with actual OG image
        width: 1200,
        height: 630,
        alt: "Maskom Network - Layanan Konektivitas & Managed Service",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  alternates: {
    canonical: "https://maskom.co.id",
  },
};
const page = () => {
  return (
    <Wrapper>
      <HomeOne />
    </Wrapper>
  )
}

export default page