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
               <h3 className="mb-30">Langkah implementasi Maskom</h3>
               <div className="iconic-number-box style-two mb-30">
                  <div className="number">01</div>
                  <div className="content">
                     <h5>Survey & assesment multi-gerai</h5>
                     <p>Tim solution architect memetakan infrastruktur eksisting, kapasitas jaringan, dan kebutuhan aplikasi di lebih dari 120 lokasi ritel.</p>
                  </div>
               </div>
               <div className="iconic-number-box style-two mb-30">
                  <div className="number">02</div>
                  <div className="content">
                     <h5>Desain arsitektur & pilot</h5>
                     <p>Kami membuat blueprint konektivitas fiber dan radio, menyiapkan konfigurasi SD-WAN, serta melakukan pilot project pada 5 lokasi untuk validasi QoS.</p>
                  </div>
               </div>
               <div className="iconic-number-box style-two mb-30">
                  <div className="number">03</div>
                  <div className="content">
                     <h5>Operasi & continuous improvement</h5>
                     <p>Network Operation Center memonitor SLA, menangani insiden, dan memberikan rekomendasi optimasi berdasarkan dashboard performa yang disepakati.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default WorkArea
