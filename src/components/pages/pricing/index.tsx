import { PageBuilderWithSections } from '@/components/common/PageBuilder';
import PricingArea from "./PricingArea";
import Process from "@/components/homes/home-one/Process";
import Cta from "@/components/common/Cta";

const Pricing = () => {
  return (
    <PageBuilderWithSections
      title="Paket Layanan Maskom"
      subTitle="Harga"
      headerStyle={true}
      sections={[
        <PricingArea key="pricing" />,
        <Process key="process" />,
        <Cta key="cta" />
      ]}
    />
  );
};

export default Pricing;
