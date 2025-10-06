import About from "@/components/about";
import Wrapper from "@/layouts/Wrapper";

export const runtime = 'nodejs';

export const metadata = {
  title: "Tentang Maskom",
  description: "Pelajari perjalanan Maskom dalam menghadirkan layanan konektivitas dan managed service untuk perusahaan di Indonesia.",
};
const page = () => {
  return (
    <Wrapper>
      <About />
    </Wrapper>
  )
}

export default page