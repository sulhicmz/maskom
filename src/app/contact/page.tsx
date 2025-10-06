import Contact from "@/components/contact";
import Wrapper from "@/layouts/Wrapper";

export const runtime = 'nodejs';

export const metadata = {
  title: "Kontak Maskom",
  description: "Hubungi tim Maskom untuk konsultasi layanan konektivitas, managed service, dan dukungan teknis 24/7.",
};
const page = () => {
  return (
    <Wrapper>
      <Contact />
    </Wrapper>
  )
}

export default page