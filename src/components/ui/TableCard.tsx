import React, { memo, ReactNode } from 'react'

interface TableCardProps {
  title: string
  children: ReactNode
  className?: string
}

const TableCard = ({ title, children, className = '' }: TableCardProps) => {
  return (
    <div className={`card shadow-sm ${className}`}>
      <div className="card-header bg-white">
        <h5 className="mb-0">{title}</h5>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          {children}
        </div>
      </div>
    </div>
  )
}

export default memo(TableCard)
