import Pricing from "@/components/pages/pricing";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "Harga Layanan Maskom",
  description: "Detail paket konektivitas dan managed service Maskom untuk berbagai kebutuhan bisnis.",
};
const page = () => {
  return (
    <Wrapper>
      <Pricing />
    </Wrapper>
  )
}

export default page