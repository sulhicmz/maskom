"use client"

import React, { memo } from 'react'

type StatusType = 'success' | 'danger' | 'warning' | 'info'

interface StatusBadgeProps {
  type: StatusType
  children?: React.ReactNode
  className?: string
}

const StatusBadge = ({ type, children, className = '' }: StatusBadgeProps) => {
  const colorMap: Record<StatusType, string> = {
    success: 'text-success',
    danger: 'text-danger',
    warning: 'text-warning',
    info: 'text-info'
  }

  return (
    <span className={`status-badge ${colorMap[type]} ${className}`} role="status">
      {children}
    </span>
  )
}

export default memo(StatusBadge)
