"use client"
import Image from "next/image"
import Link from "next/link"
import SocialLinks from "@/components/common/SocialLinks"
import { navigationSections, socialLinks } from "@/data/SocialMediaData"
import { memo } from "react"

import logo_1 from "@/assets/images/logo/main-logo.svg";
import logo_2 from "@/assets/images/logo/secondary-logo.svg";
import logo_3 from "@/assets/images/logo/white-logo.svg";

interface FooterOneProps {
   style: boolean;
   style_2: boolean;
}

const FooterOne = memo(({ style, style_2 }: FooterOneProps) => {
   return (

      <footer className={`${style ? "footer-v2" : "footer-default bg_cover pt-80"}`}>
         <div className="container">
            <div className="footer-widget-area pb-45">
               <div className="row">
                  <div className="col-lg-4">
                     <div className="footer-widget footer_about_widget mb-30 wow fadeInUp">
                        <div className="footer-content">
                           <div className="footer-logo mb-30">
                              <Link href="/"><Image src={style_2 ? logo_3 : style ? logo_2 : logo_1} alt="Maskom - Footer Logo" /></Link>
                           </div>
                           <p>Maskom adalah penyedia layanan konektivitas dan managed service yang membantu perusahaan di Indonesia membangun infrastruktur digital yang aman, stabil, dan mudah dikelola.</p>
                           <SocialLinks links={socialLinks} />
                        </div>
                     </div>
                  </div>
                  <div className="col-lg-5">
                     <div className="footer-widget footer_widget_nav_menu wow fadeInDown">
                        <div className="row">
                           {navigationSections.map((section, index) => (
                              <div key={index} className="col-md-6">
                                 <h4 className="footer-title">{section.title}</h4>
                                 <ul className="mb-30">
                                    {section.items.map((item, itemIndex) => (
                                       <li key={itemIndex}>
                                          <Link href={item.url} target={item.target || '_self'} rel={item.target === '_blank' ? 'noreferrer' : undefined}>
                                             {item.label}
                                          </Link>
                                        </li>
                                    ))}
                                 </ul>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
                   <div className="col-lg-3">
                       <div className="footer-widget footer-newsletter-widget mb-30 wow fadeInUp">
                          <h4 className="footer-title">News & Update</h4>
                          <div className="newsletter-content">
                             <form className="form-group mb-30" onSubmit={(e) => e.preventDefault()}>
                                <label htmlFor="footer_email" className="sr-only">Email address</label>
                                <input
                                   type="email"
                                   id="footer_email"
                                   placeholder="Masukkan email Anda"
                                   name="email"
                                   required
                                   aria-label="Email untuk newsletter"
                                />
                                <button
                                   type="submit"
                                   className={`theme-btn ${style ? "style-one" : "gradient-btn"}`}
                                   aria-label="Subscribe ke newsletter"
                                >
                                   Subscribe
                                </button>
                             </form>
                             <p>Dapatkan kabar terbaru seputar layanan Maskom dan tren infrastruktur digital langsung ke email Anda.</p>
                          </div>
                       </div>
                      </div>
               </div>
            </div>
         </div>
         <div className="copyright-area">
            <div className="container">
               <div className="row">
                  <div className="col-lg-12">
                     <div className="copyright-text text-center">
                        <p>© {new Date().getFullYear()} Maskom Network. All rights reserved.</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </footer>
   )
})

FooterOne.displayName = "FooterOne"

export default FooterOne
