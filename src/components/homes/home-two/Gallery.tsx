"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Isotope from "isotope-layout";

import icon from "@/assets/images/icon/sub-icon.png"
import gallery_data from "@/data/GalleryData";

const Gallery = () => {

   const isotope = useRef<Isotope | null>(null);
   const [filterKey, setFilterKey] = useState("*");

   useEffect(() => {
      if (typeof window !== "undefined") {
         isotope.current = new Isotope(".isotope-wrapper", {
            itemSelector: ".isotope-filter-item",
            layoutMode: "fitRows",
         });

         // Cleanup
         return () => {
            isotope.current?.destroy();
         };
      }
   }, []);

   // Handling filter key change
   useEffect(() => {
      if (filterKey === "*") isotope.current?.arrange?.({ filter: "*" });
      else isotope.current?.arrange?.({ filter: `.${filterKey}` });
   }, [filterKey]);

   const [selectedFilter, setSelectedFilter] = useState("*");

   const handleFilterKeyChange = (key: string) => () => {
      setFilterKey(key);
      setSelectedFilter(key);
   };

   return (
      <section className="gallery-section pt-115 pb-100">
         <div className="container">
            <div className="row">
               <div className="col-lg-12">
                  <div className="section-title text-center mb-55 wow fadeInDown">
                     <span className="sub-title"><Image src={icon} alt="icon" /> Image
                        Styles <Image src={icon} alt="icon" /></span>
                     <h2>Various Stylish AI-Generated Images</h2>
                     <p>In a few seconds, our A.I. will generate amazing results that<br />you can copy,
                        paste & publish. , write creatively</p>
                  </div>
               </div>
            </div>
            <div className="ac-isotope">
               <div className="row">
                  <div className="col-lg-12">
                     <div className="filter-nav text-center mb-50 wow fadeInUp">
                        <ul className="filter-nav-items">
                           <li className={selectedFilter === "*" ? "active" : ""} onClick={handleFilterKeyChange("*")}>All</li>
                           <li className={selectedFilter === "realistic" ? "active" : ""} onClick={handleFilterKeyChange("realistic")}>Realistic</li>
                           <li className={selectedFilter === "threed" ? "active" : ""} onClick={handleFilterKeyChange("threed")}>3D</li>
                           <li className={selectedFilter === "illustration" ? "active" : ""} onClick={handleFilterKeyChange("illustration")}>illustration</li>
                           <li className={selectedFilter === "cartoon" ? "active" : ""} onClick={handleFilterKeyChange("cartoon")}>Cartoon</li>
                           <li className={selectedFilter === "cyberpunk" ? "active" : ""} onClick={handleFilterKeyChange("cyberpunk")}>Cyberpunk</li>
                           <li className={selectedFilter === "oil" ? "active" : ""} onClick={handleFilterKeyChange("oil")}>Oil Painting</li>
                        </ul>
                     </div>
                  </div>
               </div>
               <div className="isotope-wrapper row isotope-grid  wow fadeInDown">
                  {gallery_data.filter((items) => items.page === "home_2").map((item) => (
                     <div key={item.id} className={`col-lg-3 col-sm-12 ${item.category} isotope-filter-item`}>
                        <div className="gallery-item">
                           {item.img.map((img, i) => (
                              <div key={i} className="gallery-img  mb-20">
                                 <Image src={img} alt="gallery image" />
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>
   )
}

export default Gallery
