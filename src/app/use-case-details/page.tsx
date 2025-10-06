import UseCaseDetails from "@/components/causes/use-cases-details";
import Wrapper from "@/layouts/Wrapper";

export const runtime = 'nodejs';

export const metadata = {
  title: "Solusi Maskom - Detail",
  description: "Pelajari implementasi solusi Maskom secara mendalam untuk menjawab tantangan konektivitas bisnis.",
};
const page = () => {
  return (
    <Wrapper>
      <UseCaseDetails />
    </Wrapper>
  )
}

export default page