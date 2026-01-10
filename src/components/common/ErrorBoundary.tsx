"use client";

import { Component, ReactNode, ErrorInfo } from "react";
import Link from "next/link";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    errorId: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: ""
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
            errorId: generateErrorId()
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({
            errorInfo
        });

        logError(error, errorInfo, this.state.errorId);
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: ""
        });
    };

    handleReload = (): void => {
        window.location.reload();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return <ErrorFallback 
                errorId={this.state.errorId} 
                onReset={this.handleReset}
                onReload={this.handleReload}
            />;
        }

        return this.props.children;
    }
}

function ErrorFallback({ errorId, onReset, onReload }: { errorId: string; onReset: () => void; onReload: () => void }) {
    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <div className="text-center p-5">
                <div className="mb-4">
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="40" cy="40" r="38" stroke="#dc3545" strokeWidth="4" />
                        <path d="M40 25V40" stroke="#dc3545" strokeWidth="4" strokeLinecap="round" />
                        <circle cx="40" cy="52" r="2" fill="#dc3545" />
                    </svg>
                </div>
                <h1 className="display-4 fw-bold text-danger mb-3">Terjadi Kesalahan</h1>
                <p className="lead mb-4">
                    Maaf, terjadi kesalahan tak terduga. Tim kami telah diberitahu.
                </p>
                <p className="text-muted mb-4">
                    Kode Error: <code className="bg-light px-2 py-1 rounded">{errorId}</code>
                </p>
                <div className="d-flex gap-2 justify-content-center flex-wrap">
                    <button className="btn btn-primary" onClick={onReload}>
                        Muat Ulang Halaman
                    </button>
                    <button className="btn btn-outline-secondary" onClick={onReset}>
                        Coba Lagi
                    </button>
                </div>
                <p className="text-muted mt-4 mb-0">
                    Masalah berlanjut? <Link href="/contact">Hubungi Kami</Link>
                </p>
            </div>
        </div>
    );
}

function generateErrorId(): string {
    return `ERR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

function logError(error: Error, errorInfo: React.ErrorInfo, errorId: string): void {
    const errorDetails = {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
    };

    console.error("[ErrorBoundary]", errorId, errorDetails);
}

export default ErrorBoundary;
