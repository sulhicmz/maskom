import HomeOneDark from "@/components/homes/home-one-dark";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "Maskom | Tampilan Gelap",
  description: "Variasi tampilan gelap situs Maskom dengan konten dan layanan konektivitas yang sama dalam nuansa warna lebih kontras.",
};
const page = () => {
  return (
    <Wrapper>
      <HomeOneDark />
    </Wrapper>
  )
}

export default page