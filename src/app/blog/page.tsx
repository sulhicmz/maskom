import Blog from "@/components/blogs/blog";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "Blog AIcraft - AI Application & Generator React Next js Template",
};
const page = () => {
  return (
    <Wrapper>
      <Blog />
    </Wrapper>
  )
}

export default page