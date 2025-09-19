"use client"

import Category from "./Category"
import LatestNews from "./LatestNews"
import Tags from "./Tags"

const BlogSidebar = () => {
   return (
      <div className="col-xl-4">
         <div className="sidebar-widget-area mb-30">
            <div className="sidebar-widget sidebar-search-widget mb-20 wow fadeInUp">
               <div className="sidebar-widget-content">
                  <form onSubmit={(e)=>e.preventDefault()}>
                     <div className="search-input">
                        <input type="text" placeholder="Search.."/>
                           <button type="submit"><i className="far fa-search"></i></button>
                     </div>
                  </form>
               </div>
            </div>
            <Category />
           <LatestNews />
           <Tags />
         </div>
      </div>
   )
}

export default BlogSidebar
