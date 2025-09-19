import gallery from "@/assets/images/gallery/404.png"
import Image from "next/image"
import Link from "next/link"

const NotFoundArea = () => {
   return (
      <section className="error-section pt-120 pb-120">
         <div className="container">
            <div className="row justify-content-center">
               <div className="col-lg-6">
                  <div className="error-content text-center wow fadeInUp">
                     <Image src={gallery} alt="Error Image" />
                     <h1><span>Ooops!</span><br />
                        Page Not Found</h1>
                     <p>Our goal is to utilize today&apos;s ttechnologies to stay <br /> ahead of the curve.</p>
                     <Link href="/" className="theme-btn gradient-btn">Go to Home</Link>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default NotFoundArea
