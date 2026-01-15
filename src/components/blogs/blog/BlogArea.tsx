"use client"
import React, { useState, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import inner_blog_data from "@/data/InnerBlogData"
import { usePagination } from "@/hooks/usePagination"
import AnimationWrapper from "@/components/common/AnimationWrapper"
import PaginationWrapper from "@/components/common/PaginationWrapper"
import { formatBlogDate } from "@/utils/dateFormat"
import { tagsById } from "@/data/BlogTagData"
import BlogSearch from "./BlogSearch"
import BlogCategoryFilter from "./BlogCategoryFilter"
import Tags from "../blog-sidebar/Tags"

const BlogArea = React.memo(() => {
   const [searchQuery, setSearchQuery] = useState("")
   const [selectedCategory, setSelectedCategory] = useState("")
   const [selectedTagId, setSelectedTagId] = useState<number | null>(null)

   const itemsPerPage = 3;

   const filteredData = useMemo(() => {
      return inner_blog_data.filter((post) => {
         const matchesSearch =
            searchQuery === "" ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.desc.toLowerCase().includes(searchQuery.toLowerCase())

         const matchesCategory = selectedCategory === ""

         const matchesTag = selectedTagId === null || post.tagId === selectedTagId

         return matchesSearch && matchesCategory && matchesTag
      })
   }, [searchQuery, selectedCategory, selectedTagId])

   const { currentItems, pageCount, handlePageClick } = usePagination({
      data: filteredData,
      itemsPerPage,
   });

   const handleClearAllFilters = () => {
      setSearchQuery("")
      setSelectedCategory("")
      setSelectedTagId(null)
   }

   return (
      <section className="blogs-section pt-120 pb-90">
         <div className="container">
            <div className="row">
               <div className="col-xl-8">
                  <div className="blogs-wrapper mb-30">
                     {(searchQuery || selectedCategory || selectedTagId) && (
                        <div className="filter-status mb-30">
                           <span>Hasil pencarian: <strong>{filteredData.length} artikel</strong></span>
                           <button
                              type="button"
                              onClick={handleClearAllFilters}
                              className="clear-all-filters"
                           >
                              Hapus Semua Filter
                           </button>
                        </div>
                     )}
                     {currentItems.length > 0 ? (
                        currentItems.map((item) => (
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
                     ))
                     ) : (
                        <div className="no-results">
                           <h3>Tidak ada hasil ditemukan</h3>
                           <p>Coba ubah kata kunci pencarian atau filter kategori/tag.</p>
                        </div>
                     )}
                     {currentItems.length > 0 && (
                        <PaginationWrapper
                         pageCount={pageCount}
                         onPageChange={handlePageClick}
                           pageRangeDisplayed={3}
                        />
                     )}
                  </div>
               </div>
               <div className="col-xl-4">
                  <div className="sidebar-wrapper">
                     <BlogSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
                     <BlogCategoryFilter
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                     />
                     <Tags selectedTagId={selectedTagId} onTagClick={setSelectedTagId} />
                  </div>
               </div>
            </div>
         </div>
      </section>
    )
});

BlogArea.displayName = "BlogArea"

export default BlogArea
