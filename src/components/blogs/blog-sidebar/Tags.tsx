import Link from "next/link";

const tags: string[] = [
   "SD-WAN",
   "Managed Wi-Fi",
   "Keamanan",
   "Cloud Connect",
   "Monitoring",
   "IoT",
];

const Tags = () => {
   return (
      <div className="sidebar-widget tag-cloud-widget wow fadeInUp">
         <h3 className="widget-title">Keywords</h3>
         <div className="tagcloud">
            {tags.map((tag, i) => (
               <Link key={i} href="#">{tag}</Link>
            ))}
         </div>
      </div>
   )
}

export default Tags
