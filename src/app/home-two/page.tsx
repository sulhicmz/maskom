import HomeTwo from "@/components/homes/home-two";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "Maskom | Alternatif Beranda",
  description: "Susunan beranda alternatif Maskom untuk menampilkan variasi penekanan solusi konektivitas dan managed service.",
};
const page = () => {
  return (
    <Wrapper>
      <HomeTwo />
    </Wrapper>
  )
}

export default page