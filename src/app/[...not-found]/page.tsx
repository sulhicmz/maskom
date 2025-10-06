import Wrapper from "@/layouts/Wrapper";
import NotFound from "@/components/pages/error";

export const runtime = 'nodejs';

export const metadata = {
  title: "404 Not Found - AIcraft - AI Application & Generator React Next js Template",
};

const page = () => {
  return (
    <Wrapper>
      <NotFound />
    </Wrapper>
  )
}

export default page;
