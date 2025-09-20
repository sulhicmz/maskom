import NotFound from "@/components/pages/error";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "404 || AIcraft - AI Application & Generator React Next js Template",
};

export const runtime = "edge";
const page = () => {
  return (
    <Wrapper>
      <NotFound />
    </Wrapper>
  )
}

export default page;
