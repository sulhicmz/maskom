import Blog from "@/components/blogs/blog";
import Wrapper from "@/layouts/Wrapper";

export const runtime = 'nodejs';

export const metadata = {
  title: "Insight Maskom",
  description: "Artikel dan berita terbaru seputar konektivitas, keamanan jaringan, dan layanan managed service Maskom.",
};
const page = () => {
  return (
    <Wrapper>
      <Blog />
    </Wrapper>
  )
}

export default page