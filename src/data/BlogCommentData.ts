import { BlogCommentItem } from "@/types/data";
import { createIdIndex } from "@/utils/dataIndex";

import comment_1 from "@/assets/images/blog/comment-1.jpg";
import comment_2 from "@/assets/images/blog/comment-2.jpg";

const blogComments: BlogCommentItem[] = [
  {
    id: 1,
    blogId: 1,
    avatar: comment_1,
    name: "Martin Kukish",
    date: "2023-08-27",
    content: "amet porta metus. Cras a mivel odio mollis maximus non at nibhprofessor at Hampden-Sydney College in Virginia, looked up one of more obscure Latin words, consectetur It is a long established fact that a reader",
  },
  {
    id: 2,
    blogId: 1,
    avatar: comment_2,
    name: "Wade Warren",
    date: "2023-08-27",
    content: "amet porta metus. Cras a mivel odio mollis maximus non at nibhprofessor at Hampden-Sydney College in Virginia, looked up one of more obscure Latin words, consectetur It is a long established fact that a reader",
  },
];

export default blogComments;
export const blogCommentByBlogId = createIdIndex(blogComments);
