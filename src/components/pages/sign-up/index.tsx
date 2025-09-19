import Breadcrumb from "@/components/common/Breadcrumb"
import HeaderOne from "@/layouts/headers/HeaderOne"
import LoginArea from "../Login/LoginArea"
import FooterTwo from "@/layouts/footers/FooterTwo"

const SignUp = () => {
   return (
      <div className="ac-page-wrapper">
         <HeaderOne style={true} />
         <div className="smooth-wrapper">
            <div id="smooth-content">
               <Breadcrumb title="Create Account" sub_title="Sign Up" />
               <LoginArea />
            </div>
         </div>
         <FooterTwo />
      </div>
   )
}

export default SignUp
