/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import Image from "next/image"
import Link from "next/link"
import BlogForm from "@/components/forms/BlogForm"
import BlogSidebar from "../blog-sidebar/BlogSidebar"

import blog_thumb from "@/assets/images/blog/blog-single-1.jpg"
import quote from "@/assets/images/icon/right-quote.png"
import thumb_2 from "@/assets/images/blog/blog-single-2.jpg"

const BlogDetailsArea = ({ single_blog }: any) => {
   return (
      <section className="blog-details-section pt-120 pb-80">
         <div className="container">
            <div className="row">
               <div className="col-xl-8">
                  <div className="blog-details-wrapper mb-30">
                     <article className="blog-post-item mb-60">
                        <div className="post-thumbnail wow fadeInDown">
                           {single_blog?.thumb ? <Image src={single_blog.thumb} alt="image" /> : <Image src={blog_thumb} alt="image" />}
                        </div>
                        <div className="post-content wow fadeInUp">
                           <h3 className="title">{single_blog?.title ? single_blog.title : "Strategi Maskom menjaga pengalaman pelanggan omni-channel"}</h3>
                           <div className="post-meta mb-35">
                              <span><Link href="#"><i className="far fa-calendar-alt"></i>15
                                 Mar 2024</Link></span>
                              <span><Link href="#"><i className="far fa-user-circle"></i>{single_blog?.user ?? "Tim Editorial Maskom"}</Link></span>
                              <span><Link href=""><i className="far fa-tag"></i>{single_blog?.tag ?? "Managed Service"}</Link></span>
                           </div>
                           <p>Maskom mendampingi jaringan retail nasional dalam menjaga konsistensi pengalaman pelanggan antara toko fisik dan kanal digital. Seluruh kasir, aplikasi loyalty, layanan click & collect, hingga dashboard manajemen dihubungkan melalui jaringan managed service yang dipantau 24/7.</p>
                           <p>Dengan pendekatan tersebut, tim IT pelanggan tidak lagi mengelola perangkat secara manual per gerai. Maskom menghadirkan otomatisasi konfigurasi, segmentasi VLAN, serta laporan kesehatan jaringan yang dapat diakses kapan saja melalui portal pelanggan.</p>
                           <blockquote className="mb-35">
                              <div className="quote mb-15">
                                 <Image src={quote} alt="right quote" />
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
                                 <Link href="#">Managed Service,</Link>
                                 <Link href="#"> Konektivitas</Link>
                              </div>
                              <div className="ac-postbox-tags">
                                 <div className="share-btn"><i className="flaticon-share"></i></div>
                                 <ul className="social-link">
                                    <li><Link href="https://www.linkedin.com/company/maskom-network" target="_blank" rel="noreferrer"><i className="fab fa-linkedin-in"></i></Link></li>
                                    <li><Link href="https://www.instagram.com/maskomnetwork" target="_blank" rel="noreferrer"><i className="fab fa-instagram"></i></Link></li>
                                    <li><Link href="mailto:sales@maskom.co.id"><i className="far fa-envelope"></i></Link></li>
                                    <li><Link href="https://wa.me/628170006625" target="_blank" rel="noreferrer"><i className="fab fa-whatsapp"></i></Link></li>
                                 </ul>
                              </div>
                           </div>
                        </div>
                     </article>

                     <div
                        className="ac-post-navigation d-flex align-items-center justify-content-between wow fadeInUp mb-30">
                        <div className="prev-post post-nav mb-20">
                           <Link href="/blog-details" className="theme-btn gradient-btn">Artikel Sebelumnya</Link>
                        </div>
                        <div className="next-post post-nav mb-20">
                           <Link href="/blog-details" className="theme-btn gradient-btn">Artikel Selanjutnya</Link>
                        </div>
                     </div>


                     <div className="ac-comments_respond wow fadeInUp">
                        <h3 className="comments-heading">Tinggalkan Komentar</h3>
                        <BlogForm />
                     </div>
                  </div>
               </div>
               <BlogSidebar />
            </div>
         </div>
      </section>
   )
}

export default BlogDetailsArea
