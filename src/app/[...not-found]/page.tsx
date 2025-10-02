import Wrapper from "@/layouts/Wrapper";
import NotFound from "@/components/pages/error";

export const metadata = {
   title: "404 Tidak Ditemukan - Maskom Network - Layanan Konektivitas dan Managed Service",
};

const page = () => {
  return (
    <Wrapper>
      <NotFound />
    </Wrapper>
  )
}

export default page;
