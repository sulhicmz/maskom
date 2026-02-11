"use client"
import React from "react"

const Button: React.FC<{
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "text" | "danger"
  className?: string
  type?: "button" | "submit" | "reset"
  ariaLabel?: string
  disabled?: boolean
  size?: "small" | "medium" | "large"
}> = ({ children, onClick, variant = "primary", className = "", type = "button", ariaLabel, disabled = false, size = "medium" }) => {
  const baseClasses = "btn"
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    text: "btn-link",
    danger: "btn-danger",
  }
  const sizeClasses = {
    small: "btn-sm",
    medium: "",
    large: "btn-lg",
  }

  // UX Enhancement: Focus ring for keyboard navigation, active state feedback, and smooth transitions
  const uxEnhancementClasses = `
    transition-all duration-150 ease-in-out
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
    focus-visible:ring-primary focus-visible:ring-opacity-75
    active:scale-[0.98] active:transform
    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
  `

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${uxEnhancementClasses} ${className}`}
    >
      {children}
    </button>
  )
}

Button.displayName = "Button"

export default Button
