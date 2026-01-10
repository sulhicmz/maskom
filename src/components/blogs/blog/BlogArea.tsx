"use client"
import Image from "next/image"
import Link from "next/link"
import ReactPaginate from "react-paginate";
import dynamic from "next/dynamic"
import inner_blog_data from "@/data/InnerBlogData"
import { usePagination } from "@/hooks/usePagination"

const BlogSidebar = dynamic(() => import("../blog-sidebar/BlogSidebar"), {
  loading: () => <div className="col-xl-4"><div className="sidebar-wrapper">Loading sidebar...</div></div>
})

const BlogArea = () => {

   const blog = inner_blog_data;
   const itemsPerPage = 3;

   const { currentItems, pageCount, handlePageClick } = usePagination({
      data: blog,
      itemsPerPage,
   });

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
                                 <Link href="/blog-details" className="read-more style-one"><span>BACA SELENGKAPNYA</span></Link>
                              </div>
                              <div className="post-meta-wrap">
                               <div className="post-meta">
                                  <span><time><i className="flaticon-clock"></i>{item.date}</time></span>
                                  <span><span><i className="flaticon-user-2"></i>{item.user}</span></span>
                                  <span><span><i className="flaticon-price-tag"></i>{item.tag}</span></span>
                               </div>
                                 <div className="post-share">
                                    <div className="share-btn"><i className="flaticon-share"></i></div>
                                     <ul className="social-link">
                                        <li><button type="button" aria-label="Share on Facebook"><i className="fab fa-facebook-f"></i></button></li>
                                        <li><button type="button" aria-label="Share on Twitter"><i className="fab fa-twitter"></i></button></li>
                                        <li><button type="button" aria-label="Share on LinkedIn"><i className="fab fa-linkedin-in"></i></button></li>
                                        <li><button type="button" aria-label="Share on Instagram"><i className="fab fa-instagram"></i></button></li>
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
