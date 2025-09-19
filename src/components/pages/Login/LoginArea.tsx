import Image from "next/image"
import LoginForm from "@/components/forms/LoginForm"

import login_img1 from "@/assets/images/gallery/robot.png"
import login_img2 from "@/assets/images/gallery/base.png"

const LoginArea = () => {
   return (
      <section className="user-section pt-120 pb-70">
         <div className="container">
            <div className="row align-items-center">
               <div className="col-lg-6">
                  <div className="signup-image-box p-r z-1 mb-50 wow fadeInLeft">
                     <Image src={login_img1} className="image-one" alt="" />
                     <Image src={login_img2} className="image-two" alt="" />
                  </div>
               </div>
               <div className="col-lg-6">
                  <div className="user-wrapper mb-50 wow fadeInRight">
                     <div className="form-title text-center mb-35">
                        <h3>Login to your account</h3>
                     </div>
                     <LoginForm />
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default LoginArea
