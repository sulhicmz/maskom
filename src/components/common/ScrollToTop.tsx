"use client"
import UseSticky from "@/hooks/UseSticky";

const ScrollToTop = () => {
   const { sticky }: { sticky: boolean } = UseSticky();

   const scrollTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
   };

   const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
         e.preventDefault();
         scrollTop();
      }
   };

   return (
      <>
         <div 
            onClick={scrollTop}
            onKeyDown={handleKeyDown}
            className={`xc-back-to-top-wrapper ${sticky ? "xc-back-to-top-btn-show" : ""}`}
            role="button"
            tabIndex={sticky ? 0 : -1}
            aria-label="Kembali ke atas halaman"
            aria-hidden={!sticky}
         >
            <button id="xc_back-to-top" type="button" className="xc-back-to-top-btn" aria-label="Kembali ke atas halaman">
               <i className="far fa-angle-down" aria-hidden="true"></i>
               <span className="xc-back-to-top-progress" aria-hidden="true"></span>
            </button>
         </div>
      </>
   )
}

export default ScrollToTop
