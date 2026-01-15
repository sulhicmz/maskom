"use client";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  showSpinner?: boolean;
}

const LoadingButton = ({
  isLoading,
  loadingText,
  children,
  disabled,
  className,
  showSpinner = true,
  ...props
}: LoadingButtonProps) => {
  return (
    <button
      type="submit"
      className={className}
      disabled={disabled || isLoading}
      aria-live="polite"
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="loading-button-content">
          {showSpinner && <span className="loading-spinner" aria-hidden="true"></span>}
          {loadingText || "Loading..."}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;
