import HomeOneDark from "@/components/homes/home-one-dark";
import Wrapper from "@/layouts/Wrapper";

export const runtime = 'nodejs';

export const metadata = {
  title: "Home One Dark AIcraft - AI Application & Generator React Next js Template",
};
const page = => {
  return (
    <Wrapper>
      <HomeOneDark />
    </Wrapper>
  )
}

export default page