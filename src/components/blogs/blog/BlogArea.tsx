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
import { blogCategoryById } from "@/data/BlogCategoryData"
import Skeleton from "@/components/ui/Skeleton"
import { filterBlogPosts, type BlogFilterCriteria } from "@/utils/blogFilters"
import BookmarkButton from "@/components/common/BookmarkButton"
import SocialShareButtons from "@/components/common/SocialShareButtons"

const BlogSidebar = dynamic(() => import("../blog-sidebar/BlogSidebar"), {
  loading: () => (
    <div className="col-xl-4">
      <div className="sidebar-wrapper">
        <Skeleton variant="text" height={30} className="mb-4" />
        <Skeleton variant="rectangular" height={200} className="mb-4" />
        <Skeleton variant="text" count={3} className="mb-2" />
      </div>
    </div>
  )
})

const ExportButton = dynamic(() => import("@/components/common/ExportButton"))

const BlogArea = React.memo(() => {
   const router = useRouter()
 
   const [searchQuery, setSearchQuery] = useState("")
   const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
   const [selectedTagId, setSelectedTagId] = useState<number | null>(null)
   
   const itemsPerPage = 3;
 
     const filterCriteria: BlogFilterCriteria = useMemo(() => ({
       searchQuery,
       categoryId: selectedCategory,
       tagId: selectedTagId,
       status: 'published',
     }), [searchQuery, selectedCategory, selectedTagId])

     const { filteredPosts, hasFilters } = useMemo(() => {
      return filterBlogPosts(inner_blog_data, filterCriteria)
    }, [filterCriteria])

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

     const handleCategoryChange = useCallback((categoryId: number | null) => {
       setSelectedCategory(categoryId)
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
                      {hasFilters && (
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
                                      Kategori: {blogCategoryById.get(selectedCategory)?.name}
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
                            <div className="filter-actions">
                               <button onClick={handleClearAllFilters} className="clear-all-btn">
                                  Hapus Semua Filter
                               </button>
                               <ExportButton
                                 posts={filteredPosts}
                                 filterCriteria={filterCriteria}
                                 buttonClassName="export-btn"
                               />
                            </div>
                         </div>
                      )}

                     {filteredPosts.length === 0 ? (
                        <div className="no-results">
                           <h3>Tidak ada hasil ditemukan</h3>
                           <p>Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
                            {hasFilters && (
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
                                            <BookmarkButton
                                               postId={item.id.toString()}
                                               postTitle={item.title}
                                               postTags={item.tagId ? [tagsById.get(item.tagId)?.name ?? ''] : []}
                                               className="bookmark-btn"
                                            />
                                            <div className="share-btn"><i className="flaticon-share"></i></div>
                                            <SocialShareButtons
                                               title={item.title}
                                               url={`/blog-details?id=${item.id}`}
                                            />
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
