import HomeThree from "@/components/homes/home-three";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "Maskom | Eksplorasi Solusi",
  description: "Layout eksplorasi solusi Maskom yang menonjolkan studi kasus, kolaborasi industri, dan opsi layanan tambahan.",
};
const page = () => {
  return (
    <Wrapper>
      <HomeThree />
    </Wrapper>
  )
}

export default page