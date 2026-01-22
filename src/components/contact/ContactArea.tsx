import React from "react";
import Link from "next/link";
import contact_data from "@/data/ContactData";
import AnimationWrapper from "@/components/common/AnimationWrapper"

const ContactArea = React.memo(() => {
   return (
      <section className="contact-info-section pt-40 pb-80">
         <div className="container">
            <div className="row justify-content-center">
                {contact_data.map((item) => (
                   <div key={item.id} className="col-lg-4 col-md-6 col-sm-12">
                      <AnimationWrapper animation="fadeInUp" className="iconic-info-box style-five mb-40" role="article" aria-label={`${item.title} - Informasi kontak`}>
                          <div className="icon">
                             <i className={item.icon} aria-hidden="true"></i>
                          </div>
                         <div className="content">
                            <h5>{item.title}</h5>
                            {item.lines.map((line, idx) => (
                               <p key={idx}>{line}</p>
                            ))}
                            {item.links?.map((link, idx) => (
                               <p key={idx}>
                                  <Link 
                                    href={link.href} 
                                    target={link.target || "_blank"} 
                                    rel={link.rel || "noopener noreferrer"}
                                    aria-label={`${item.title}: ${link.text}${link.target ? " (buka di tab baru)" : ""}`}
                                  >
                                     {link.text}
                                  </Link>
                               </p>
                            ))}
                         </div>
                      </AnimationWrapper>
                   </div>
                ))}
            </div>
         </div>
      </section>
    )
});

ContactArea.displayName = "ContactArea"

export default ContactArea
