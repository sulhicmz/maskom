import Image from "next/image"
import Link from "next/link"
import blog_data from "@/data/BlogData"

import shape_1 from "@/assets/images/shape/bl-1.png"
import shape_2 from "@/assets/images/shape/bl-2.png"
import icon from "@/assets/images/icon/sub-icon.png"

const Blog = () => {
   return (
      <section className="blogs-section">
         <div className="blog-bg-wrapper pt-120 pb-75">
            <div className="shape shape-one"><span><Image src={shape_1} alt="shape" /></span>
            </div>
            <div className="shape shape-two"><span><Image src={shape_2} alt="shape" /></span>
            </div>
            <div className="container">
               <div className="row">
                  <div className="col-lg-4">
                     <div className="row">
                        <div className="col-lg-12">
                           <div className="section-content-box mb-40 wow fadeInUp">
                              <div className="section-title mb-50">
                                 <span className="sub-title"><Image src={icon} alt="icon" />Latest Blog Post</span>
                                 <h2>Latest News and Articles</h2>
                                 <p>In a few seconds, our A.I. will generate amazing <br /> results
                                    that you can copy, paste & publish. , write <br /> creatively</p>
                              </div>
                              <Link href="/blogs" className="theme-btn style-one">View All Blog Post</Link>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="col-lg-8">
                     <div className="row">
                        {blog_data.filter((items) => items.page === "home_2").map((item) => (
                           <div key={item.id} className="col-lg-6">
                              <div className="blog-post-item style-one mb-40 wow fadeInUp">
                                 <div className="post-thumbnail">
                                    <Link href="/blog-details"><Image src={item.thumb}
                                       alt="post post-thumbnail" /></Link>
                                    <div className="post-categories">
                                       <Link href="#">{item.tag}</Link>
                                    </div>
                                 </div>
                                 <div className="post-content">
                                    <div className="entry-content">
                                       <h3 className="title"><Link href="/blog-details">{item.title}</Link></h3>
                                       <div className="post-meta style-one">
                                          <span><Link href="#"><i className="far fa-calendar-alt"></i>{item.tag}</Link></span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>
   )
}

export default Blog
