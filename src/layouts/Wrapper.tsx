"use client";
import dynamic from "next/dynamic";
import ScrollToTop from "@/components/common/ScrollToTop";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { ReactNode, useEffect, memo } from "react";
import { I18nProvider } from "@/contexts/I18nContext";

const ToastContainer = dynamic(
    () => import("react-toastify").then((mod) => mod.ToastContainer),
    { ssr: false }
);

interface WrapperProps {
    children: ReactNode;
}

const Wrapper = memo(({ children }: WrapperProps) => {
    useEffect(() => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/react-toastify@9.1.3/dist/ReactToastify.min.css";
        link.id = "toastify-css";
        document.head.appendChild(link);

        return () => {
            const existing = document.getElementById("toastify-css");
            if (existing) {
                document.head.removeChild(existing);
            }
        };
    }, []);

    return <I18nProvider>
        <ErrorBoundary>
            <main id="main-content">
                {children}
            </main>
            <ScrollToTop />
            <ToastContainer position="top-center" />
        </ErrorBoundary>
    </I18nProvider>;
});

Wrapper.displayName = "Wrapper";

export default Wrapper
