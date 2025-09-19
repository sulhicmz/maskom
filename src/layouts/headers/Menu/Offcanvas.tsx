import Image from "next/image"
import Link from "next/link"

import logo from "@/assets/images/logo/logo_02.svg"

const Offcanvas = () => {
   return (
      <>
         <div className="offcanvas offcanvas-end sidebar-nav" tabIndex={-1} id="sideNav" aria-labelledby="staticBackdropLabel">
            <div className="offcanvas-header p0">
               <div className="logo order-lg-0">
                  <Link href="/" className="d-flex align-items-center">
                     <Image src={logo} alt="" />
                  </Link>
               </div>
               <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="wrapper mt-10 h-100">
               <div className="d-flex flex-column h-100">
                  <div className="sidebar-nav-item">
                     <ul className="style-none">
                        <li className="nav-item">
                           <Link className="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">Home</Link>
                           <ul className="dropdown-menu">
                              <li><Link href="/" className="dropdown-item"><span>Payment Service</span></Link></li>
                              <li><Link href="/home-two" className="dropdown-item"><span>AI Writer</span></Link></li>
                              <li><Link href="/home-three" className="dropdown-item"><span>Website Builder</span></Link></li>
                              <li><Link href="/home-four" className="dropdown-item"><span>CRM</span></Link></li>
                              <li><Link href="/home-five" className="dropdown-item"><span>Project Management</span></Link></li>
                              <li><Link href="/home-six" className="dropdown-item"><span>Mobile App Landing</span></Link></li>
                              <li><Link href="/home-seven" className="dropdown-item"><span>Digital Agency</span></Link></li>
                              <li><Link href="/home-eight" className="dropdown-item"><span>Help Desk</span></Link></li>
                              <li><Link href="/home-nine" className="dropdown-item"><span>Web Hosting</span></Link></li>
                              <li><Link href="/home-ten" className="dropdown-item"><span>Cyber Security</span></Link></li>
                           </ul>
                        </li>
                        <li className="nav-item dropdown">
                           <Link className="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">Portfolio</Link>
                           <ul className="dropdown-menu">
                              <li><Link href="/project-v1" className="dropdown-item"><span>Project-1</span></Link></li>
                              <li><Link href="/project-v2" className="dropdown-item"><span>Project-2</span></Link></li>
                              <li><Link href="/project-v3" className="dropdown-item"><span>Project-3</span></Link></li>
                              <li><Link href="/project-v4" className="dropdown-item"><span>Project-4</span></Link></li>
                              <li><Link href="/project-v5" className="dropdown-item"><span>Project-5</span></Link></li>
                              <li><Link href="/project-v6" className="dropdown-item"><span>Project-6</span></Link></li>
                              <li><Link href="/project-details" className="dropdown-item"><span>Project Details</span></Link></li>
                           </ul>
                        </li>
                        <li className="nav-item">
                           <Link className="dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">Pages</Link>
                           <ul className="dropdown-menu">
                              <li><Link href="/about-us-v1" className="dropdown-item"><span>About Us</span></Link></li>
                              <li><Link href="/team-v1" className="dropdown-item"><span>Team</span></Link></li>
                              <li><Link href="/service-v1" className="dropdown-item"><span>Service</span></Link></li>
                              <li><Link href="/pricing-v1" className="dropdown-item"><span>Pricing</span></Link></li>
                              <li><Link href="/faq-v1" className="dropdown-item"><span>FAQ&apos;s</span></Link></li>
                           </ul>
                        </li>
                        <li className="nav-item"><Link href="/blog-v3">News</Link></li>
                        <li className="nav-item"><Link href="/contact-v1">Contact us</Link></li>
                     </ul>
                  </div>
                  <div><Link href="/login" className="btn-five w-100 tran3s">Login</Link></div>
                  <div className="address-block mt-50">
                     <h4 className="title pb-15">Our Address</h4>
                     <p>Chowrastar Mirpur- 1210, Sangu <br />River, Dhaka</p>
                     <p>Urgent issue? call us at <br /><Link href="tel:310.841.5500">310.841.5500</Link></p>
                  </div>
                  <ul className="style-none d-flex flex-wrap w-100 justify-content-between align-items-center social-icon pt-25 mt-auto">
                     <li><Link href="#"><i className="fa-brands fa-whatsapp"></i></Link></li>
                     <li><Link href="#"><i className="fa-brands fa-x-twitter"></i></Link></li>
                     <li><Link href="#"><i className="fa-brands fa-instagram"></i></Link></li>
                     <li><Link href="#"><i className="fa-brands fa-viber"></i></Link></li>
                  </ul>
               </div>
            </div>
         </div>
      </>
   )
}

export default Offcanvas
