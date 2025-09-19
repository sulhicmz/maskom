import Link from "next/link";

const tags: string[] = ["Ideas", "Image Generator", "Technology", "Intelligence"];

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
