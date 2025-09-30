"use client"
import Image from "next/image"
import Link from "next/link"

import logo_1 from "@/assets/images/logo/main-logo.png"
import logo_2 from "@/assets/images/logo/secondary-logo.png"
import logo_3 from "@/assets/images/logo/white-logo.png"

interface ProfType {
   style: boolean;
   style_2: boolean;
}

const FooterOne = ({ style, style_2 }: ProfType) => {
   return (

      <footer className={`${style ? "footer-v2" : "footer-default bg_cover pt-80"}`}>
         <div className="container">
            <div className="footer-widget-area pb-45">
               <div className="row">
                  <div className="col-lg-4">
                     <div className="footer-widget footer_about_widget mb-30 wow fadeInUp">
                        <div className="footer-content">
                           <div className="footer-logo mb-30">
                              <Link href="/"><Image src={style_2 ? logo_3 : style ? logo_2 : logo_1} alt="Footer Logo" /></Link>
                           </div>
                           <p>Maskom adalah penyedia layanan konektivitas dan managed service yang membantu perusahaan di Indonesia membangun infrastruktur digital yang aman, stabil, dan mudah dikelola.</p>
                           <ul className="social-link">
                              <li><Link href="https://www.instagram.com/maskomnetwork" target="_blank" rel="noreferrer"><i className="fab fa-instagram"></i></Link></li>
                              <li><Link href="https://www.linkedin.com/company/maskom-network" target="_blank" rel="noreferrer"><i className="fab fa-linkedin-in"></i></Link></li>
                              <li><Link href="mailto:sales@maskom.co.id"><i className="far fa-envelope"></i></Link></li>
                              <li><Link href="tel:+622129212888"><i className="fas fa-phone-alt"></i></Link></li>
                           </ul>
                        </div>
                     </div>
                  </div>
                  <div className="col-lg-5">
                     <div className="footer-widget footer_widget_nav_menu wow fadeInDown">
                        <div className="row">
                           <div className="col-md-6">
                              <h4 className="footer-title">Navigasi</h4>
                              <ul className="mb-30">
                                 <li><Link href="/#solusi">Solusi</Link></li>
                                 <li><Link href="/#pendekatan">Pendekatan</Link></li>
                                 <li><Link href="/#paket">Harga</Link></li>
                                 <li><Link href="/#testimoni">Testimoni</Link></li>
                                 <li><Link href="/contact">Hubungi Kami</Link></li>
                              </ul>
                           </div>
                           <div className="col-md-6">
                              <h4 className="footer-title">Perusahaan</h4>
                              <ul className="mb-30">
                                 <li><Link href="/about">Tentang Maskom</Link></li>
                                 <li><Link href="/faq">FAQ</Link></li>
                                 <li><Link href="/login">Portal Pelanggan</Link></li>
                                 <li><Link href="/sign-up">Daftar Layanan</Link></li>
                                 <li><Link href="https://maskom.co.id/privacy-policy/" target="_blank" rel="noreferrer">Kebijakan Privasi</Link></li>
                              </ul>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="col-lg-3">
                       <div className="footer-widget footer-newsletter-widget mb-30 wow fadeInUp">
                          <h4 className="footer-title">Berita & Update</h4>
                          <div className="newsletter-content">
                             <form onSubmit={(e) => e.preventDefault()}>
                                <div className="form-group mb-30">
                                   <input type="email" placeholder="Masukkan email Anda" name="email" required />
                                   <button className={`theme-btn ${style ? "style-one" : "gradient-btn"}`}>Berlangganan</button>
                              </div>
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
}

export default FooterOne
