import HomeThree from "@/components/homes/home-three";
import Wrapper from "@/layouts/Wrapper";

export const runtime = 'nodejs';

export const metadata = {
  title: "Home Three AIcraft - AI Application & Generator React Next js Template",
};
const page = () => {
  return (
    <Wrapper>
      <HomeThree />
    </Wrapper>
  )
}

export default page