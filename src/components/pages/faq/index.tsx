import { PageBuilderWithSections } from '@/components/common/PageBuilder';
import FaqArea from "./FaqArea";
import Cta from "./Cta";
import FaqHome from "@/components/homes/home-one/Faq";

const Faq = () => {
  return (
    <PageBuilderWithSections
      title="Pertanyaan Umum Maskom"
      subTitle="FAQ"
      sections={[
        <FaqArea key="faq-area" />,
        <Cta key="cta" />,
        <FaqHome key="faq-home" />
      ]}
    />
  );
};

export default Faq;
