import React from 'react'
import Link from 'next/link'
import use_case_sidebar_data from '@/data/UseCaseSidebarData'

const UseCaseDetailsSidebar = React.memo(() => {
   return (
      <div className="col-lg-4">
         <div className="sidebar-nav-widget style-one mb-50 wow fadeInDown">
            <ul>
                {use_case_sidebar_data.map((item) => (
                   <li key={item.id}>
                      <Link href={item.link} className={item.active ? 'active' : ''} aria-current={item.active ? "page" : undefined}>
                         {item.title}
                      </Link>
                   </li>
                ))}
            </ul>
         </div>
      </div>
   )
})

UseCaseDetailsSidebar.displayName = "UseCaseDetailsSidebar"

export default UseCaseDetailsSidebar
