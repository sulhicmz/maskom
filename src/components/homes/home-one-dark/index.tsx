import HeaderOne from "@/layouts/headers/HeaderOne"
import FooterOne from "@/layouts/footers/FooterOne"
import Hero from "../home-one/Hero"
import Brand from "./Brand"
import Cause from "../home-one/Cause"
import dynamic from "next/dynamic"

const Process = dynamic(() => import("../home-one/Process"), {
   loading: () => <div className="skeleton-loader"></div>
})
const Price = dynamic(() => import("../home-one/Price"), {
   loading: () => <div className="skeleton-loader"></div>
})
const Feature = dynamic(() => import("../home-one/Feature"), {
   loading: () => <div className="skeleton-loader"></div>
})
const IntroArea = dynamic(() => import("../home-one/IntroArea"), {
   loading: () => <div className="skeleton-loader"></div>
})
const Feedback = dynamic(() => import("../home-one/Feedback"), {
   loading: () => <div className="skeleton-loader"></div>
})
const Faq = dynamic(() => import("../home-one/Faq"), {
   loading: () => <div className="skeleton-loader"></div>
})
const Cta = dynamic(() => import("../home-one/Cta"), {
   loading: () => <div className="skeleton-loader"></div>
})

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
