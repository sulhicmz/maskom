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
               <Breadcrumb title="Studi Kasus Maskom" sub_title="Solusi" />
               <UseCaseDetailsArea />
               <Cta />
            </div>
         </div>
         <FooterTwo />
      </div>
   )
}

export default UseCaseDetails
