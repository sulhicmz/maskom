"use client"
import UseSticky from "@/hooks/UseSticky";
import { useState, useEffect } from "react";

const ScrollToTop = () => {
   const { sticky }: { sticky: boolean } = UseSticky();

   const [showScroll, setShowScroll] = useState(false);

   const scrollTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
   };

   useEffect(() => {
      const checkScrollTop = () => {
         if (!showScroll && window.pageYOffset > 400) {
            setShowScroll(true);
         } else if (showScroll && window.pageYOffset <= 400) {
            setShowScroll(false);
         }
      };

      window.addEventListener("scroll", checkScrollTop);
      return () => window.removeEventListener("scroll", checkScrollTop);
   }, [showScroll]);

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
