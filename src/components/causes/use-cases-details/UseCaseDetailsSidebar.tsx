import Link from 'next/link'

const UseCaseDetailsSidebar = () => {
   return (
      <div className="col-lg-4">
         <div className="sidebar-nav-widget style-one mb-50 wow fadeInDown">
            <ul>
               <li><Link href="/use-case-details" className="active">Integrasi Konektivitas Ritel Nasional</Link></li>
               <li><Link href="/use-case-details">Managed Wi-Fi untuk F&B Chain</Link></li>
               <li><Link href="/use-case-details">SD-WAN & Prioritas Aplikasi Logistik</Link></li>
               <li><Link href="/use-case-details">Keamanan Jaringan Rumah Sakit</Link></li>
               <li><Link href="/use-case-details">Interkoneksi Data Center & Cloud</Link></li>
            </ul>
         </div>
      </div>
   )
}

export default UseCaseDetailsSidebar
