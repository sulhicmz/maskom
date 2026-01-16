import React from "react";
import Link from "next/link";
import categories from "@/data/BlogCategoryData";
import AnimationWrapper from "@/components/common/AnimationWrapper";

const Category = React.memo(() => {
   return (
      <div className="sidebar-widget sidebar-category-widget mb-35">
         <AnimationWrapper animation="fadeInUp">
            <h3 className="widget-title">Kategori</h3>
              <div className="sidebar-widget-content">
                 <ul>
                    {categories.map((cat) => (
                       <li key={cat.id}><Link href="/blog"> {cat.name}</Link></li>
                    ))}
                 </ul>
              </div>
         </AnimationWrapper>
      </div>
   )
})

Category.displayName = "Category"

export default Category
