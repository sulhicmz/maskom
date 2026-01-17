import { render, screen, fireEvent } from "@testing-library/react";
import CommentList from "../CommentList";
import { BlogCommentItem, StaticImageData } from "@/types/data";
import blogComments from "@/data/BlogCommentData";

const mockAvatar: StaticImageData = {
   src: "/avatar.jpg",
   height: 50,
   width: 50,
   blurDataURL: "",
   blurWidth: 50,
   blurHeight: 50,
};

const mockComments: BlogCommentItem[] = [
   {
      id:1,
      blogId: 1,
      parentId: null,
      avatar: mockAvatar,
      name: "Test User 1",
      date: "2023-08-27",
      content: "This is a root comment",
      status: "approved",
      upvotes: 5,
      downvotes: 0,
   },
   {
      id: 2,
      blogId: 1,
      parentId: 1,
      avatar: mockAvatar,
      name: "Test User 2",
      date: "2023-08-27",
      content: "This is a reply comment",
      status: "approved",
      upvotes: 3,
      downvotes: 1,
   },
   {
      id: 3,
      blogId: 1,
      parentId: null,
      avatar: mockAvatar,
      name: "Test User 3",
      date: "2023-08-28",
      content: "This comment is pending moderation",
      status: "pending",
      upvotes: 0,
      downvotes: 0,
   },
   {
      id: 4,
      blogId: 1,
      parentId: null,
      avatar: mockAvatar,
      name: "Test User 4",
      date: "2023-08-28",
      content: "This comment was rejected",
      status: "rejected",
      upvotes: 0,
      downvotes: 0,
   },
];

describe("CommentList", () => {
   const defaultProps = {
      comments: mockComments,
      blogId: 1,
   };

   beforeEach(() => {
      jest.clearAllMocks();
   });

   describe("Rendering", () => {
      test("should render comment count heading", () => {
         render(<CommentList {...defaultProps} />);

         expect(screen.getByText("2 Komentar")).toBeInTheDocument();
      });

      test("should only show approved comments", () => {
         render(<CommentList {...defaultProps} />);

         expect(screen.getByText("This is a root comment")).toBeInTheDocument();
         expect(screen.getByText("This is a reply comment")).toBeInTheDocument();
         expect(screen.queryByText("This comment is pending moderation")).not.toBeInTheDocument();
         expect(screen.queryByText("This comment was rejected")).not.toBeInTheDocument();
      });

      test("should show no comments message when no approved comments", () => {
         const emptyComments = mockComments.map(c => ({ ...c, status: "pending" as const }));
         render(<CommentList comments={emptyComments} blogId={1} />);

         expect(screen.getByText(/belum ada komentar/i)).toBeInTheDocument();
      });

      test("should render comment avatars", () => {
         render(<CommentList {...defaultProps} />);

         const avatars = screen.getAllByAltText(/Avatar/);
         expect(avatars.length).toBe(2);
      });

      test("should render comment authors", () => {
         render(<CommentList {...defaultProps} />);

         expect(screen.getByText("Test User 1")).toBeInTheDocument();
         expect(screen.getByText("Test User 2")).toBeInTheDocument();
      });

      test("should render comment content", () => {
         render(<CommentList {...defaultProps} />);

         expect(screen.getByText("This is a root comment")).toBeInTheDocument();
         expect(screen.getByText("This is a reply comment")).toBeInTheDocument();
      });
   });

   describe("Threading", () => {
      test("should display reply comments as nested", () => {
         render(<CommentList {...defaultProps} />);

         const rootComment = screen.getByText("This is a root comment").closest(".comment-item");
         expect(rootComment).not.toHaveClass("comment-reply");

         const replyComment = screen.getByText("This is a reply comment").closest(".comment-item");
         expect(replyComment).toHaveClass("comment-reply");
      });

      test("should nest replies with proper indentation", () => {
         render(<CommentList {...defaultProps} />);

         const replyComment = screen.getByText("This is a reply comment").closest(".comment-reply");
         expect(replyComment).toHaveStyle({ marginLeft: "40px" });
      });
   });

    describe("Voting", () => {
       test("should render upvote and downvote buttons", () => {
          const { container } = render(<CommentList {...defaultProps} />);

          const commentList = container.querySelector('.comment-list');
          const upvoteButtons = commentList?.querySelectorAll('button[aria-label*="Setuju"]') || [];
          const downvoteButtons = commentList?.querySelectorAll('button[aria-label*="Tidak setuju"]') || [];

          expect(upvoteButtons.length).toBe(2);
          expect(downvoteButtons.length).toBe(2);
       });

       test("should display initial vote counts", () => {
          render(<CommentList {...defaultProps} />);

          const upvoteCount1 = screen.getByText("5");
          const upvoteCount2 = screen.getByText("3");
          const downvoteCount1 = screen.getAllByText("0")[0];
          const downvoteCount2 = screen.getByText("1");

          expect(upvoteCount1).toBeInTheDocument();
          expect(upvoteCount2).toBeInTheDocument();
          expect(downvoteCount1).toBeInTheDocument();
          expect(downvoteCount2).toBeInTheDocument();
       });

       test("should increment upvote when upvote button clicked", () => {
          const { container } = render(<CommentList {...defaultProps} />);

          const upvoteButton = container.querySelector('.ac-postbox_comment')?.querySelectorAll('button[aria-label*="Setuju"]')[0] as HTMLElement;
          if (upvoteButton) {
             fireEvent.click(upvoteButton);
          }

          const updatedUpvoteButton = container.querySelector('.ac-postbox_comment')?.querySelectorAll('button[aria-label*="Setuju"]')[0] as HTMLElement;
          const upvoteCount = updatedUpvoteButton?.querySelector("span");
          expect(upvoteCount).toHaveTextContent("6");
       });

      test("should decrement upvote when same upvote button clicked again", () => {
         render(<CommentList {...defaultProps} />);

         const upvoteButton = screen.getAllByRole("button", { name: /setuju dengan komentar dari test user 1/i })[0];
         fireEvent.click(upvoteButton);
         fireEvent.click(upvoteButton);

         const upvoteCount = upvoteButton.querySelector("span");
         expect(upvoteCount).toHaveTextContent("5");
      });

       test("should switch from upvote to downvote", () => {
           const { container } = render(<CommentList {...defaultProps} />);

           const upvoteButton = container.querySelector('.ac-postbox_comment')?.querySelectorAll('button[aria-label*="Setuju dengan komentar dari Test User 1"]')[0] as HTMLElement;
           const downvoteButton = container.querySelector('.ac-postbox_comment')?.querySelectorAll('button[aria-label*="Tidak setuju dengan komentar dari Test User 1"]')[0] as HTMLElement;
           if (upvoteButton) {
              fireEvent.click(upvoteButton);
           }
           if (downvoteButton) {
              fireEvent.click(downvoteButton);
           }

           const updatedDownvoteButton = container.querySelector('.ac-postbox_comment')?.querySelectorAll('button[aria-label*="Tidak setuju dengan komentar dari Test User 1"]')[0] as HTMLElement;
           const downvoteCount = updatedDownvoteButton?.querySelector("span");
           expect(downvoteCount).toHaveTextContent("1");
        });
   });

   describe("Replying", () => {
       test("should render reply button for each comment", () => {
          const { container } = render(<CommentList {...defaultProps} />);

          const replyButtons = container.querySelectorAll('button[aria-label*="Balas"]');
          expect(replyButtons.length).toBe(2);
       });

       test("should show reply form when reply button clicked", () => {
          const { container } = render(<CommentList {...defaultProps} />);

          const replyButton = container.querySelector('button[aria-label*="Balas"]') as HTMLElement;
          if (replyButton) {
             fireEvent.click(replyButton);
          }

          expect(screen.getByText("Nama")).toBeInTheDocument();
          expect(screen.getByText("Email")).toBeInTheDocument();
          expect(screen.getByText("Komentar")).toBeInTheDocument();
       });

       test("should hide reply form when cancel button clicked", () => {
          const { container } = render(<CommentList {...defaultProps} />);

          const replyButton = container.querySelector('button[aria-label*="Balas"]') as HTMLElement;
          if (replyButton) {
             fireEvent.click(replyButton);
          }

          const cancelButton = screen.getByRole("button", { name: /batal/i });
          fireEvent.click(cancelButton);

          expect(screen.queryByText("Nama")).not.toBeInTheDocument();
       });
   });

   describe("Accessibility", () => {
       test("should have proper ARIA labels for buttons", () => {
          const { container } = render(<CommentList {...defaultProps} />);

          const upvoteButtons = container.querySelectorAll('button[aria-label*="Setuju"]');
          const downvoteButtons = container.querySelectorAll('button[aria-label*="Tidak setuju"]');
          const replyButtons = container.querySelectorAll('button[aria-label*="Balas"]');

          expect(upvoteButtons.length).toBeGreaterThan(0);
          expect(downvoteButtons.length).toBeGreaterThan(0);
          expect(replyButtons.length).toBeGreaterThan(0);
       });

       test("should set aria-pressed for vote buttons", () => {
          const { container } = render(<CommentList {...defaultProps} />);

          const upvoteButton = container.querySelector('button[aria-label*="Setuju"]') as HTMLElement;
          if (upvoteButton) {
             fireEvent.click(upvoteButton);
          }

          const updatedUpvoteButton = container.querySelector('button[aria-pressed="true"]');
          expect(updatedUpvoteButton).toBeInTheDocument();
       });

      test("should have proper heading levels", () => {
         render(<CommentList {...defaultProps} />);

         const commentHeading = screen.getByText("2 Komentar");
         expect(commentHeading.tagName).toBe("H3");
      });
   });

    describe("Integration with BlogCommentData", () => {
       test("should filter comments by blogId", () => {
          render(<CommentList comments={blogComments} blogId={1} />);

          expect(screen.getByText("4 Komentar")).toBeInTheDocument();
       });

       test("should show no comments message when all comments are filtered out", () => {
          const filteredComments = blogComments.filter(c => c.status === 'pending' || c.status === 'rejected');
          render(<CommentList comments={filteredComments} blogId={1} />);

          expect(screen.getByText("0 Komentar")).toBeInTheDocument();
          expect(screen.getByText(/belum ada komentar/i)).toBeInTheDocument();
       });
    });
});