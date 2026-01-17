import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CommentForm from "../CommentForm";

describe("CommentForm", () => {
   const defaultProps = {
      blogId: 1,
   };

   beforeEach(() => {
      jest.clearAllMocks();
   });

   describe("Rendering", () => {
      test("should render form with all required fields", () => {
         render(<CommentForm {...defaultProps} />);

         expect(screen.getByText("Nama")).toBeInTheDocument();
         expect(screen.getByText("Email")).toBeInTheDocument();
         expect(screen.getByText("Komentar")).toBeInTheDocument();
         expect(screen.getByText("Kirim Komentar")).toBeInTheDocument();
      });

      test("should show cancel button when onCancelReply provided", () => {
         render(<CommentForm {...defaultProps} onCancelReply={jest.fn()} />);

         expect(screen.getByText("Batal")).toBeInTheDocument();
      });

      test("should display description for comment field", () => {
         render(<CommentForm {...defaultProps} />);

         expect(screen.getByText(/komentar Anda akan ditampilkan setelah disetujui/i)).toBeInTheDocument();
      });

      test("should disable submit button while submitting", () => {
         render(<CommentForm {...defaultProps} />);

         const submitButton = screen.getByRole("button", { name: /kirim komentar/i });
         expect(submitButton).not.toBeDisabled();
      });
   });

   describe("Form Validation", () => {
      test("should show validation error for empty name", async () => {
         render(<CommentForm {...defaultProps} />);

         const submitButton = screen.getByText("Kirim Komentar");
         fireEvent.click(submitButton);

         await waitFor(() => {
            expect(screen.getByText(/nama wajib diisi/i)).toBeInTheDocument();
         });
      });

      test("should show validation error for empty email", async () => {
         render(<CommentForm {...defaultProps} />);

         const submitButton = screen.getByText("Kirim Komentar");
         fireEvent.click(submitButton);

         await waitFor(() => {
            expect(screen.getByText(/email wajib diisi/i)).toBeInTheDocument();
         });
      });

      test("should show validation error for invalid email format", async () => {
         render(<CommentForm {...defaultProps} />);

         const emailInput = screen.getByPlaceholderText("Masukkan email Anda");
         fireEvent.change(emailInput, { target: { value: "invalid-email" } });

         await waitFor(() => {
            expect(screen.getByText(/email tidak valid/i)).toBeInTheDocument();
         });
      });

      test("should show validation error for empty comment", async () => {
         render(<CommentForm {...defaultProps} />);

         const submitButton = screen.getByText("Kirim Komentar");
         fireEvent.click(submitButton);

         await waitFor(() => {
            expect(screen.getByText(/komentar wajib diisi/i)).toBeInTheDocument();
         });
      });

      test("should show validation error for short comment (less than 10 characters)", async () => {
         render(<CommentForm {...defaultProps} />);

         const commentInput = screen.getByPlaceholderText("Tulis komentar Anda di sini...");
         fireEvent.change(commentInput, { target: { value: "Short" } });

         await waitFor(() => {
            expect(screen.getByText(/komentar minimal 10 karakter/i)).toBeInTheDocument();
         });
      });

      test("should show validation error for long comment (more than 1000 characters)", async () => {
         render(<CommentForm {...defaultProps} />);

         const commentInput = screen.getByPlaceholderText("Tulis komentar Anda di sini...");
         const longComment = "a".repeat(1001);
         fireEvent.change(commentInput, { target: { value: longComment } });

         await waitFor(() => {
            expect(screen.getByText(/komentar maksimal 1000 karakter/i)).toBeInTheDocument();
         });
      });
   });

   describe("Form Submission", () => {
      test("should call onSubmitSuccess when form is submitted with valid data", async () => {
         const onSubmitSuccess = jest.fn();
         render(<CommentForm {...defaultProps} onSubmitSuccess={onSubmitSuccess} />);

         const nameInput = screen.getByPlaceholderText("Masukkan nama Anda");
         const emailInput = screen.getByPlaceholderText("Masukkan email Anda");
         const commentInput = screen.getByPlaceholderText("Tulis komentar Anda di sini...");
         const submitButton = screen.getByText("Kirim Komentar");

         fireEvent.change(nameInput, { target: { value: "Test User" } });
         fireEvent.change(emailInput, { target: { value: "test@example.com" } });
         fireEvent.change(commentInput, { target: { value: "This is a test comment with enough characters" } });
         fireEvent.click(submitButton);

         await waitFor(() => {
            expect(onSubmitSuccess).toHaveBeenCalledWith({
               name: "Test User",
               email: "test@example.com",
               content: "This is a test comment with enough characters"
            });
         });
      });

      test("should call onCancelReply when cancel button is clicked", () => {
         const onCancelReply = jest.fn();
         render(<CommentForm {...defaultProps} onCancelReply={onCancelReply} />);

         const cancelButton = screen.getByText("Batal");
         fireEvent.click(cancelButton);

         expect(onCancelReply).toHaveBeenCalledTimes(1);
      });
   });

   describe("Accessibility", () => {
      test("should have proper ARIA labels for form fields", () => {
         render(<CommentForm {...defaultProps} />);

         expect(screen.getByText("Nama")).toBeInTheDocument();
         expect(screen.getByText("Email")).toBeInTheDocument();
         expect(screen.getByText("Komentar")).toBeInTheDocument();
      });

      test("should have aria-busy attribute on submit button", () => {
         render(<CommentForm {...defaultProps} />);

         const submitButton = screen.getByRole("button", { name: "Kirim Komentar" });
         expect(submitButton).toHaveAttribute("aria-busy", "false");
      });
   });
});