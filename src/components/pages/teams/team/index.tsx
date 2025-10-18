import Breadcrumb from "@/components/common/Breadcrumb"
import HeaderOne from "@/layouts/headers/HeaderOne"
import TeamArea from "./TeamArea"
import FooterTwo from "@/layouts/footers/FooterTwo"

const Team = () => {
   return (
      <div className="ac-page-wrapper">
         <HeaderOne style={true} />
         <div className="smooth-wrapper">
            <div id="smooth-content">
               <Breadcrumb title="Expert Team Member" sub_title="Team Member" />
               <TeamArea />
            </div>
         </div>
         <FooterTwo />
      </div>
   )
}

export default Team
