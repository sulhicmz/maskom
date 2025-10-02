import Image from "next/image"
import Link from "next/link"
import menu_data from "@/data/MenuData"
import { MenuItem } from "@/types/menu"

import logo from "@/assets/images/logo/logo_02.svg"

interface OffcanvasProps {
  menuItems?: MenuItem[];
}

const Offcanvas = ({ menuItems = menu_data }: OffcanvasProps) => {
    return (
       <>
          <div className="offcanvas offcanvas-end sidebar-nav" tabIndex={-1} id="sideNav" aria-labelledby="staticBackdropLabel">
             <div className="offcanvas-header p0">
                <div className="logo order-lg-0">
                   <Link href="/" className="d-flex align-items-center">
                      <Image src={logo} alt="Maskom Logo" />
                   </Link>
                </div>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
             </div>
             <div className="wrapper mt-10 h-100">
                <div className="d-flex flex-column h-100">
                   <div className="sidebar-nav-item">
                      <ul className="style-none">
                         {menuItems.map((item) => (
                            <li key={item.id} className="nav-item">
                               {item.has_dropdown && item.sub_menus ? (
                                  <>
                                     <Link className="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">{item.title}</Link>
                                     <ul className="dropdown-menu">
                                        {item.sub_menus.map((subItem, index) => (
                                           <li key={index}>
                                              <Link href={subItem.link} className="dropdown-item"><span>{subItem.title}</span></Link>
                                           </li>
                                        ))}
                                     </ul>
                                  </>
                               ) : (
                                  <Link href={item.link}>{item.title}</Link>
                               )}
                            </li>
                         ))}
                      </ul>
                   </div>
                   <div><Link href="/login" className="btn-five w-100 tran3s">Login</Link></div>
                   <div className="address-block mt-50">
                      <h4 className="title pb-15">Alamat Kami</h4>
                      <p>Layanan Konektivitas dan Managed Service <br />Indonesia</p>
                      <p>Butuh bantuan segera? hubungi kami di <br /><Link href="tel:02112345678">021-1234-5678</Link></p>
                   </div>
                   <ul className="style-none d-flex flex-wrap w-100 justify-content-between align-items-center social-icon pt-25 mt-auto">
                      <li><Link href="#"><i className="fa-brands fa-whatsapp"></i></Link></li>
                      <li><Link href="#"><i className="fa-brands fa-x-twitter"></i></Link></li>
                      <li><Link href="#"><i className="fa-brands fa-instagram"></i></Link></li>
                      <li><Link href="#"><i className="fa-brands fa-linkedin"></i></Link></li>
                   </ul>
                </div>
             </div>
          </div>
       </>
    )
 }

export default Offcanvas