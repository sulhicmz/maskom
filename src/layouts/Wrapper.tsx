/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { ToastContainer } from "react-toastify";
import ScrollToTop from "@/components/common/ScrollToTop";
import { validateEnvironment } from "@/config/env";
import { useEffect } from "react";
import { initWOW } from "@/utils/wow-init";
import { initPerformanceMonitoring } from "@/utils/performance-monitor";

const Wrapper = ({ children }: any) => {
  useEffect(() => {
    // Validate environment on initial render
    validateEnvironment();
    
    // Initialize WOW.js animations
    initWOW({
      boxClass: 'wow',
      animateClass: 'animated',
      offset: 100,
      mobile: true
    });
    
    // Initialize performance monitoring
    initPerformanceMonitoring();
  }, []);

  return <>
    {children}
    <ScrollToTop />
    <ToastContainer position="top-center" />
  </>;
}

export default Wrapper
