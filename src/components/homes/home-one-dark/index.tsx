import HeaderOne from "@/layouts/headers/HeaderOne"
import FooterOne from "@/layouts/footers/FooterOne"
import Hero from "../home-one/Hero"
import Brand from "./Brand"
import Cta from "../home-one/Cta"
import Faq from "../home-one/Faq"
import Feedback from "../home-one/Feedback"
import IntroArea from "../home-one/IntroArea"
import Feature from "../home-one/Feature"
import Price from "../home-one/Price"
import Process from "../home-one/Process"
import Cause from "../home-one/Cause"

const HomeOneDark = () => {
   return (
      <div className="home-one-dark">
         <div className="ac-page-wrapper">
            <HeaderOne style={true} />
            <div className="smooth-wrapper">
               <div id="smooth-content">
                  <Hero />
                  <Brand />
                  <Cause />
                  <Process />
                  <Price />
                  <Feature />
                  <IntroArea />
                  <Feedback />
                  <Faq />
                  <Cta />
               </div>
            </div>
            <FooterOne style={false} style_2={true} />
         </div>
      </div>
   )
}

export default HomeOneDark