import Breadcrumb from "@/components/common/Breadcrumb"
import HeaderOne from "@/layouts/headers/HeaderOne"
import PricingArea from "./PricingArea"
import FooterTwo from "@/layouts/footers/FooterTwo"
import Process from "@/components/homes/home-one/Process"
import Cta from "@/components/common/Cta"

const Pricing = () => {
   return (
      <div className="ac-page-wrapper">
         <HeaderOne style={true} />
         <div className="smooth-wrapper">
            <div id="smooth-content">
               <Breadcrumb title="Pricing Plan" sub_title="Pricing Plan" />
               <PricingArea />
               <Process />
               <Cta />
            </div>
         </div>
         <FooterTwo />
      </div>
   )
}

export default Pricing
