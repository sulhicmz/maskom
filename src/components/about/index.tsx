import HeaderOne from "@/layouts/headers/HeaderOne"
import Breadcrumb from "../common/Breadcrumb"
import AboutArea from "./AboutArea"
import Feature from "./Feature"
import Process from "../homes/home-one/Process"
import Feedback from "../homes/home-one/Feedback"
import Faq from "../homes/home-one/Faq"
import FooterTwo from "@/layouts/footers/FooterTwo"
import Cta from "../common/Cta"

const About = () => {
   return (
      <div className="ac-page-wrapper">
         <HeaderOne style={true} />
         <div className="smooth-wrapper">
            <div id="smooth-content">
               <Breadcrumb title="Tentang Maskom" sub_title="Tentang" />
               <AboutArea />
               <Feature />
               <Process />
               <Feedback />
               <Faq />
               <Cta />
            </div>
         </div>
         <FooterTwo />
      </div>
   )
}

export default About
