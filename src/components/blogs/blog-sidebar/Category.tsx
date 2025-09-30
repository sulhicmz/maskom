import Link from "next/link";

const cat_data: string[] = [
   "Konektivitas Terkelola",
   "Keamanan Jaringan",
   "Operasional & Dukungan",
   "Transformasi Digital",
   "Infrastruktur Cloud",
   "IoT & Edge",
];

const Category = () => {
   return (
      <div className="sidebar-widget sidebar-category-widget mb-35 wow fadeInUp">
         <h3 className="widget-title">Kategori</h3>
         <div className="sidebar-widget-content">
            <ul>
               {cat_data.map((cat, i) => (
                  <li key={i}><Link href="/blog"> {cat}</Link></li>
               ))}
            </ul>
         </div>
      </div>
   )
}

export default Category
