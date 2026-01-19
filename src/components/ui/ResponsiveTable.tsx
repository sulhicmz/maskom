"use client";

import React, { useState, useRef, useEffect, ReactNode } from 'react';

export interface ResponsiveTableProps {
  children: ReactNode;
  caption?: string;
  captionId?: string;
  ariaLabel?: string;
  className?: string;
  overflowBreakpoint?: 'sm' | 'md' | 'lg' | 'xl';
  stackOnMobile?: boolean;
}

const ResponsiveTable = ({
  children,
  caption,
  captionId,
  ariaLabel,
  className = '',
  overflowBreakpoint = 'md',
  stackOnMobile = true,
}: ResponsiveTableProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      const breakpoints: Record<string, number> = {
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
      };
      setIsMobile(window.innerWidth < breakpoints[overflowBreakpoint]);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [overflowBreakpoint]);

  const breakpoints = {
    sm: 'table-responsive-sm',
    md: 'table-responsive-md',
    lg: 'table-responsive-lg',
    xl: 'table-responsive-xl',
  };

  const tableClassName = isMobile && stackOnMobile
    ? 'table table-striped table-bordered card-view-mobile'
    : `table table-striped table-bordered ${breakpoints[overflowBreakpoint]} ${className}`;

  return (
    <div
      ref={tableRef}
      className="table-container"
      role="region"
      aria-label={ariaLabel || 'Data table'}
      tabIndex={0}
    >
      <table
        className={tableClassName}
        role="table"
        aria-labelledby={captionId}
      >
        {caption && (
          <caption id={captionId}>{caption}</caption>
        )}
        {children}
      </table>
    </div>
  );
};

export interface ResponsiveTableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

const ResponsiveTableRow = ({
  children,
  className = '',
  onClick,
  ariaLabel,
}: ResponsiveTableRowProps) => {
  return (
    <tr
      className={className}
      onClick={onClick}
      role="row"
      aria-label={ariaLabel}
    >
      {children}
    </tr>
  );
};

export interface ResponsiveTableCellProps {
  children: ReactNode;
  scope?: 'col' | 'row' | 'colgroup';
  colSpan?: number;
  rowSpan?: number;
  className?: string;
  ariaLabel?: string;
  dataLabel?: string;
}

const ResponsiveTableCell = ({
  children,
  scope,
  colSpan,
  rowSpan,
  className = '',
  ariaLabel,
  dataLabel,
}: ResponsiveTableCellProps) => {
  const CellTag = scope ? 'th' : 'td';

  return (
    <CellTag
      scope={scope}
      colSpan={colSpan}
      rowSpan={rowSpan}
      className={className}
      aria-label={ariaLabel}
      data-label={dataLabel}
      role={scope ? 'columnheader' : 'cell'}
    >
      {children}
    </CellTag>
  );
};

export interface TableHeaderProps {
  children: ReactNode;
  className?: string;
  ariaSort?: 'none' | 'ascending' | 'descending';
  onSort?: () => void;
  ariaLabel?: string;
}

const TableHeader = ({
  children,
  className = '',
  ariaSort = 'none',
  onSort,
  ariaLabel,
}: TableHeaderProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSort?.();
    }
  };

  return (
    <th
      className={`sortable-header ${className}`}
      aria-sort={ariaSort}
      tabIndex={onSort ? 0 : undefined}
      onClick={onSort}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
      style={{ cursor: onSort ? 'pointer' : 'default' }}
    >
      {children}
      {onSort && (
        <span className="sort-indicator" aria-hidden="true">
          {ariaSort === 'ascending' && ' ↑'}
          {ariaSort === 'descending' && ' ↓'}
          {ariaSort === 'none' && ' ⇅'}
        </span>
      )}
    </th>
  );
};

ResponsiveTable.Row = ResponsiveTableRow;
ResponsiveTable.Cell = ResponsiveTableCell;
ResponsiveTable.Header = TableHeader;

export default ResponsiveTable;
