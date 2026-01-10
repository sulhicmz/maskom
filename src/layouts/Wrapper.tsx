"use client";
import dynamic from "next/dynamic";
import ScrollToTop from "@/components/common/ScrollToTop";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { ReactNode } from "react";

const ToastContainer = dynamic(
    () => import("react-toastify").then((mod) => mod.ToastContainer),
    { ssr: false }
);

interface WrapperProps {
    children: ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => {

    return <ErrorBoundary>
        {children}
        <ScrollToTop />
        <ToastContainer position="top-center" />
    </ErrorBoundary>;
}

export default Wrapper
