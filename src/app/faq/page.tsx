import Faq from "@/components/pages/faq";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "FAQ Maskom",
  description: "Pertanyaan umum terkait layanan konektivitas dan managed service Maskom.",
};
const page = () => {
  return (
    <Wrapper>
      <Faq />
    </Wrapper>
  )
}

export default page