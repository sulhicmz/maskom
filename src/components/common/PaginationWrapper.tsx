"use client"
import React from "react"
import dynamic from "next/dynamic"

interface PaginationProps {
   pageCount: number
   onPageChange: (selectedItem: { selected: number }) => void
   pageRangeDisplayed?: number
   marginPagesDisplayed?: number
   containerClassName?: string
   className?: string
   ariaLabel?: string
}

const ReactPaginate = dynamic(() => import("react-paginate"), {
   ssr: false,
   loading: () => <div className="ac-pagination"><nav><div className="text-muted">Memuat halaman...</div></nav></div>
})

const PaginationWrapper = React.memo(({ pageCount, onPageChange, pageRangeDisplayed = 3, marginPagesDisplayed, containerClassName, className, ariaLabel }: PaginationProps) => {
   return (
      <div className={`ac-pagination ${className || ""}`} aria-label={ariaLabel}>
         <nav aria-label="Pagination navigation">
            <ReactPaginate
               breakLabel="..."
               nextLabel={<span aria-label="Halaman selanjutnya"><i className="far fa-angle-right" aria-hidden="true"></i></span>}
               onPageChange={onPageChange}
               pageRangeDisplayed={pageRangeDisplayed}
               marginPagesDisplayed={marginPagesDisplayed}
               pageCount={pageCount}
               previousLabel={<span aria-label="Halaman sebelumnya"><i className="far fa-angle-left" aria-hidden="true"></i></span>}
               renderOnZeroPageCount={null}
               containerClassName={containerClassName}
            />
         </nav>
      </div>
   )
})

PaginationWrapper.displayName = "PaginationWrapper"

export default PaginationWrapper
