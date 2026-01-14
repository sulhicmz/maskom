"use client"

import React from "react"
import Category from "./Category"
import LatestNews from "./LatestNews"
import Tags from "./Tags"
import AnimationWrapper from "@/components/common/AnimationWrapper"

const BlogSidebar = () => {
   return (
      <div className="col-xl-4">
         <div className="sidebar-widget-area mb-30">
            <div className="sidebar-widget sidebar-search-widget mb-20">
               <AnimationWrapper animation="fadeInUp">
                   <div className="sidebar-widget-content">
                      <form onSubmit={(e)=>e.preventDefault()} role="search">
                         <div className="search-input">
                            <input type="text" placeholder="Cari artikel..." aria-label="Cari artikel di blog"/>
                            <button type="submit" aria-label="Tombol pencarian artikel"><i className="far fa-search" aria-hidden="true"></i></button>
                         </div>
                      </form>
                   </div>
                </AnimationWrapper>
            </div>
            <Category />
            <LatestNews />
            <Tags />
         </div>
      </div>
   )
}

BlogSidebar.displayName = "BlogSidebar"

export default BlogSidebar
