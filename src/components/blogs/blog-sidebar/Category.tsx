import Link from "next/link";

const cat_data: string[] = ["Digital AI (13)", "AI Marketing (45)", "Content Generator (12)", "Video Content (18)", "Image Generator (5)", "Development AI (3)", "Reach AI (7)"];

const Category = () => {
   return (
      <div className="sidebar-widget sidebar-category-widget mb-35 wow fadeInUp">
         <h3 className="widget-title">Category</h3>
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
