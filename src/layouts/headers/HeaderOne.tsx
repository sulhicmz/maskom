"use client"
import NavMenu from "./Menu/NavMenu"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react";
import UseSticky from "@/hooks/UseSticky";

import logo_1 from "@/assets/images/logo/main-logo.png";
import logo_2 from "@/assets/images/logo/white-logo.png";

interface ProfType {
   style: boolean;
}
const HeaderOne = ({ style }: ProfType) => {

   const { sticky } = UseSticky();
   const [offCanvas, setOffCanvas] = useState<boolean>(false);
   const [isBreakpointOn, setIsBreakpointOn] = useState(false);

   useEffect(() => {
      const handleResize = () => {
         setIsBreakpointOn(window.innerWidth < 1200);
      };

      window.addEventListener("resize", handleResize);
      handleResize();

      return () => {
         window.removeEventListener("resize", handleResize);
      };
   }, []);

   return (
      <>
         <header className={`transparent-header ${style ? "navigation-white" : ""}`}>
            <div className={`header-navigation navigation-default ${isBreakpointOn ? "breakpoint-on d-block d-xl-none" : ""} ${sticky ? "sticky" : ""}`} >
               <div onClick={() => setOffCanvas(false)} className={`nav-overlay ${offCanvas ? "active" : ""} `}></div>
               <div className="ac-header-one__main">
                  <div className="container">
                     <div className="ac-header-one__main-wrapper">
                        <div className="ac-header-one__left">
                           <div className="ac-header-one__logo">
                              <Link href="/"><Image src={style ? logo_2 : logo_1} alt="logo" /></Link>
                           </div>
                        </div>
                        <div className="ac-header-one__right">
                           <div className="ac-header-one__right-menu d-flex align-items-center">
                              <div className={`ac-nav-menu ${offCanvas ? "menu-on" : ""}`}>
                                 <div className="site-branding d-block d-xl-none text-center mb-30">
                                    <Link href="/"><Image src={logo_1} alt="logo" /></Link>
                                 </div>
                                 <nav className="main-menu">
                                    <NavMenu />
                                 </nav>
                                 <div className="nav-button d-block d-xl-none mt-30">
                                    <Link href="/contact" className="theme-btn gradient-btn">Konsultasi Gratis</Link>
                                 </div>
                              </div>
                              <div className="ac-header-one__right-btn style-one d-flex">
                                 <div className="ac-dark-btn">
                                    <Link
                                       href="https://wa.me/628170006625"
                                       target="_blank"
                                       rel="noreferrer"
                                       aria-label="Hubungi Maskom via WhatsApp"
                                    >
                                       <i className="fab fa-whatsapp"></i>
                                    </Link>
                                 </div>
                                 <div className="ac-header-bnt-1">
                                    <Link href="/login">Portal Pelanggan</Link>
                                 </div>
                                 <div className="ac-header-bnt-2 d-none d-md-block">
                                    <Link href="/contact" className="theme-btn gradient-btn">Konsultasi Gratis</Link>
                                 </div>
                                 <div onClick={() => setOffCanvas(true)} className={`navbar-toggler ${offCanvas ? "active" : ""}`}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </header>
      </>
   )
}

export default HeaderOne
