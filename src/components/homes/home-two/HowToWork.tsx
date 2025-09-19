import Image from "next/image"

import work_1 from "@/assets/images/gallery/work-3.jpg"
import icon from "@/assets/images/icon/sub-icon.png"

interface DataType {
   id: number;
   count: string;
   title: string;
   desc: string;
}

const work_data: DataType[] = [
   {
      id: 1,
      count: "01",
      title: "Type Your Text",
      desc: "Type your text prompts of the image you want in our AI photo generator box directly."
   },
   {
      id: 2,
      count: "02",
      title: "Choose The Aspect",
      desc: "Choose the aspect ratio, choose one of image style such as 3D, oil painting and cartoon."
   },
   {
      id: 3,
      count: "03",
      title: "Customize Image",
      desc: "Customizing AI images, you can click the button 'Edit' to add some text, filter, and other stickers from our editor"
   },
   {
      id: 4,
      count: "04",
      title: "Download Image",
      desc: "Download AI pictures and share your prefect AI-generated photos directly."
   },
];

const HowToWork = () => {
   return (
      <section className="how-to-work-section pt-155 pb-70">
         <div className="container">
            <div className="row align-items-center">
               <div className="col-xl-6">
                  <div className="work-one_image-box mb-50 wow fadeInLeft">
                     <div className="work-image">
                        <Image src={work_1} alt="work image" />
                     </div>
                  </div>
               </div>
               <div className="col-xl-6">
                  <div className="section-content-box mb-50">
                     <div className="section-title mb-60 wow fadeInDown">
                        <span className="sub-title"><Image src={icon} alt="icon" />
                           Working Process</span>
                        <h2>How to Generate AI <br />
                           Images</h2>
                     </div>
                     {work_data.map((item) => (
                        <div key={item.id} className="iconic-number-box style-one mb-30 wow fadeInUp">
                           <div className="number">{item.count}</div>
                           <div className="content">
                              <h6>{item.title}</h6>
                              <p>{item.desc}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default HowToWork
