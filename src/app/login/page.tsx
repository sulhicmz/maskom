import Login from "@/components/pages/Login";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "Portal Pelanggan Maskom",
  description: "Masuk ke portal pelanggan Maskom untuk memantau layanan dan tiket dukungan.",
};
const page = () => {
  return (
    <Wrapper>
      <Login />
    </Wrapper>
  )
}

export default page