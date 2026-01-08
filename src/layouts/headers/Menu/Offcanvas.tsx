import Image from "next/image";
import Link from "next/link";

import menu_data from "@/data/MenuData";
import logo from "@/assets/images/logo/logo_02.svg";

const socialLinks = [
   { icon: "fab fa-instagram", href: "https://www.instagram.com" },
   { icon: "fab fa-linkedin-in", href: "https://www.linkedin.com" },
   { icon: "far fa-envelope", href: "mailto:sales@maskom.co.id" },
   { icon: "fas fa-phone-alt", href: "tel:+628170006625" },
];

const Offcanvas = () => {
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
                     <p>Telepon: <Link href="tel:+628170006625">(+62) 817-000-6625</Link></p>
                  </div>
                  <ul className="style-none d-flex flex-wrap w-100 justify-content-between align-items-center social-icon pt-25 mt-auto">
                     {socialLinks.map((item) => (
                        <li key={item.href}>
                           <Link href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined}>
                              <i className={item.icon}></i>
                           </Link>
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         </div>
      </>
   );
}

export default Offcanvas;
