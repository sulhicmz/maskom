import Link from 'next/link'
import use_case_sidebar_data from '@/data/UseCaseSidebarData'

const UseCaseDetailsSidebar = () => {
   return (
      <div className="col-lg-4">
         <div className="sidebar-nav-widget style-one mb-50 wow fadeInDown">
            <ul>
               {use_case_sidebar_data.map((item) => (
                  <li key={item.id}>
                     <Link href={item.link} className={item.active ? 'active' : ''}>
                        {item.title}
                     </Link>
                  </li>
               ))}
            </ul>
         </div>
      </div>
   )
}

export default UseCaseDetailsSidebar
