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
}

const ReactPaginate = dynamic(() => import("react-paginate"), {
   ssr: false,
   loading: () => <div className="ac-pagination"><nav><div className="text-muted">Memuat halaman...</div></nav></div>
})

const PaginationWrapper = React.memo(({ pageCount, onPageChange, pageRangeDisplayed = 3, marginPagesDisplayed, containerClassName, className }: PaginationProps) => {
   return (
      <div className={`ac-pagination ${className || ""}`}>
         <nav>
            <ReactPaginate
               breakLabel="..."
               nextLabel={<i className="far fa-angle-right"></i>}
               onPageChange={onPageChange}
               pageRangeDisplayed={pageRangeDisplayed}
               marginPagesDisplayed={marginPagesDisplayed}
               pageCount={pageCount}
               previousLabel={<i className="far fa-angle-left"></i>}
               renderOnZeroPageCount={null}
               containerClassName={containerClassName}
            />
         </nav>
      </div>
   )
})

PaginationWrapper.displayName = "PaginationWrapper"

export default PaginationWrapper
