import Image from "next/image"
import SignUpForm from "@/components/forms/SignUpForm"

import login_img1 from "@/assets/images/gallery/robot.png"
import login_img2 from "@/assets/images/gallery/base.png"

const SignUpArea = () => {
   return (
      <section className="user-section pt-120 pb-70">
         <div className="container">
            <div className="row align-items-center">
               <div className="col-xl-6">
                  <div className="signup-image-box p-r z-1 mb-50 wow fadeInLeft">
                     <Image src={login_img1} className="image-one" alt="" />
                     <Image src={login_img2} className="image-two" alt="" />
                  </div>
               </div>
               <div className="col-xl-6">
                  <div className="user-wrapper mb-50 wow fadeInRight">
                     <div className="form-title mb-35">
                        <h3>Buat akun layanan Maskom</h3>
                     </div>
                     <SignUpForm />
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default SignUpArea
