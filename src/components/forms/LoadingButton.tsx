"use client";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const LoadingButton = ({
  isLoading,
  loadingText,
  children,
  disabled,
  className,
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
      {isLoading ? (loadingText || "Loading...") : children}
    </button>
  );
};

export default LoadingButton;
