import Link from 'next/link'

const UseCaseDetailsSidebar = () => {
   return (
      <div className="col-lg-4">
         <div className="sidebar-nav-widget style-one mb-50 wow fadeInDown">
            <ul>
               <li><Link href="/use-case-details" className="active">Blog Post & Articles</Link></li>
               <li><Link href="/use-case-details">Product Description</Link></li>
               <li><Link href="/use-case-details">Social Media Ads</Link></li>
               <li><Link href="/use-case-details">Product Benefits</Link></li>
               <li><Link href="/use-case-details">Advance Analytics</Link></li>
               <li><Link href="/use-case-details">Blog Post & Articles</Link></li>
            </ul>
         </div>
      </div>
   )
}

export default UseCaseDetailsSidebar
