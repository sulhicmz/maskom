import TeamDetails from "@/components/pages/teams/team-details";
import Wrapper from "@/layouts/Wrapper";

export const runtime = 'nodejs';

export const metadata = {
  title: "Profil Tim Maskom",
  description: "Informasi lengkap mengenai pakar infrastruktur Maskom yang mendukung kesuksesan proyek Anda.",
};
const page = () => {
  return (
    <Wrapper>
      <TeamDetails />
    </Wrapper>
  )
}

export default page