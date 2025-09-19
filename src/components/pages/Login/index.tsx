import Breadcrumb from "@/components/common/Breadcrumb"
import HeaderOne from "@/layouts/headers/HeaderOne"
import LoginArea from "./LoginArea"
import FooterTwo from "@/layouts/footers/FooterTwo"

const Login = () => {
   return (
      <div className="ac-page-wrapper">
         <HeaderOne style={true} />
         <div className="smooth-wrapper">
            <div id="smooth-content">
               <Breadcrumb title="Login Account" sub_title="Login" />
               <LoginArea />
            </div>
         </div>
         <FooterTwo />
      </div>
   )
}

export default Login
