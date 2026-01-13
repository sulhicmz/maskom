import Image from "next/image";
import { BlogCommentItem } from "@/types/data";
import { formatCommentDate } from "@/utils/dateFormat";
import { useMemo } from "react";
import React from "react";

interface BlogCommentProps {
  comments: BlogCommentItem[];
}

const BlogComment = ({ comments }: BlogCommentProps) => {
   const formattedComments = useMemo(() => (
      comments.map((comment, index) => ({
         ...comment,
         formattedDate: formatCommentDate(comment.date),
         hasChildren: index > 0
      }))
   ), [comments]);

   return (
      <div className="ac-postbox_comment mb-55 wow fadeInUp">
         <h3 className="ac-comment-title">{comments.length} Comments</h3>
         <ul>
            {formattedComments.map((comment) => (
               <li key={comment.id} className={comment.hasChildren ? "children" : ""}>
                  <div className="ac-postbox__comment-box">
                     <div className="ac-postbox__comment-info d-flex">
                        <div className="ac-postbox__comment-avater mr-25">
                           <Image src={comment.avatar} alt={`Avatar ${comment.name}`} />
                        </div>
                        <div className="ac-postbox__comment-name">
                           <h5>{comment.name}</h5>
                           <span className="post-meta">{comment.formattedDate}</span>
                        </div>
                     </div>
                     <div className="ac-postbox__comment-text">
                        <p>{comment.content}</p>
                        <div className="ac-postbox__comment-reply">
                           <button type="button">Reply</button>
                        </div>
                     </div>
                  </div>
               </li>
            ))}
          </ul>
       </div>
     );
}

export default React.memo(BlogComment)
