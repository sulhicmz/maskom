import HeaderOne from "@/layouts/headers/HeaderOne"
import TeamDetailsArea from "./TeamDetailsArea"
import Breadcrumb from "@/components/common/Breadcrumb"
import Skill from "./Skill"
import FooterTwo from "@/layouts/footers/FooterTwo"

const TeamDetails = () => {
   return (
      <div className="ac-page-wrapper">
         <HeaderOne style={true} />
         <div className="smooth-wrapper">
            <div id="smooth-content">
               <Breadcrumb title="Member Details" sub_title="Member Details" />
               <TeamDetailsArea />
               <Skill />
            </div>
         </div>
         <FooterTwo />
      </div>
   )
}

export default TeamDetails
