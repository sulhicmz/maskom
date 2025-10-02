import Faq from "@/components/pages/faq";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "FAQ Maskom - Jawaban untuk Pertanyaan Umum Layanan",
  description: "Temukan jawaban untuk pertanyaan umum terkait layanan konektivitas dan managed service Maskom. Dapatkan informasi tentang SLA, dukungan teknis, dan proses implementasi.",
  keywords: "faq maskom, pertanyaan umum, managed service indonesia, internet dedicated, support maskom, service level agreement",
  openGraph: {
    title: "FAQ Maskom - Jawaban untuk Pertanyaan Umum Layanan",
    description: "Temukan jawaban untuk pertanyaan umum terkait layanan konektivitas dan managed service Maskom.",
    url: "https://maskom.co.id/faq",
    siteName: "Maskom Network",
    locale: "id_ID",
    type: "website",
  },
};
const page = () => {
  return (
    <Wrapper>
      <Faq />
    </Wrapper>
  )
}

export default page