import Image from "next/image"
import Link from "next/link"

import thumb from "@/assets/images/team/team-single-1.jpg"

const TeamDetailsArea = () => {
   return (
      <section className="team-details-section pt-120 pb-70">
         <div className="container">
            <div className="team-details-wrapper">
               <div className="row align-items-center">
                  <div className="col-xl-5">
                     <div className="member-image mb-50 wow fadeInLeft">
                        <Image src={thumb} alt="Team Image" />
                     </div>
                  </div>
                  <div className="col-xl-7">
                     <div className="member-info mb-50 wow fadeInRight">
                        <h4>Robie B Monik</h4>
                        <span className="position">CO-FOUNDER, CEO</span>
                        <p>Sed ut perspiciatis unde omnis iste natus errorsit voluptatem
                           accusantiudoloremqlaudantium totae rem aperiam, eaque ipsa quae abillo
                           inventore veritatis etquas a handful of model sentence structures, to
                           generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is
                           therefore always free from repetition, injected humour, or
                           non-characteristic words etc Aenean at libero placerat, accumsan libero ut,
                           posuere sapien. Mauris ipsum nulla, aliquet vligula eu, semper semper metus.
                           Pellentesque hendrerit</p>
                        <p>The generated Lorem Ipsum is therefore always free from repetition, injected
                           humo haracteristic words etc Aenean at libero placerat, accumsan libero ut,
                           posuere sapien. Mauris ipsum nulla, aliquet vligula eu, semper semper metus.
                           Pellentesque hendrerit placerat, accumsan libero ut, posuere sapien. Mauris
                           ipsum nulla, aliquet vligula eu, semper semper metus. Pellentesque hendrerit
                           placerat.</p>
                        <ul className="social-link">
                           <li><Link href="#"><i className="fab fa-facebook-f"></i></Link></li>
                           <li><Link href="#"><i className="fab fa-twitter"></i></Link></li>
                           <li><Link href="#"><i className="fab fa-linkedin-in"></i></Link></li>
                           <li><Link href="#"><i className="fab fa-instagram"></i></Link></li>
                        </ul>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default TeamDetailsArea
