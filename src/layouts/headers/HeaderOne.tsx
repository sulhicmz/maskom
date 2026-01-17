"use client"
import NavMenu from "./Menu/NavMenu"
import Link from "next/link"
import Image from "next/image"
import { useState, memo } from "react";
import UseSticky, { useBreakpoint } from "@/hooks/UseSticky";
import ThemeToggle from "@/components/common/ThemeToggle";
import { LanguageSwitcher } from "@/components/common/i18n/LanguageSwitcher";

import logo_1 from "@/assets/images/logo/main-logo.svg";
import logo_2 from "@/assets/images/logo/white-logo.svg";

interface HeaderOneProps {
   style: boolean;
}
const HeaderOne = memo(({ style }: HeaderOneProps) => {

   const { sticky } = UseSticky();
   const { isBreakpointOn } = useBreakpoint();
   const [offCanvas, setOffCanvas] = useState<boolean>(false);

   return (
      <>
          <header className={`transparent-header ${style ? "navigation-white" : ""}`}>
             <div className={`header-navigation navigation-default ${isBreakpointOn ? "breakpoint-on d-block d-xl-none" : ""} ${sticky ? "sticky" : ""}`} >
                <button
                  onClick={() => setOffCanvas(false)}
                  className={`nav-overlay ${offCanvas ? "active" : ""} `}
                  aria-label="Close navigation menu"
                  aria-hidden={!offCanvas}
                  tabIndex={offCanvas ? 0 : -1}
                ></button>
               <div className="ac-header-one__main">
                  <div className="container">
                     <div className="ac-header-one__main-wrapper">
                         <div className="ac-header-one__left">
                            <div className="ac-header-one__logo">
                               <Link href="/"><Image src={style ? logo_2 : logo_1} alt="Maskom - Logo Utama" /></Link>
                            </div>
                         </div>
                         <div className="ac-header-one__right">
                            <div className="ac-header-one__right-menu d-flex align-items-center">
                               <div className={`ac-nav-menu ${offCanvas ? "menu-on" : ""}`} id="primary-nav">
                                  <div className="site-branding d-block d-xl-none text-center mb-30">
                                     <Link href="/"><Image src={logo_1} alt="Maskom - Logo Utama" /></Link>
                                  </div>
                                  <nav className="main-menu" aria-label="Primary navigation">
                                     <NavMenu />
                                  </nav>
                                  <div className="nav-button d-block d-xl-none mt-30">
                                     <Link href="/contact" className="theme-btn gradient-btn">Konsultasi Gratis</Link>
                                  </div>
                               </div>
                                <div className="ac-header-one__right-btn style-one d-flex align-items-center">
                                   <div className="ac-header-bnt-1">
                                      <Link href="/login">Portal Pelanggan</Link>
                                   </div>
                                    <div className="ac-header-bnt-2 d-none d-md-block">
                                       <Link href="/contact" className="theme-btn gradient-btn">Konsultasi Gratis</Link>
                                    </div>
                                    <ThemeToggle />
                                    <LanguageSwitcher variant="minimal" />
                                    <button
                                      onClick={() => setOffCanvas(!offCanvas)}
                                      className={`navbar-toggler ${offCanvas ? "active" : ""}`}
                                      aria-label="Toggle navigation menu"
                                      aria-expanded={offCanvas}
                                      aria-controls="primary-nav"
                                    >
                                      <span></span>
                                      <span></span>
                                      <span></span>
                                   </button>
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
})

HeaderOne.displayName = "HeaderOne"

export default HeaderOne
