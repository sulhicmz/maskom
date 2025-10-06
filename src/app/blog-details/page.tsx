import BlogDetails from "@/components/blogs/blog-details";
import Wrapper from "@/layouts/Wrapper";

export const runtime = 'nodejs';

export const metadata = {
  title: "Insight Maskom - Detail Artikel",
  description: "Baca ulasan mendalam Maskom mengenai inovasi konektivitas, keamanan, dan operasional jaringan.",
};
const page = () => {
  return (
    <Wrapper>
      <BlogDetails />
    </Wrapper>
  )
}

export default page