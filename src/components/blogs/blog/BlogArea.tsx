"use client"
import React, { useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import inner_blog_data from "@/data/InnerBlogData"
import { usePagination } from "@/hooks/usePagination"
import AnimationWrapper from "@/components/common/AnimationWrapper"
import { formatBlogDate } from "@/utils/dateFormat"
import { tagsById } from "@/data/BlogTagData"

const ReactPaginate = dynamic(() => import("react-paginate"), {
  ssr: false,
  loading: () => <div className="ac-pagination"><nav><div className="text-muted">Memuat halaman...</div></nav></div>
})

const BlogSidebar = dynamic(() => import("../blog-sidebar/BlogSidebar"), {
  loading: () => <div className="col-xl-4"><div className="sidebar-wrapper">Loading sidebar...</div></div>
})

const BlogArea = () => {

   const blog = useMemo(() => inner_blog_data, []);
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
                        <AnimationWrapper key={item.id} animation="fadeInUp" className="blog-post-item style-two mb-60">
                            <div className="post-thumbnail">
                               <Link href="/blog-details"><Image src={item.thumb} alt={`Thumbnail gambar artikel: ${item.title}`} /></Link>
                            </div>
                           <div className="post-content">
                              <div className="entry-content">
                                 <h3 className="title"><Link href="/blog-details">{item.title}</Link></h3>
                                 <p>{item.desc}</p>
                                 <Link href="/blog-details" className="read-more style-one"><span>BACA SELENGKAPNYA</span></Link>
                              </div>
                               <div className="post-meta-wrap">
                                 <div className="post-meta">
                                    <span><time><i className="flaticon-clock"></i>{formatBlogDate(item.date)}</time></span>
                                    <span><span><i className="flaticon-user-2"></i>{item.user}</span></span>
                                     <span><span><i className="flaticon-price-tag"></i>{tagsById.get(item.tagId)?.name ?? ''}</span></span>
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
                        </AnimationWrapper>
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

export default React.memo(BlogArea)
