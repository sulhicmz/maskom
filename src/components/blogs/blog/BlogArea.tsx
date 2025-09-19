/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react";
import ReactPaginate from "react-paginate";
import inner_blog_data from "@/data/InnerBlogData"
import BlogSidebar from "../blog-sidebar/BlogSidebar"

const BlogArea = () => {

   const blog = inner_blog_data;

   const itemsPerPage = 3;
   const [itemOffset, setItemOffset] = useState(0);
   const endOffset = itemOffset + itemsPerPage;
   const currentItems = blog.slice(itemOffset, endOffset);
   const pageCount = Math.ceil(blog.length / itemsPerPage);
   // click to request another page.
   const handlePageClick = (event: any) => {
      const newOffset = (event.selected * itemsPerPage) % blog.length;
      setItemOffset(newOffset);
   };

   return (
      <section className="blogs-section pt-120 pb-90">
         <div className="container">
            <div className="row">
               <div className="col-xl-8">
                  <div className="blogs-wrapper mb-30">
                     {currentItems.map((item) => (
                        <article key={item.id} className="blog-post-item style-two mb-60 wow fadeInUp">
                           <div className="post-thumbnail">
                              <Link href="/blog-details"><Image src={item.thumb} alt="post post-thumbnail" /></Link>
                           </div>
                           <div className="post-content">
                              <div className="entry-content">
                                 <h3 className="title"><Link href="/blog-details">{item.title}</Link></h3>
                                 <p>{item.desc}</p>
                                 <Link href="/blog-details" className="read-more style-one"><span>READ MORE</span></Link>
                              </div>
                              <div className="post-meta-wrap">
                                 <div className="post-meta">
                                    <span><Link href="#"><i className="flaticon-clock"></i>{item.date}</Link></span>
                                    <span><Link href="#"><i className="flaticon-user-2"></i>{item.user}</Link></span>
                                    <span><Link href="#"><i className="flaticon-price-tag"></i>{item.tag}</Link></span>
                                 </div>
                                 <div className="post-share">
                                    <div className="share-btn"><i className="flaticon-share"></i></div>
                                    <ul className="social-link">
                                       <li><Link href="#"><i className="fab fa-facebook-f"></i></Link></li>
                                       <li><Link href="#"><i className="fab fa-twitter"></i></Link></li>
                                       <li><Link href="#"><i className="fab fa-linkedin-in"></i></Link></li>
                                       <li><Link href="#"><i className="fab fa-instagram"></i></Link></li>
                                    </ul>
                                 </div>
                              </div>
                           </div>
                        </article>
                     ))}
                     <div className="ac-pagination">
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
               <BlogSidebar />
            </div>
         </div>
      </section>
   )
}

export default BlogArea
