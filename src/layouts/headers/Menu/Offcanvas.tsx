import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

import menu_data from "@/data/MenuData";
import { socialLinks } from "@/data/SocialMediaData";
import { PHONE_DISPLAY } from "@/data/ContactData";
import logo from "@/assets/images/logo/logo_02.svg";

const Offcanvas = memo(() => {
   return (
      <>
         <div className="offcanvas offcanvas-end sidebar-nav" tabIndex={-1} id="sideNav" aria-labelledby="staticBackdropLabel">
            <div className="offcanvas-header p0">
                <div className="logo order-lg-0">
                   <Link href="/" className="d-flex align-items-center" data-bs-dismiss="offcanvas" aria-label="Ke halaman utama">
                      <Image src={logo} alt="Maskom - Logo Utama" />
                   </Link>
                </div>
               <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="wrapper mt-10 h-100">
               <div className="d-flex flex-column h-100">
                  <div className="sidebar-nav-item">
                     <ul className="style-none">
                        {menu_data.map((menu) => (
                           <li key={menu.id} className="nav-item">
                              <Link href={menu.link} data-bs-dismiss="offcanvas">
                                 {menu.title}
                              </Link>
                              {menu.has_dropdown && menu.sub_menus && (
                                 <ul className="style-none">
                                    {menu.sub_menus.map((sub_menu, i) => (
                                       <li key={i} className="nav-item">
                                          <Link href={sub_menu.link} data-bs-dismiss="offcanvas">
                                             {sub_menu.title}
                                          </Link>
                                       </li>
                                    ))}
                                 </ul>
                              )}
                           </li>
                        ))}
                     </ul>
                  </div>
                  <div><Link href="/contact" className="btn-five w-100 tran3s" data-bs-dismiss="offcanvas">Hubungi Kami</Link></div>
                   <div className="address-block mt-50">
                      <h4 className="title pb-15">Maskom Network</h4>
                      <p>Jakarta Selatan, DKI Jakarta<br />Indonesia</p>
                      <p>Telepon: <Link href={`tel:${PHONE_DISPLAY.replace(/[^0-9+]/g, '')}`}>{PHONE_DISPLAY}</Link></p>
                   </div>
                  <ul className="style-none d-flex flex-wrap w-100 justify-content-between align-items-center social-icon pt-25 mt-auto">
                      {socialLinks.map((item) => (
                         <li key={item.url}>
                            <Link href={item.url} target={item.target} aria-label={item.ariaLabel} rel={item.target === "_blank" ? "noreferrer" : undefined}>
                               <i className={item.iconClass}></i>
                            </Link>
                         </li>
                      ))}
                  </ul>
               </div>
            </div>
         </div>
      </>
   );
});

Offcanvas.displayName = "Offcanvas";

export default Offcanvas;
