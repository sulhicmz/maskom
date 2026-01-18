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

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  )
}

Button.displayName = "Button"

export default Button
