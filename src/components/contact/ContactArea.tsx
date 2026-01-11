import Link from "next/link";
import contact_data from "@/data/ContactData";

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
                           {item.lines.map((line, idx) => (
                              <p key={idx}>{line}</p>
                           ))}
                           {item.links?.map((link, idx) => (
                              <p key={idx}>
                                 <Link href={link.href} {...(link.target && { target: link.target })} {...(link.rel && { rel: link.rel })}>
                                    {link.text}
                                 </Link>
                              </p>
                           ))}
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
