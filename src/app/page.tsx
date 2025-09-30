import HomeOne from "@/components/homes/home-one";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "Maskom | Solusi Konektivitas dan Managed Service",
  description: "Maskom menghadirkan layanan konektivitas terkelola, infrastruktur jaringan, dan dukungan operasional 24/7 untuk mendukung transformasi digital bisnis.",
};
const page = () => {
  return (
    <Wrapper>
      <HomeOne />
    </Wrapper>
  )
}

export default page