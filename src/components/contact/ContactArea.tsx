import Link from "next/link";
import { JSX } from "react";

interface DataType {
   id: number;
   icon: string;
   title: string;
   info: JSX.Element;
}

const contact_data: DataType[] = [
   {
      id: 1,
      icon: "fas fa-map-marker-alt",
      title: "Kantor Pusat",
      info: (
         <>
            <p>Graha Maskom Network</p>
            <p>Jl. Gatot Subroto No. 45</p>
            <p>Jakarta Selatan 12950</p>
         </>
      ),
   },
   {
      id: 2,
      icon: "far fa-envelope-open",
      title: "Email",
      info: (<>
         <p><Link href="mailto:sales@maskom.co.id">sales@maskom.co.id</Link></p>
         <p><Link href="mailto:support@maskom.co.id">support@maskom.co.id</Link></p>
      </>),
   },
   {
      id: 3,
      icon: "fas fa-phone-alt",
      title: "Telepon",
      info: (<><p><Link href="tel:+628170006625">(+62) 817-000-6625</Link></p>
         <p><Link href="https://wa.me/628170006625" target="_blank" rel="noreferrer">WhatsApp Business</Link></p></>),
   },
];

const ContactArea = () => {
   return (
      <section className="contact-info-section pt-40 pb-80">
         <div className="container">
            <div className="row justify-content-center">
               {contact_data.map((item) => (
                  <div key={item.id} className="col-lg-4 col-md-6 col-sm-12">
                     <div className="iconic-info-box style-five mb-40 wow fadeInUp">
                        <div className="icon">
                           <i className={item.icon}></i>
                        </div>
                        <div className="content">
                           <h5>{item.title}</h5>
                           {item.info}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
   )
}

export default ContactArea
