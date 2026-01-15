"use client"
import React from "react"

const Button: React.FC<{
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "secondary" | "text"
  className?: string
  type?: "button" | "submit" | "reset"
  ariaLabel?: string
}> = ({ children, onClick, variant = "primary", className = "", type = "button", ariaLabel }) => {
  const baseClasses = "btn"
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    text: "btn-link",
  }

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

Button.displayName = "Button"

export default Button
