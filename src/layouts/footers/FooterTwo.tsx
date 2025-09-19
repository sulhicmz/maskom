"use client"
import Image from "next/image"
import Link from "next/link"

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
                           <p>Automatically generate blog articles, website copy, landing pages & digital ads
                              for your business in seconds. Unleash the most advanced AI writer to boost your
                              traffic and productivity.</p>
                           <ul className="social-link">
                              <li><Link href="#"><i className="fab fa-facebook-f"></i></Link></li>
                              <li><Link href="#"><i className="fab fa-twitter"></i></Link></li>
                              <li><Link href="#"><i className="fab fa-linkedin-in"></i></Link></li>
                              <li><Link href="#"><i className="fab fa-instagram"></i></Link></li>
                           </ul>
                        </div>
                     </div>
                  </div>
                  <div className="col-lg-5">
                     <div className="footer-widget footer_widget_nav_menu wow fadeInDown">
                        <div className="row">
                           <div className="col-md-6">
                              <h4 className="footer-title">Quick Links</h4>
                              <ul className="mb-30">
                                 <li><Link href="/blog-details">Blog Post & Articles</Link></li>
                                 <li><Link href="/blog-details">Product Description</Link></li>
                                 <li><Link href="/blog-details">Social Media Ads</Link></li>
                                 <li><Link href="/team">Expert Team</Link></li>
                                 <li><Link href="/pricing">Pricing Package</Link></li>
                              </ul>
                           </div>
                           <div className="col-md-6">
                              <h4 className="footer-title">Company</h4>
                              <ul className="mb-30">
                                 <li><Link href="/about">About Us</Link></li>
                                 <li><Link href="/pricing">Pricing</Link></li>
                                 <li><Link href="/login">Login</Link></li>
                                 <li><Link href="/sign-up">Sign Up</Link></li>
                                 <li><Link href="/about">Privacy & Policy</Link></li>
                              </ul>
                           </div>
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
                           <p>Our latest news, articles, and resources, we will sent to your inbox weekly.</p>
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
                        <p>Copyright 2025 All Right Reserved</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </footer>
   )
}

export default FooterTwo
