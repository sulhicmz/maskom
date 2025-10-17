import HeaderOne from "@/layouts/headers/HeaderOne"
import Feedback from "@/components/homes/home-one/Feedback"
import Faq from "@/components/homes/home-one/Faq"
import Breadcrumb from "@/components/common/Breadcrumb"
import Cause from "@/components/homes/home-one/Cause"
import FooterTwo from "@/layouts/footers/FooterTwo"
import Cta from "@/components/common/Cta"

const UseCases = () => {
   return (
      <div className="ac-page-wrapper">
         <HeaderOne style={true} />
         <div className="smooth-wrapper">
            <div id="smooth-content">
               <Breadcrumb title="Use Causes" sub_title="Use Causes" />
               <Cause />
               <Feedback />
               <Faq />
               <Cta />
            </div>
         </div>
         <FooterTwo />
      </div>
   )
}

export default UseCases
