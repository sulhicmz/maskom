import Image from "next/image"
import UseCaseDetailsSidebar from "./UseCaseDetailsSidebar"
import WorkArea from "./WorkArea"

import cause_thumb_1 from "@/assets/images/case/case-1.jpg"
import cause_thumb_2 from "@/assets/images/case/case-6.jpg"

const UseCaseDetailsArea = () => {
   return (
      <section className="usecase-details-section pt-120 pb-190">
         <div className="container">
            <div className="row">
               <UseCaseDetailsSidebar />
               <div className="col-lg-8">
                  <div className="case-details-wrapper mb-50">
                     <div className="usecase-wrapper">
                        <div className="post-thumbnail mb-30 wow fadeInDown">
                           <Image src={cause_thumb_1} alt="Case Image" />
                        </div>
                        <div className="post-content wow fadeInUp">
                           <h3 className="mb-25">Content Writing for Blog Post & Articles</h3>
                           <p>Scuba drive are made out of photovoltaic cells that convert the sun’s
                              energy into elect Photovoltaic cells are sandwiched between layers of
                              semi-conducting materials such as silicon. Each layer has different
                              electronic properties that energise. Forttitor auctor dapibus. Mauris
                              tempor tortor non consectetur luctus. Ut sit amet porta metus. Cras a
                              mivel odio mollis maximus non at nibhprofessor at Hampden-Sydney College
                              in Virginia, looked up one of the more obscure Latin words, consectetur
                              It is a long established fact that a reader will be distracted by the
                              readable content of a page when looking at its layout. </p>
                           <p>Each layer has different electronic properties that energise. Forttitor
                              auctor dapibus. Mauris tempor tortor non consectetur luctus. Ut sit amet
                              porta metus. Cras a mivel odio mollis maximus non at nibhprofessor at
                              Hampden-Sydney College in Virginia, looked up one of the. </p>
                           <WorkArea />
                           <h4>Core Benefits of Blog Post & Articles</h4>
                           <p>One touch of a red-hot stove is usually all we need to avoid that kind of
                              discomfort in quis elit future. The same Duis aute irure dolor in
                              reprehenderit .</p>
                           <div className="row">
                              <div className="col-lg-6">
                                 <ul className="check-list style-one mb-25">
                                    <li><i className="flaticon-check"></i>Facebook Post</li>
                                    <li><i className="flaticon-check"></i>Youtube Descriptions</li>
                                    <li><i className="flaticon-check"></i>Pinterest Descriptions</li>
                                 </ul>
                              </div>
                              <div className="col-lg-6">
                                 <ul className="check-list style-one mb-25">
                                    <li><i className="flaticon-check"></i>Image Captions</li>
                                    <li><i className="flaticon-check"></i>Linkedin Posts</li>
                                    <li><i className="flaticon-check"></i>Tiktok Scripts</li>
                                 </ul>
                              </div>
                           </div>
                           <p>Each layer has different electronic properties that energise. Forttitor
                              auctor dapibus. Mauris tempor tortor non consectetur luctus. Ut sit amet
                              porta metus. Cras a mivel odio mollis maximus non at nibhprofessor at
                              Hampden</p>
                           <figure className="mb-35"><Image src={cause_thumb_2} alt="case image" /></figure>
                           <p>Each layer has different electronic properties that energise. Forttitor
                              auctor dapibus. Mauris tempor tortor non consectetur luctus. Ut sit amet
                              porta metus. Cras a mivel odio mollis maximus non at nibhprofessor at
                              Hampden-Sydney College in Virginia, looked up one of the more obscure
                              Latin words, consectetur It is a long established fact that a reader
                              will be distracted by the readable content of a page when looking at its
                              layout. </p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default UseCaseDetailsArea
