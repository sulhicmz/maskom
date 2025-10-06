import Image from "next/image";
import Link from "next/link";

import menu_data from "@/data/MenuData";
import logo from "@/assets/images/logo/logo_02.svg";

const companyLinks = [
   { title: "Tentang Maskom", href: "/about" },
   { title: "FAQ", href: "/faq" },
   { title: "Portal Pelanggan", href: "/login" },
   { title: "Daftar Layanan", href: "/sign-up" },
];

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
                  <Link href="/" className="d-flex align-items-center" data-bs-dismiss="offcanvas">
                     <Image src={logo} alt="" />
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
                           </li>
                        ))}
                        <li className="nav-item mt-3 text-uppercase fw-semibold text-muted">Perusahaan</li>
                        {companyLinks.map((menu) => (
                           <li key={menu.href} className="nav-item">
                              <Link href={menu.href} data-bs-dismiss="offcanvas">
                                 {menu.title}
                              </Link>
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
