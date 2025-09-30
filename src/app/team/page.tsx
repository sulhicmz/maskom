import Team from "@/components/pages/teams/team";
import Wrapper from "@/layouts/Wrapper";

export const metadata = {
  title: "Tim Maskom",
  description: "Kenali para profesional Maskom yang mendukung operasi jaringan dan layanan managed service Anda.",
};
const page = () => {
  return (
    <Wrapper>
      <Team />
    </Wrapper>
  )
}

export default page