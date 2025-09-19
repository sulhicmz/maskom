import Breadcrumb from "@/components/common/Breadcrumb"
import HeaderOne from "@/layouts/headers/HeaderOne"
import UseCaseDetailsArea from "./UseCaseDetailsArea"
import Cta from "@/components/common/Cta"
import FooterTwo from "@/layouts/footers/FooterTwo"

const UseCaseDetails = () => {
   return (
      <div className="ac-page-wrapper">
         <HeaderOne style={true} />
         <div className="smooth-wrapper">
            <div id="smooth-content">
               <Breadcrumb title="Use Case Details" sub_title="Use Case Details" />
               <UseCaseDetailsArea />
               <Cta />
            </div>
         </div>
         <FooterTwo />
      </div>
   )
}

export default UseCaseDetails
