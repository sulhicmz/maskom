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
      <button
         id="xc_back-to-top"
         onClick={scrollTop}
         onKeyDown={handleKeyDown}
         className={`xc-back-to-top-btn ${sticky ? "xc-back-to-top-btn-show" : ""}`}
         aria-label="Kembali ke atas halaman"
         aria-hidden={!sticky}
         type="button"
      >
         <i className="far fa-angle-down" aria-hidden="true"></i>
         <span className="xc-back-to-top-progress" aria-hidden="true"></span>
      </button>
   )
}

export default ScrollToTop
