import Breadcrumb from "@/components/common/Breadcrumb"
import HeaderOne from "@/layouts/headers/HeaderOne"
import FaqArea from "./FaqArea"
import FooterTwo from "@/layouts/footers/FooterTwo"
import Cta from "./Cta"
import FaqHome from "@/components/homes/home-one/Faq"

const Faq = () => {
   return (
      <div className="ac-page-wrapper">
         <HeaderOne style={true} />
         <div className="smooth-wrapper">
            <div id="smooth-content">
               <Breadcrumb title="Pertanyaan Umum Maskom" sub_title="FAQ" />
               <FaqArea />
               <Cta />
               <FaqHome />
            </div>
         </div>
         <FooterTwo />
      </div>
   )
}

export default Faq
