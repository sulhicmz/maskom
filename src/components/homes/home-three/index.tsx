import Hero from "./Hero"
import Cause from "./Cause"
import Pricing from "./Pricing"
import Avatar from "./Avatar"
import AiVoiceover from "./AiVoiceover"
import WorkArea from "./WorkArea"
import VideoTemplate from "./VideoTemplate"
import Feature from "./Feature"
import Faq from "./Faq"
import FooterTwo from "@/layouts/footers/FooterTwo"
import Brand from "../home-one/Brand"
import HeaderThree from "@/layouts/headers/HeaderThree"

const HomeThree = () => {
   return (
      <div className="home-three">
         <div className="ac-page-wrapper">
            <HeaderThree />
            <div className="smooth-wrapper">
               <div className="smooth-content">
                  <Hero />
                  <Brand />
                  <Cause />
                  <Pricing />
                  <Avatar />
                  <AiVoiceover />
                  <WorkArea />
                  <VideoTemplate />
                  <Feature />
                  <Faq />
               </div>
            </div>
            <FooterTwo />
         </div>
      </div>
   )
}

export default HomeThree
