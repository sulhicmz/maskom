/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState } from "react";
import ReactPaginate from "react-paginate";
import team_data from "@/data/TeamData"
import Image from "next/image"
import Link from "next/link"

const TeamArea = () => {

   const team = team_data;

   const itemsPerPage = 8;
   const [itemOffset, setItemOffset] = useState(0);
   const endOffset = itemOffset + itemsPerPage;
   const currentItems = team.slice(itemOffset, endOffset);
   const pageCount = Math.ceil(team.length / itemsPerPage);
   // click to request another page.
   const handlePageClick = (event: any) => {
      const newOffset = (event.selected * itemsPerPage) % team.length;
      setItemOffset(newOffset);
   };

   return (
      <section className="team-section pt-120 pb-120">
         <div className="container">
            <div className="row">
               {currentItems.map((item) => (
                  <div key={item.id} className="col-xl-3 col-md-6 col-sm-12">
                     <div className="team-item style-one mb-30 wow fadeInUp">
                        <div className="member-image">
                           <Image src={item.img} alt="Member Image" />
                        </div>
                        <div className="member-info">
                           <div className="content">
                              <h4><a href="team-details.html">{item.title}</a></h4>
                              <span className="position">{item.designation}</span>
                           </div>
                           <div className="share-button">
                              <div className="icon">
                                 <i className="flaticon-plus-positive-add-mathematical-symbol"></i>
                              </div>
                              <ul className="social-link">
                                 <li><Link href="#"><i className="fab fa-facebook-f"></i></Link></li>
                                 <li><Link href="#"><i className="fab fa-twitter"></i></Link></li>
                                 <li><Link href="#"><i className="fab fa-linkedin-in"></i></Link></li>
                                 <li><Link href="#"><i className="fab fa-instagram"></i></Link></li>
                              </ul>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
            <div className="row">
               <div className="col-lg-12">
                  <div className="ac-pagination text-center mt-30 wow fadeInUp">
                     <nav>
                        <ReactPaginate
                           breakLabel="..."
                           nextLabel={<i className="far fa-angle-right"></i>}
                           onPageChange={handlePageClick}
                           pageRangeDisplayed={3}
                           pageCount={pageCount}
                           previousLabel={<i className="far fa-angle-left"></i>}
                           renderOnZeroPageCount={null}
                        />
                     </nav>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default TeamArea
