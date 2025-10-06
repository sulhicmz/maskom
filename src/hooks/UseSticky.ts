'use client'
import { useEffect, useState } from "react";

interface StickyState {
   sticky: boolean;
}

const UseSticky = (offset = 200): StickyState => {
   const [sticky, setSticky] = useState(false);

   useEffect(() => {
      if (typeof window === "undefined") {
         return undefined;
      }

      let frame = 0;

      const updateSticky = () => {
         frame = 0;
         const shouldStick = window.scrollY > offset;
         setSticky((prev) => (prev === shouldStick ? prev : shouldStick));
      };

      const handleScroll = () => {
         if (frame) return;
         frame = window.requestAnimationFrame(updateSticky);
      };

      updateSticky();
      window.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
         if (frame) {
            window.cancelAnimationFrame(frame);
         }
         window.removeEventListener("scroll", handleScroll);
      };
   }, [offset]);

   return {
      sticky,
   };
}

export default UseSticky
