"use client"
import UseSticky from "@/hooks/UseSticky";

const ScrollToTop = () => {
   const { sticky }: { sticky: boolean } = UseSticky();

   const scrollTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
   };

   return (
      <>
         <div onClick={scrollTop} className={`xc-back-to-top-wrapper ${sticky ? "xc-back-to-top-btn-show" : ""}`}>
            <button id="xc_back-to-top" type="button" className="xc-back-to-top-btn">
               <i className="far fa-angle-down"></i>
               <span className="xc-back-to-top-progress"></span>
            </button>
         </div>
      </>
   )
}

export default ScrollToTop
