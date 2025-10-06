import HomeOneDark from "@/components/homes/home-one-dark";
import Wrapper from "@/layouts/Wrapper";

export const runtime = 'nodejs';

export const metadata = {
  title: "Maskom | Solusi Konektivitas dan Managed Service",
  description: "Maskom menghadirkan layanan konektivitas terkelola, infrastruktur jaringan, dan dukungan operasional 24/7 untuk mendukung transformasi digital bisnis.",
};
const page = () => {
  return (
    <Wrapper>
      <HomeOneDark />
    </Wrapper>
  )
}

export default page
