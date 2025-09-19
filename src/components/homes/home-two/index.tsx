"use client"
import FooterOne from "@/layouts/footers/FooterOne"
import Hero from "./Hero"
import HowToWork from "./HowToWork"
import TextToImage from "./TextToImage"
import dynamic from "next/dynamic"
import Pricing from "./Pricing"
import Customization from "./Customization"
import Faq from "./Faq"
import Blog from "./Blog"
import Cta from "./Cta"
import HeaderTwo from "@/layouts/headers/HeaderTwo"
import Brand from "./Brand"
import Testimonial from "./Testimonial"

const Gallery = dynamic(() => import("./Gallery"), { ssr: false });

const HomeTwo = () => {
   return (
      <div className="home-two">
         <div className="ac-page-wrapper">
            <HeaderTwo />
            <div className="smooth-wrapper">
               <div id="smooth-content">
                  <Hero />
                  <Brand />
                  <HowToWork />
                  <TextToImage />
                  <Gallery />
                  <Pricing />
                  <Customization />
                  <Testimonial />
                  <Faq />
                  <Blog />
                  <Cta />
               </div>
            </div>
            <FooterOne style={true} style_2={false} />
         </div>
      </div>
   )
}

export default HomeTwo
