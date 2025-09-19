import Image from 'next/image'

import thumb_1 from "@/assets/images/case/case-2.jpg"
import thumb_2 from "@/assets/images/case/case-3.jpg"
import thumb_3 from "@/assets/images/case/case-4.jpg"
import thumb_4 from "@/assets/images/case/case-5.jpg"

const WorkArea = () => {
   return (
      <div className="row">
         <div className="col-xl-6">
            <div className="row">
               <div className="col-lg-6">
                  <figure>
                     <Image src={thumb_1} alt="case image" />
                  </figure>
               </div>
               <div className="col-lg-6">
                  <figure>
                     <Image src={thumb_2} alt="case image" />
                  </figure>
                  <figure>
                     <Image src={thumb_3} alt="case image" />
                  </figure>
               </div>
               <div className="col-lg-12">
                  <figure>
                     <Image src={thumb_4} alt="case image" />
                  </figure>
               </div>
            </div>
         </div>
         <div className="col-xl-6">
            <div className="content-box">
               <h3 className="mb-30">How To Work Content Writing</h3>
               <div className="iconic-number-box style-two mb-30">
                  <div className="number">
                     01
                  </div>
                  <div className="content">
                     <h5>Select Writhing Template</h5>
                     <p>Templates are pre-designed, that can guide the
                        organization and layout of your writing, whether
                     </p>
                  </div>
               </div>
               <div className="iconic-number-box style-two mb-30">
                  <div className="number">
                     02
                  </div>
                  <div className="content">
                     <h5>Select Writhing Template</h5>
                     <p>Describe Your Topic&quot; is a prompt or instruction often
                        used to request a written explanation.</p>
                  </div>
               </div>
               <div className="iconic-number-box style-two mb-30">
                  <div className="number">
                     03
                  </div>
                  <div className="content">
                     <h5>Generate Quality Content</h5>
                     <p>Generating quality content is a crucial skill in
                        various fields, including journalism, blogging</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default WorkArea
