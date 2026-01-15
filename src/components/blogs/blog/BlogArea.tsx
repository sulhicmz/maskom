"use client"
import React, { useState, useMemo, useCallback, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import inner_blog_data from "@/data/InnerBlogData"
import { usePagination } from "@/hooks/usePagination"
import AnimationWrapper from "@/components/common/AnimationWrapper"
import PaginationWrapper from "@/components/common/PaginationWrapper"
import { formatBlogDate } from "@/utils/dateFormat"
import { tagsById } from "@/data/BlogTagData"

const BlogSidebar = dynamic(() => import("../blog-sidebar/BlogSidebar"), {
  loading: () => <div className="col-xl-4"><div className="sidebar-wrapper">Loading sidebar...</div></div>
})

const BlogArea = React.memo(() => {
   const router = useRouter()

   const [searchQuery, setSearchQuery] = useState("")
   const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
   const [selectedTagId, setSelectedTagId] = useState<number | null>(null)

   const itemsPerPage = 3;

   const filteredPosts = useMemo(() => {
      return inner_blog_data.filter((post) => {
         const matchesSearch = !searchQuery || 
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.desc.toLowerCase().includes(searchQuery.toLowerCase())

         const matchesCategory = !selectedCategory || post.category === selectedCategory
         const matchesTag = !selectedTagId || post.tagId === selectedTagId

         return matchesSearch && matchesCategory && matchesTag
      })
   }, [searchQuery, selectedCategory, selectedTagId])

   const { currentItems, pageCount, handlePageClick } = usePagination({
      data: filteredPosts,
      itemsPerPage,
   })

   const handleClearAllFilters = useCallback(() => {
      setSearchQuery("")
      setSelectedCategory(null)
      setSelectedTagId(null)
      router.push("/blog")
   }, [router])

   const handleCategoryChange = useCallback((category: string | null) => {
      setSelectedCategory(category)
   }, [])

   const handleTagClick = useCallback((tagId: number | null) => {
      setSelectedTagId(tagId)
   }, [])

   return (
      <section className="blogs-section pt-120 pb-90">
         <div className="container">
            <div className="row">
               <div className="col-xl-8">
                  <div className="blogs-wrapper mb-30">
                     {(searchQuery || selectedCategory || selectedTagId) && (
                        <div className="filter-status mb-30">
                           <h4 className="filter-title">Filter Aktif:</h4>
                           <div className="filter-tags">
                               {searchQuery && (
                                  <span className="filter-tag">
                                     Pencarian: &quot;{searchQuery}&quot;
                                     <button onClick={() => setSearchQuery("")} aria-label="Hapus pencarian">×</button>
                                  </span>
                               )}
                              {selectedCategory && (
                                 <span className="filter-tag">
                                    Kategori: {selectedCategory}
                                    <button onClick={() => setSelectedCategory(null)} aria-label="Hapus filter kategori">×</button>
                                 </span>
                              )}
                              {selectedTagId && (
                                 <span className="filter-tag">
                                    Tag: {tagsById.get(selectedTagId)?.name}
                                    <button onClick={() => setSelectedTagId(null)} aria-label="Hapus filter tag">×</button>
                                 </span>
                              )}
                           </div>
                           <button onClick={handleClearAllFilters} className="clear-all-btn">
                              Hapus Semua Filter
                           </button>
                        </div>
                     )}

                     {filteredPosts.length === 0 ? (
                        <div className="no-results">
                           <h3>Tidak ada hasil ditemukan</h3>
                           <p>Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
                           {searchQuery || selectedCategory || selectedTagId && (
                              <button onClick={handleClearAllFilters} className="clear-all-btn">
                                 Hapus Semua Filter
                              </button>
                           )}
                        </div>
                     ) : (
                        <>
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
                        </>
                     )}
                  </div>
               </div>
                <Suspense fallback={<div className="col-xl-4"><div className="sidebar-wrapper">Loading sidebar...</div></div>}>
                  <BlogSidebar 
                     selectedCategory={selectedCategory}
                     onCategoryChange={handleCategoryChange}
                     selectedTagId={selectedTagId}
                     onTagClick={handleTagClick}
                     searchValue={searchQuery}
                     onSearchChange={setSearchQuery}
                  />
                </Suspense>
             </div>
          </div>
       </section>
    )
});

BlogArea.displayName = "BlogArea"

export default BlogArea
