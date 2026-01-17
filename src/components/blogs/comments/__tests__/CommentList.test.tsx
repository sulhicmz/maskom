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
         render(<CommentList {...defaultProps} />);

         const upvoteButtons = screen.getAllByRole("button", { name: /setuju/i });
         const downvoteButtons = screen.getAllByRole("button", { name: /tidak setuju/i });

         expect(upvoteButtons.length).toBe(2);
         expect(downvoteButtons.length).toBe(2);
      });

      test("should display initial vote counts", () => {
         render(<CommentList {...defaultProps} />);

         expect(screen.getByText("5")).toBeInTheDocument();
         expect(screen.getByText("3")).toBeInTheDocument();
      });

      test("should increment upvote when upvote button clicked", () => {
         render(<CommentList {...defaultProps} />);

         const upvoteButton = screen.getAllByRole("button", { name: /setuju dengan komentar dari test user 1/i })[0];
         fireEvent.click(upvoteButton);

         const upvoteCount = upvoteButton.querySelector("span");
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
         render(<CommentList {...defaultProps} />);

         const upvoteButton = screen.getAllByRole("button", { name: /setuju dengan komentar dari test user 1/i })[0];
         const downvoteButton = screen.getAllByRole("button", { name: /tidak setuju dengan komentar dari test user 1/i })[0];

         fireEvent.click(upvoteButton);
         fireEvent.click(downvoteButton);

         const upvoteCount = upvoteButton.querySelector("span");
         const downvoteCount = downvoteButton.querySelector("span");
         expect(upvoteCount).toHaveTextContent("4");
         expect(downvoteCount).toHaveTextContent("1");
      });
   });

   describe("Replying", () => {
      test("should render reply button for each comment", () => {
         render(<CommentList {...defaultProps} />);

         const replyButtons = screen.getAllByRole("button", { name: /balas komentar/i });
         expect(replyButtons.length).toBe(2);
      });

      test("should show reply form when reply button clicked", () => {
         render(<CommentList {...defaultProps} />);

         const replyButton = screen.getAllByRole("button", { name: /balas komentar dari test user 1/i })[0];
         fireEvent.click(replyButton);

         expect(screen.getByLabelText("Nama")).toBeInTheDocument();
         expect(screen.getByLabelText("Email")).toBeInTheDocument();
         expect(screen.getByLabelText("Komentar")).toBeInTheDocument();
      });

      test("should hide reply form when cancel button clicked", () => {
         render(<CommentList {...defaultProps} />);

         const replyButton = screen.getAllByRole("button", { name: /balas komentar dari test user 1/i })[0];
         fireEvent.click(replyButton);

         const cancelButton = screen.getByRole("button", { name: /batal/i });
         fireEvent.click(cancelButton);

         expect(screen.queryByLabelText("Nama")).not.toBeInTheDocument();
      });
   });

   describe("Accessibility", () => {
      test("should have proper ARIA labels for buttons", () => {
         render(<CommentList {...defaultProps} />);

         expect(screen.getAllByRole("button", { name: /setuju/i }).length).toBeGreaterThan(0);
         expect(screen.getAllByRole("button", { name: /tidak setuju/i }).length).toBeGreaterThan(0);
         expect(screen.getAllByRole("button", { name: /balas/i }).length).toBeGreaterThan(0);
      });

      test("should set aria-pressed for vote buttons", () => {
         render(<CommentList {...defaultProps} />);

         const upvoteButton = screen.getAllByRole("button", { name: /setuju dengan komentar dari test user 1/i })[0];
         fireEvent.click(upvoteButton);

         expect(upvoteButton).toHaveAttribute("aria-pressed", "true");
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

         expect(screen.getByText("2 Komentar")).toBeInTheDocument();
      });

      test("should show zero comments when blogId has no comments", () => {
         render(<CommentList comments={blogComments} blogId={999} />);

         expect(screen.getByText("0 Komentar")).toBeInTheDocument();
         expect(screen.getByText(/belum ada komentar/i)).toBeInTheDocument();
      });
   });
});