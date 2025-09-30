import Wrapper from "@/layouts/Wrapper";
import NotFound from "@/components/pages/error";

export const metadata = {
  title: "Maskom | Halaman Tidak Ditemukan",
  description: "Halaman Maskom tidak dapat ditemukan. Gunakan navigasi untuk kembali ke beranda atau hubungi kami untuk bantuan.",
};

const page = () => {
  return (
    <Wrapper>
      <NotFound />
    </Wrapper>
  )
}

export default page;
