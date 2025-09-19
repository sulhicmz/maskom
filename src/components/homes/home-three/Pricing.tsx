import icon from "@/assets/images/icon/sub2_2.svg"
import Image from "next/image"
import Link from "next/link";

interface DataType {
   id: number;
   sub_title: string;
   price: number;
   btn: string;
   feature: string[];
}

const price_data: DataType[] = [
   {
      id: 1,
      sub_title: "Personal",
      price: 0,
      btn: "Start Free Trial",
      feature: ["Upload images, Video", "AI Screen Assistant", "10+ Languages", "10 Scenes Per Video", "120 minutes of Video"],
   },
   {
      id: 2,
      sub_title: "Enterprise",
      price: 59,
      btn: "Start Free Trial",
      feature: ["Upload images, Video", "AI Screen Assistant", "10+ Languages", "10 Scenes Per Video", "120 minutes of Video"],
   },
   {
      id: 3,
      sub_title: "Diamond Plan",
      price: 78,
      btn: "Start Free Trial",
      feature: ["Upload images, Video", "AI Screen Assistant", "10+ Languages", "10 Scenes Per Video", "120 minutes of Video"],
   },
   {
      id: 4,
      sub_title: "Premium Plan",
      price: 95,
      btn: "Start Free Trial",
      feature: ["Upload images, Video", "AI Screen Assistant", "10+ Languages", "10 Scenes Per Video", "120 minutes of Video"],
   },
];

const Pricing = () => {
   return (
      <section className="pricing-section">
         <div className="pricing-bg-wrapper bg_cover pt-125 pb-80"
            style={{ backgroundImage: "url(/assets/images/bg/pricing-bg-1.jpg)" }}>
            <div className="container">
               <div className="row">
                  <div className="col-lg-12">
                     <div className="section-title text-center text-white mb-50 wow fadeInDown">
                        <span className="sub-title"><span><Image src={icon}
                           alt="icon" /></span> Pricing Plan <span><Image
                              src={icon} alt="icon" /></span></span>
                        <h2>Best Pricing Create Videos at Scale</h2>
                        <p>In a few seconds, our A.I. will generate amazing results that <br /> you can
                           copy, paste & publish. , write creatively</p>
                     </div>
                  </div>
               </div>
               <div className="row">
                  {price_data.map((item) => (
                     <div key={item.id} className="col-xl-3 col-md-6 col-sm-12">
                        <div className="pricing-item style-two mb-40 wow fadeInUp">
                           <div className="pricing-head text-center">
                              <span className="package">{item.sub_title}</span>
                              <h3><span className="currency">$</span>{item.price}.00</h3>
                           </div>
                           <div className="pricing-body">
                              <ul className="check-list style-one">
                                 {item.feature.map((list, i) => (
                                    <li key={i}><i className="flaticon-check"></i>{list}</li>
                                 ))}
                              </ul>
                              <div className="pricing-button text-center mt-35">
                                 <Link href="/" className="theme-btn style-two">Start Free Trial</Link>
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>
   )
}

export default Pricing
