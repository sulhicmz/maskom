"use client"
import React from "react"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import inner_blog_data from "@/data/InnerBlogData"
import { usePagination } from "@/hooks/usePagination"
import AnimationWrapper from "@/components/common/AnimationWrapper"
import PaginationWrapper from "@/components/common/PaginationWrapper"
import { formatBlogDate } from "@/utils/dateFormat"
import { tagsById } from "@/data/BlogTagData"

const BlogSidebar = dynamic(() => import("../blog-sidebar/BlogSidebar"), {
  loading: () => <div className="col-xl-4"><div className="sidebar-wrapper">Loading sidebar...</div></div>
})

const BlogArea = () => {

   const itemsPerPage = 3;

   const { currentItems, pageCount, handlePageClick } = usePagination({
      data: inner_blog_data,
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
                      <PaginationWrapper
                         pageCount={pageCount}
                         onPageChange={handlePageClick}
                         pageRangeDisplayed={3}
                      />
                   </div>
                </div>
                <BlogSidebar />
             </div>
          </div>
       </section>
   )
}

export default BlogArea
