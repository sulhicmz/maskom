import Image from "next/image";

import feature_img from "@/assets/images/gallery/feature-img.jpg"

interface DataType {
   id: number;
   icon: string;
   title: string;
   desc: string;
}

const feature_list: DataType[] = [
   {
      id: 1,
      icon: "flaticon-communication",
      title: "Write Better Content Faster",
      desc: "Produce upgraded blog entry and articles to get natural traffic - making",
   },
   {
      id: 2,
      icon: "flaticon-google",
      title: "Say Google to the Black Page",
      desc: "Produce upgraded blog entry and articles to get natural traffic - making",
   },
   {
      id: 3,
      icon: "flaticon-communication",
      title: "90+ Tools and Template",
      desc: "Produce upgraded blog entry and articles to get natural traffic - making",
   },
];

const Feature = () => {
   return (
      <section className="features-section pt-120 pb-70">
         <div className="container">
            <div className="row">
               <div className="col-xl-5">
                  <div className="section-content-box mb-50">
                     <div className="section-title mb-50 wow fadeInDown">
                        <span className="sub-title style-one">Awesome Features</span>
                        <h2>The AI Writer&apos;s Tools for <br /> Content Creators</h2>
                     </div>
                     <div className="iconic-info-list">
                        {feature_list.map((item) => (
                           <div key={item.id} className="iconic-info-box style-two mb-30 wow fadeInUp">
                              <div className="icon">
                                 <i className={item.icon}></i>
                              </div>
                              <div className="content">
                                 <h4>{item.title}</h4>
                                 <p>{item.desc}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
               <div className="col-xl-7">
                  <div className="section-image-box style-one mb-50 wow fadeInRight">
                     <Image src={feature_img} alt="features image" />
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Feature
