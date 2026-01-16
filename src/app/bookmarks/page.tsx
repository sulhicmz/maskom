import Bookmarks from "@/components/bookmarks";
import Wrapper from "@/layouts/Wrapper";

export const runtime = 'nodejs';

export const metadata = {
  title: "My Bookmarks - Maskom",
  description: "View your saved blog posts and bookmarks.",
};

const page = () => {
  return (
    <Wrapper>
      <Bookmarks />
    </Wrapper>
  )
}

export default page
