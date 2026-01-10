import PageLayout from "@/components/common/PageLayout"
import FaqArea from "./FaqArea"
import Cta from "./Cta"
import FaqHome from "@/components/homes/home-one/Faq"

const Faq = () => {
   return (
      <PageLayout breadcrumbTitle="Pertanyaan Umum Maskom" breadcrumbSubTitle="FAQ">
         <FaqArea />
         <Cta />
         <FaqHome />
      </PageLayout>
   )
}

export default Faq
