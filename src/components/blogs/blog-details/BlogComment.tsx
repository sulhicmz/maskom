import Image from "next/image"
import Link from "next/link"

import comment_1 from "@/assets/images/blog/comment-1.jpg"
import comment_2 from "@/assets/images/blog/comment-2.jpg"

const BlogComment = () => {
   return (
      <div className="ac-postbox_comment mb-55 wow fadeInUp">
         <h3 className="ac-comment-title">2 Comments</h3>
         <ul>
            <li>
               <div className="ac-postbox__comment-box">
                  <div className="ac-postbox__comment-info d-flex">
                     <div className="ac-postbox__comment-avater mr-25">
                        <Image src={comment_1} alt="" />
                     </div>
                     <div className="ac-postbox__comment-name">
                        <h5>Martin Kukish</h5>
                        <span className="post-meta">27 Aug, 2023</span>
                     </div>
                  </div>
                  <div className="ac-postbox__comment-text">
                     <p>amet porta metus. Cras a mivel odio mollis maximus non at
                        nibhprofessor at Hampden-Sydney College in Virginia, looked
                        up one of the more obscure Latin words, consectetur It is a
                        long established fact that a reader
                     </p>
                     <div className="ac-postbox__comment-reply">
                        <Link href="#">Reply</Link>
                     </div>
                  </div>
               </div>
            </li>
            <li className="children">
               <div className="ac-postbox__comment-box">
                  <div className="ac-postbox__comment-info d-flex">
                     <div className="ac-postbox__comment-avater mr-20">
                        <Image src={comment_2} alt="" />
                     </div>
                     <div className="ac-postbox__comment-name">
                        <h5>Wade Warren</h5>
                        <span className="post-meta">27 Aug, 2023</span>
                     </div>
                  </div>
                  <div className="ac-postbox__comment-text">
                     <p>amet porta metus. Cras a mivel odio mollis maximus non at
                        nibhprofessor at Hampden-Sydney College in Virginia, looked
                        up one of the more obscure Latin words, consectetur It is a
                        long established fact that a reader
                     </p>
                     <div className="ac-postbox__comment-reply">
                        <Link href="#">Reply</Link>
                     </div>
                  </div>
               </div>
            </li>
         </ul>
      </div>
   )
}

export default BlogComment
