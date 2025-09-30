import Breadcrumb from "@/components/common/Breadcrumb"
import HeaderOne from "@/layouts/headers/HeaderOne"
import SignUpArea from "./SignUpArea"
import FooterTwo from "@/layouts/footers/FooterTwo"

const SignUp = () => {
   return (
      <div className="ac-page-wrapper">
         <HeaderOne style={true} />
         <div className="smooth-wrapper">
            <div id="smooth-content">
               <Breadcrumb title="Buat Akun Maskom" sub_title="Registrasi" />
               <SignUpArea />
            </div>
         </div>
         <FooterTwo />
      </div>
   )
}

export default SignUp
