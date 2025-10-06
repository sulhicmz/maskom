import UseCases from "@/components/causes/use-cases";
import Wrapper from "@/layouts/Wrapper";

export const runtime = 'nodejs';

export const metadata = {
  title: "Solusi Maskom",
  description: "Lihat rangkaian solusi konektivitas dan managed service Maskom untuk berbagai sektor industri.",
};
const page = () => {
  return (
    <Wrapper>
      <UseCases />
    </Wrapper>
  )
}

export default page