"use client"
import NavMenu from "./Menu/NavMenu"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react";
import UseSticky from "@/hooks/UseSticky";

import logo_1 from "@/assets/images/logo/secondary-logo.png";
import logo_3 from "@/assets/images/logo/main-logo.png";

const HeaderTwo = () => {

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
         <header className="transparent-header navigation-white">
            <div className={`header-navigation navigation-default ${isBreakpointOn ? "breakpoint-on d-block d-xl-none" : ""} ${sticky ? "sticky" : ""}`} >
               <div onClick={() => setOffCanvas(false)} className={`nav-overlay ${offCanvas ? "active" : ""} `}></div>
               <div className="ac-header-one__main">
                  <div className="container">
                     <div className="ac-header-one__main-wrapper">
                        <div className="ac-header-one__left">
                           <div className="ac-header-one__logo">
                              <Link href="/"><Image src={logo_1} alt="logo" /></Link>
                           </div>
                        </div>
                        <div className="ac-header-one__right">
                           <div className="ac-header-one__right-menu d-flex align-items-center">
                              <div className={`ac-nav-menu ${offCanvas ? "menu-on" : ""}`}>
                                 <div className="site-branding d-block d-xl-none text-center mb-30">
                                    <Link href="/"><Image src={logo_3} alt="logo" /></Link>
                                 </div>
                                 <nav className="main-menu">
                                    <NavMenu />
                                 </nav>
                                 <div className="nav-button d-block d-xl-none mt-30">
                                    <Link href="/contact" className="theme-btn style-one">Start Writing</Link>
                                 </div>
                              </div>
                              <div className="ac-header-one__right-btn d-flex">
                                 <div className="ac-dark-btn">
                                    <Link href="/home-one-dark"><i className="fas fa-moon"></i></Link>
                                 </div>
                                 <div className="ac-header-bnt-1">
                                    <Link href="/login">Login</Link>
                                 </div>
                                 <div className="ac-header-bnt-2 d-none d-md-block">
                                    <Link href="/contact" className="theme-btn style-one">Start Writing</Link>
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

export default HeaderTwo
