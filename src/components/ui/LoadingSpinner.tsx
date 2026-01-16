import React, { memo } from 'react'

interface LoadingSpinnerProps {
  minHeight?: number | string
  text?: string
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
  className?: string
}

const LoadingSpinner = ({
  minHeight = 200,
  text = 'Loading...',
  color = 'primary',
  className = ''
}: LoadingSpinnerProps) => {
  return (
    <div className={`d-flex justify-content-center align-items-center ${className}`} style={{ minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }}>
      <div className={`spinner-border text-${color}`} role="status">
        <span className="visually-hidden">{text}</span>
      </div>
    </div>
  )
}

export default memo(LoadingSpinner)
