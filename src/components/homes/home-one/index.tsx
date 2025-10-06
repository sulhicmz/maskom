import HeaderOne from "@/layouts/headers/HeaderOne"
import Hero from "./Hero"
import Cause from "./Cause"
import Process from "./Process"
import Price from "./Price"
import Feature from "./Feature"
import IntroArea from "./IntroArea"
import Feedback from "./Feedback"
import Faq from "./Faq"
import Cta from "./Cta"
import FooterOne from "@/layouts/footers/FooterOne"
import Brand from "./Brand"

const HomeOne = () => {
   return (
      <div className="home-one">
         <div className="ac-page-wrapper">
            <HeaderOne style={false} />
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
            <FooterOne style={false} style_2={false} />
         </div>
      </div>
   )
}

export default HomeOne
