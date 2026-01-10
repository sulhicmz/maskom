'use client'
import { useEffect, useState } from "react";

interface StickyState {
   sticky: boolean;
}

const BREAKPOINT = 1200;

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

export const useBreakpoint = (breakpoint: number = BREAKPOINT) => {
   const [isBreakpointOn, setIsBreakpointOn] = useState(false);

   useEffect(() => {
      if (typeof window === "undefined") {
         return undefined;
      }

      const handleResize = () => {
         setIsBreakpointOn(window.innerWidth < breakpoint);
      };

      window.addEventListener("resize", handleResize);
      handleResize();

      return () => {
         window.removeEventListener("resize", handleResize);
      };
   }, [breakpoint]);

   return { isBreakpointOn };
};

export default UseSticky;
