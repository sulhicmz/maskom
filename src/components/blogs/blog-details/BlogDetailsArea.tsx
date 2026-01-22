"use client"
import Image from "next/image"
import Link from "next/link"
import { Suspense, useMemo, useState, useEffect } from "react"
import BlogSidebar from "../blog-sidebar/BlogSidebar"
import { InnerBlogPost, BlogCommentItem } from "@/types/data"
import { tagsById } from "@/data/BlogTagData"
import BookmarkButton from "@/components/common/BookmarkButton"
import SocialShareButtons from "@/components/common/SocialShareButtons"
import CommentList from "../comments/CommentList"
import CommentForm from "../comments/CommentForm"

import blog_thumb from "@/assets/images/blog/blog-single-1.jpg"
import quote from "@/assets/images/icon/right-quote.png"
import thumb_2 from "@/assets/images/blog/blog-single-2.jpg"

const BlogDetailsArea = ({ single_blog }: { single_blog?: InnerBlogPost }) => {
   const [blogCommentData, setBlogCommentData] = useState<BlogCommentItem[]>([])

   useEffect(() => {
      const loadData = async () => {
         try {
            const dataModule = await import('@/data/BlogCommentData')
            setBlogCommentData(dataModule.default as BlogCommentItem[])
         } catch (error) {
            console.error('Failed to load blog comment data:', error)
         }
      }
      loadData()
   }, [])

   const tag = single_blog?.tagId ? tagsById.get(single_blog.tagId)?.name : null;

   const filteredComments = useMemo(() => {
      if (!single_blog?.id) return [];
      return blogCommentData.filter((comment: BlogCommentItem) => comment.blogId === single_blog.id);
    }, [single_blog?.id, blogCommentData]);

   return (
       <section className="blog-details-section pt-120 pb-80">
         <div className="container">
            <div className="row">
               <div className="col-xl-8">
                   <div className="blog-details-wrapper mb-30">
                      <article className="blog-post-item mb-60">
                         <div className="post-thumbnail wow fadeInDown">
                            {single_blog?.thumb ? <Image src={single_blog.thumb} alt={`Thumbnail gambar artikel: ${single_blog.title}`} /> : <Image src={blog_thumb} alt="Thumbnail gambar placeholder: Artikel Maskom" />}
                         </div>
                        <div className="post-content wow fadeInUp">
                           <div className="bookmark-header d-flex align-items-center justify-content-between mb-3">
                              <h3 className="title mb-0">{single_blog?.title ? single_blog.title : "Strategi Maskom menjaga pengalaman pelanggan omni-channel"}</h3>
                              {single_blog?.id && (
                                 <BookmarkButton
                                    postId={single_blog.id.toString()}
                                    postTitle={single_blog.title}
                                    postTags={tag ? [tag] : []}
                                    className="bookmark-btn-detail"
                                 />
                              )}
                           </div>
                              <div className="post-meta mb-35">
                                 <time><i className="far fa-calendar-alt"></i>15
                                    Mar 2024</time>
                                 <span><i className="far fa-user-circle"></i>{single_blog?.user ?? "Tim Editorial Maskom"}</span>
                                 <span><i className="far fa-tag"></i>{tag ?? "Managed Service"}</span>
                              </div>
                           <p>Maskom mendampingi jaringan retail nasional dalam menjaga konsistensi pengalaman pelanggan antara toko fisik dan kanal digital. Seluruh kasir, aplikasi loyalty, layanan click & collect, hingga dashboard manajemen dihubungkan melalui jaringan managed service yang dipantau 24/7.</p>
                           <p>Dengan pendekatan tersebut, tim IT pelanggan tidak lagi mengelola perangkat secara manual per gerai. Maskom menghadirkan otomatisasi konfigurasi, segmentasi VLAN, serta laporan kesehatan jaringan yang dapat diakses kapan saja melalui portal pelanggan.</p>
                            <blockquote className="mb-35">
                               <div className="quote mb-15">
                                  <Image src={quote} alt="Tanda kutip dekoratif" />
                               </div>
                              <p>“Transparansi monitoring Maskom membuat tim kami bisa mendeteksi gejala penurunan layanan sebelum pelanggan merasakannya. Review bulanan bersama tim Maskom membantu kami berinovasi lebih cepat.”</p>
                              <cite>Head of IT Operations, Klien Retail</cite>
                           </blockquote>
                           <h4>Tiga fokus utama dalam menjaga pengalaman omni-channel</h4>
                           <p>Pada implementasi Maskom, kami membagi prioritas pekerjaan menjadi tiga area utama yang saling berkaitan. Pendekatan ini memastikan operasi digital berjalan stabil sekaligus mendukung inovasi bisnis pelanggan.</p>
                           <ul className="check-list style-one mb-25">
                              <li><i className="flaticon-check"></i>Menjamin konektivitas utama dan cadangan dengan SLA 99,7% di seluruh cabang.</li>
                              <li><i className="flaticon-check"></i>Menerapkan kebijakan keamanan berlapis mulai dari firewall, segmentasi jaringan, hingga kontrol akses perangkat.</li>
                              <li><i className="flaticon-check"></i>Menyediakan dukungan operasional terukur lengkap dengan playbook dan eskalasi multi-level.</li>
                           </ul>
                           <p>Melalui kombinasi desain arsitektur yang matang dan tim operasional yang responsif, pelanggan dapat fokus mengembangkan produk serta pengalaman pelanggan tanpa khawatir terhadap infrastruktur jaringan.</p>
                           <figure>
                              <Image src={thumb_2} alt="post thumbnail" />
                           </figure>
                           <p>Maskom secara berkala melakukan simulasi insiden, menguji cadangan koneksi, serta melakukan fine tuning kebijakan QoS sesuai pola lalu lintas terbaru. Ke depan, kami menyiapkan integrasi analitik untuk membaca tren perilaku pelanggan di dalam toko.</p>
                            <div className="ac-postbox-tag">
                               <div className="ac-postbox-cats d-flex">
                                  <span><i className="flaticon-price-tag"></i></span>
                                  <span>Managed Service,</span>
                                  <span> Konektivitas</span>
                               </div>
                                <div className="ac-postbox-tags">
                                   <div className="share-btn"><i className="flaticon-share"></i></div>
                                   <SocialShareButtons
                                      title={single_blog?.title}
                                      url={`/blog-details?id=${single_blog?.id}`}
                                   />
                                </div>
                            </div>
                        </div>
                     </article>

                      <div
                         className="ac-post-navigation d-flex align-items-center justify-content-between wow fadeInUp mb-30">
                        <div className="prev-post post-nav mb-20">
                           <Link href="/blog-details" className="theme-btn gradient-btn">Previous Post</Link>
                        </div>
                        <div className="next-post post-nav mb-20">
                           <Link href="/blog-details" className="theme-btn gradient-btn">Next Post</Link>
                        </div>
                     </div>

                     {single_blog?.id && filteredComments.length > 0 && (
                        <CommentList comments={filteredComments} blogId={single_blog.id} />
                     )}

                     <div className="ac-comments_respond wow fadeInUp">
                        <h3 className="comments-heading">Tinggalkan Balasan</h3>
                        {single_blog?.id && <CommentForm blogId={single_blog.id} />}
                     </div>
                  </div>
               </div>
                <Suspense fallback={<div className="col-xl-4"><div className="sidebar-wrapper">Loading sidebar...</div></div>}>
                  <BlogSidebar />
                </Suspense>
             </div>
          </div>
       </section>
   )
}

export default BlogDetailsArea
