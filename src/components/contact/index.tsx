import HeaderOne from "@/layouts/headers/HeaderOne"
import Breadcrumb from "../common/Breadcrumb"
import ContactArea from "./ContactArea"
import ContactFormArea from "./ContactFormArea"
import Cta from "../common/Cta"
import FooterTwo from "@/layouts/footers/FooterTwo"

const Contact = () => {
   return (
      <div className="ac-page-wrapper">
         <HeaderOne style={true} />
         <div className="smooth-wrapper">
            <div id="smooth-content">
               <Breadcrumb title="Get in Touch With Us" sub_title="Contact" />
               <ContactFormArea />
               <ContactArea />
               <Cta />
            </div>
         </div>
         <FooterTwo />
      </div>
   )
}

export default Contact
