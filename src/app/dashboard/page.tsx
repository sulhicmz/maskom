import Dashboard from "@/components/dashboard";
import Wrapper from "@/layouts/Wrapper";

export const runtime = 'nodejs';

export const metadata = {
  title: "Dashboard - Maskom",
};

const DashboardPage = () => {
  return (
    <Wrapper>
      <Dashboard />
    </Wrapper>
  );
};

export default DashboardPage;