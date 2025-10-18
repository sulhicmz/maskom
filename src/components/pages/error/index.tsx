import Breadcrumb from "@/components/common/Breadcrumb"
import HeaderOne from "@/layouts/headers/HeaderOne"
import NotFoundArea from "./NotFoundArea"
import FooterTwo from "@/layouts/footers/FooterTwo"

const NotFound = () => {
   return (
      <div className="ac-page-wrapper">
         <HeaderOne style={true} />
         <div className="smooth-wrapper">
            <div id="smooth-content">
               <Breadcrumb title="Page Not Found" sub_title="404" />
               <NotFoundArea />
            </div>
         </div>
         <FooterTwo />
      </div>
   )
}

export default NotFound
