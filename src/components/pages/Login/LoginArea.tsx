import Image from "next/image"
import dynamic from "next/dynamic"
const LoginForm = dynamic(() => import("@/components/forms/LoginForm"), {
   loading: () => <div className="text-center py-5">Memuat formulir masuk...</div>
})

import login_img1 from "@/assets/images/gallery/robot.webp"
import login_img2 from "@/assets/images/gallery/base.png"
import AnimationWrapper from "@/components/common/AnimationWrapper"

const LoginArea = () => {
   return (
      <section className="user-section pt-120 pb-70">
         <div className="container">
            <div className="row align-items-center">
               <div className="col-lg-6">
                   <AnimationWrapper animation="fadeInLeft" className="signup-image-box p-r z-1 mb-50">
                      <Image src={login_img1} className="image-one" alt="Ilustrasi robot layanan digital Maskom" />
                      <Image src={login_img2} className="image-two" alt="Base ilustrasi platform digital" />
                   </AnimationWrapper>
               </div>
               <div className="col-lg-6">
                  <AnimationWrapper animation="fadeInRight" className="user-wrapper mb-50">
                     <div className="form-title text-center mb-35">
                        <h3>Masuk ke portal pelanggan</h3>
                     </div>
                     <LoginForm />
                  </AnimationWrapper>
               </div>
            </div>
         </div>
      </section>
   )
}

export default LoginArea
