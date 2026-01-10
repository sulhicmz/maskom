"use client"
import Image from "next/image"
import Link from "next/link"
import SocialLinks from "@/components/common/SocialLinks"
import { navigationSections, socialLinks } from "@/data/SocialMediaData"

import logo from "@/assets/images/logo/blue-logo.png"

const FooterTwo = () => {
   return (
      <footer className="footer-v3 bg_cover pt-80" style={{ backgroundImage: `url(/assets/images/bg/pattern-bg.jpg)` }}>
         <div className="container">
            <div className="footer-widget-area pb-45">
               <div className="row">
                  <div className="col-lg-4">
                     <div className="footer-widget footer_about_widget mb-30 wow fadeInUp">
                        <div className="footer-content">
                           <div className="footer-logo mb-30">
                              <Link href="/"><Image src={logo} alt="Footer Logo" /></Link>
                           </div>
                           <p>Maskom mendukung transformasi digital dengan layanan konektivitas, keamanan jaringan, dan managed service yang andal untuk berbagai sektor industri.</p>
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
                            <form onSubmit={(e) => e.preventDefault()}>
                               <div className="form-group mb-30">
                                  <input type="email" placeholder="enter your email" name="email" required />
                                  <button className="theme-btn style-one">Subscribe</button>
                               </div>
                            </form>
                            <p>Dapatkan insight terkini dari Maskom mengenai teknologi jaringan dan praktik terbaik pengelolaan infrastruktur.</p>
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
}

export default FooterTwo
