import SignUp from "@/components/pages/sign-up";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "Registrasi Layanan Maskom",
  description: "Daftarkan perusahaan Anda untuk mendapatkan layanan konektivitas dan managed service Maskom.",
};
const page = () => {
  return (
    <Wrapper>
      <SignUp />
    </Wrapper>
  )
}

export default page