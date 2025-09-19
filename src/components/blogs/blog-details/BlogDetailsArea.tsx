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
                           <h3 className="title">{single_blog?.title ? single_blog.title : "Announces AI Consortium to Shape US Police"}</h3>
                           <div className="post-meta mb-35">
                              <span><Link href="#"><i className="far fa-calendar-alt"></i>23
                                 Nov,2023</Link></span>
                              <span><Link href="#"><i className="far fa-user-circle"></i>Aslia
                                 gumas</Link></span>
                              <span><Link href=""><i className="far fa-tag"></i>AI, Video
                                 Generator</Link></span>
                           </div>
                           <p>Scuba drive are made out of photovoltaic cells that convert the sun’s
                              energy into elect Photovoltaic cells are sandwiched between layers of
                              semi-conducting materials such as silicon. Each layer has different
                              electronic properties that energise. Forttitor auctor dapibus. Mauris
                              tempor tortor non consectetur luctus. Ut sit amet porta metus. Cras a
                              mivel odio mollis maximus non at nibhprofessor at Hampden-Sydney College
                              in Virginia, looked up one of the more obscure Latin words, consectetur
                              It is a long established fact that a reader will be distracted by the
                              readable content of a page when looking at its layout. </p>
                           <p>Each layer has different electronic properties that energise. Forttitor
                              auctor dapibus. Mauris tempor tortor non consectetur luctus. Ut sit amet
                              porta metus. Cras a mivel odio mollis maximus non at nibhprofessor at
                              Hampden-Sydney College in Virginia, looked up one of the.</p>
                           <blockquote className="mb-35">
                              <div className="quote mb-15">
                                 <Image src={quote} alt="right quote" />
                              </div>
                              <p>This response is important for our ability to learn from mistakes,
                                 but it sogives rise to self-criticism, because it is part of the
                                 threat from our first instances of social rejection ridicule. We
                                 quickly learn</p>
                              <cite>Leslie Alexander</cite>
                           </blockquote>
                           <h4>AI Consortium to Shape </h4>
                           <p>One touch of a red-hot stove is usually all we need to avoid that kind of
                              discomfort in quis elit future. The same Duis aute irure dolor in
                              reprehenderit .</p>
                           <ul className="check-list style-one mb-25">
                              <li><i className="flaticon-check"></i>Find the problem first</li>
                              <li><i className="flaticon-check"></i>Make research for AI Video Generator.
                              </li>
                              <li><i className="flaticon-check"></i>Finalise the solution & apply.</li>
                           </ul>
                           <p>Each layer has different electronic properties that energise. Forttitor
                              auctor dapibus. Mauris tempor tortor non consectetur luctus. Ut sit amet
                              porta metus. Cras a mivel odio mollis maximus non at nibhprofessor at
                              Hampden</p>
                           <figure>
                              <Image src={thumb_2} alt="post thumbnail" />
                           </figure>
                           <p>Each layer has different electronic properties that energise. Forttitor
                              auctor dapibus. Mauris tempor tortor non consectetur luctus. Ut sit amet
                              porta metus. Cras a mivel odio mollis maximus non at nibhprofessor at
                              Hampden-Sydney College in Virginia, looked up one of the more obscure
                              Latin words, consectetur It is a long established fact that a reader
                              will be distracted by the readable content of a page when looking at its
                              layout. </p>
                           <div className="ac-postbox-tag">
                              <div className="ac-postbox-cats d-flex">
                                 <span><i className="flaticon-price-tag"></i></span>
                                 <Link href="#">AI,</Link>
                                 <Link href="#"> Video Generator</Link>
                              </div>
                              <div className="ac-postbox-tags">
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

                     <div
                        className="ac-post-navigation d-flex align-items-center justify-content-between wow fadeInUp mb-30">
                        <div className="prev-post post-nav mb-20">
                           <Link href="/blog-details" className="theme-btn gradient-btn">Previous Post</Link>
                        </div>
                        <div className="next-post post-nav mb-20">
                           <Link href="/blog-details" className="theme-btn gradient-btn">Next Post</Link>
                        </div>
                     </div>


                     <div className="ac-comments_respond wow fadeInUp">
                        <h3 className="comments-heading">Leave a Reply</h3>
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
