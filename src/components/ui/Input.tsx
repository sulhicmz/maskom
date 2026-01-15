"use client"
import React from "react"

const Input: React.FC<{
  type?: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  ariaLabel?: string
  className?: string
}> = ({ type = "text", placeholder, value, onChange, ariaLabel, className = "" }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
      className={`form-control ${className}`}
    />
  )
}

Input.displayName = "Input"

export default Input
