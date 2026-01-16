import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewsletterForm from '../NewsletterForm';
import { ToastContainer } from 'react-toastify';

describe('NewsletterForm', () => {
   const renderNewsletterForm = (props = {}) => {
      return render(
         <>
            <ToastContainer />
            <NewsletterForm {...props} />
         </>
      );
   };

   beforeEach(() => {
      jest.clearAllMocks();
   });

   describe('Rendering', () => {
      test('renders newsletter form with email input and submit button', () => {
         renderNewsletterForm();
         
         const emailInput = screen.getByLabelText(/email untuk newsletter/i);
         const submitButton = screen.getByRole('button', { name: /subscribe ke newsletter/i });
         
         expect(emailInput).toBeInTheDocument();
         expect(submitButton).toBeInTheDocument();
      });

      test('renders with custom className', () => {
         const { container } = renderNewsletterForm({ className: 'custom-class' });
         const form = container.querySelector('.custom-class');
         
         expect(form).toBeInTheDocument();
      });

      test('renders placeholder text in email input', () => {
         renderNewsletterForm();
         
         const emailInput = screen.getByPlaceholderText('Masukkan email Anda');
         
         expect(emailInput).toBeInTheDocument();
      });

      test('has proper ARIA attributes', () => {
         renderNewsletterForm();
         
         const form = screen.getByLabelText(/newsletter subscription form/i);
         const emailInput = screen.getByLabelText(/email untuk newsletter/i);
         
         expect(form).toHaveAttribute('aria-label', 'Newsletter subscription form');
         expect(emailInput).toHaveAttribute('aria-required', 'true');
         expect(emailInput).toHaveAttribute('aria-invalid', 'false');
      });

      test('has sr-only label for screen readers', () => {
         const { container } = renderNewsletterForm();
         const label = container.querySelector('.sr-only');
         
         expect(label).toBeInTheDocument();
         expect(label).toHaveAttribute('for', 'footer_email');
      });
   });

   describe('Form Validation', () => {
      test('shows error for empty email on submit', async () => {
         renderNewsletterForm();
         
         const submitButton = screen.getByRole('button', { name: /subscribe ke newsletter/i });
         
         fireEvent.click(submitButton);
         
         await waitFor(() => {
            const errorMessage = screen.getByRole('alert');
            expect(errorMessage).toBeInTheDocument();
         });
      });

      test('shows error for invalid email format', async () => {
         renderNewsletterForm();
         
         const emailInput = screen.getByLabelText(/email untuk newsletter/i);
         const submitButton = screen.getByRole('button', { name: /subscribe ke newsletter/i });
         
         fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
         fireEvent.click(submitButton);
         
         await waitFor(() => {
            const errorMessage = screen.getByRole('alert');
            expect(errorMessage).toBeInTheDocument();
            expect(errorMessage).toHaveTextContent(/tidak valid/i);
         });
      });

      test('shows error with aria-live region', async () => {
         renderNewsletterForm();
         
         const submitButton = screen.getByRole('button', { name: /subscribe ke newsletter/i });
         fireEvent.click(submitButton);
         
         await waitFor(() => {
            const errorMessage = screen.getByRole('alert');
            expect(errorMessage).toHaveAttribute('aria-live', 'polite');
         });
      });

      test('clears error when valid email entered', async () => {
         renderNewsletterForm();
         
         const emailInput = screen.getByLabelText(/email untuk newsletter/i);
         const submitButton = screen.getByRole('button', { name: /subscribe ke newsletter/i });
         
         fireEvent.click(submitButton);
         
         await waitFor(() => {
            expect(screen.queryByRole('alert')).toBeInTheDocument();
         });
         
         fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
         
         await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
         });
      });
   });

   describe('Form Submission', () => {
      test('shows loading state during submission', async () => {
         renderNewsletterForm();
         
         const emailInput = screen.getByLabelText(/email untuk newsletter/i);
         const submitButton = screen.getByRole('button', { name: /subscribe ke newsletter/i });
         
         fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
         fireEvent.click(submitButton);
         
         await waitFor(() => {
            expect(submitButton).toHaveTextContent('Mengirim...');
            expect(submitButton).toBeDisabled();
            expect(submitButton).toHaveAttribute('aria-busy', 'true');
         });
      });

      test('disables input during submission', async () => {
         renderNewsletterForm();
         
         const emailInput = screen.getByLabelText(/email untuk newsletter/i);
         const submitButton = screen.getByRole('button', { name: /subscribe ke newsletter/i });
         
         fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
         fireEvent.click(submitButton);
         
         await waitFor(() => {
            expect(emailInput).toBeDisabled();
         });
      });

      test('shows success message after submission', async () => {
         renderNewsletterForm();
         
         const emailInput = screen.getByLabelText(/email untuk newsletter/i);
         const submitButton = screen.getByRole('button', { name: /subscribe ke newsletter/i });
         
         fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
         fireEvent.click(submitButton);
         
         await waitFor(() => {
            expect(submitButton).toHaveTextContent('Subscribe');
            expect(submitButton).not.toBeDisabled();
         });
      });

      test('focuses success message after submission', async () => {
         renderNewsletterForm();
         
         const emailInput = screen.getByLabelText(/email untuk newsletter/i);
         const submitButton = screen.getByRole('button', { name: /subscribe ke newsletter/i });
         
         fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
         fireEvent.click(submitButton);
         
         await waitFor(() => {
            expect(submitButton).toHaveTextContent('Subscribe');
            expect(submitButton).not.toBeDisabled();
         });
      });

      test('resets form after successful submission', async () => {
         renderNewsletterForm();
         
         const emailInput = screen.getByLabelText(/email untuk newsletter/i);
         const submitButton = screen.getByRole('button', { name: /subscribe ke newsletter/i });
         
         fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
         fireEvent.click(submitButton);
         
         await waitFor(() => {
            expect(submitButton).toHaveTextContent('Subscribe');
            expect(submitButton).not.toBeDisabled();
         });
      });

      test('shows correct button text when not submitting', () => {
         renderNewsletterForm();
         
         const submitButton = screen.getByRole('button', { name: /subscribe ke newsletter/i });
         
         expect(submitButton).toHaveTextContent('Subscribe');
      });
   });

   describe('Accessibility', () => {
      test('keyboard navigation works', async () => {
         renderNewsletterForm();
         
         const emailInput = screen.getByLabelText(/email untuk newsletter/i);
         const submitButton = screen.getByRole('button', { name: /subscribe ke newsletter/i });
         
         expect(emailInput).toBeInTheDocument();
         expect(submitButton).toBeInTheDocument();
         expect(emailInput).toHaveAttribute('type', 'email');
         expect(submitButton).toHaveAttribute('type', 'submit');
      });

      test('submit button has accessible name', () => {
         renderNewsletterForm();
         
         const submitButton = screen.getByRole('button', { name: /subscribe ke newsletter/i });
         
         expect(submitButton).toBeInTheDocument();
      });

      test('email input has proper aria-describedby when error present', async () => {
         renderNewsletterForm();
         
         const emailInput = screen.getByLabelText(/email untuk newsletter/i);
         const submitButton = screen.getByRole('button', { name: /subscribe ke newsletter/i });
         
         fireEvent.click(submitButton);
         
         await waitFor(() => {
            expect(emailInput).toHaveAttribute('aria-describedby', expect.stringContaining('footer_email_error'));
         });
      });

      test('error message has role="alert" and aria-live', async () => {
         renderNewsletterForm();
         
         const submitButton = screen.getByRole('button', { name: /subscribe ke newsletter/i });
         
         fireEvent.click(submitButton);
         
         await waitFor(() => {
            const errorMessage = screen.getByRole('alert');
            expect(errorMessage).toHaveAttribute('aria-live', 'polite');
         });
      });

      test('form has noValidate attribute', () => {
         const { container } = renderNewsletterForm();
         const form = container.querySelector('form');
         
         expect(form).toHaveAttribute('noValidate');
      });
   });

   describe('Edge Cases', () => {
      test('handles rapid form submissions', async () => {
         renderNewsletterForm();
         
         const emailInput = screen.getByLabelText(/email untuk newsletter/i);
         const submitButton = screen.getByRole('button', { name: /subscribe ke newsletter/i });
         
         fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
         fireEvent.click(submitButton);
         fireEvent.click(submitButton);
         
         await waitFor(() => {
            expect(screen.getByRole('button', { name: /subscribe ke newsletter/i })).toBeDisabled();
         });
      });

      test('handles email with spaces', async () => {
         renderNewsletterForm();
         
         const emailInput = screen.getByLabelText(/email untuk newsletter/i);
         const submitButton = screen.getByRole('button', { name: /subscribe ke newsletter/i });
         
         fireEvent.change(emailInput, { target: { value: 'test @example.com' } });
         fireEvent.click(submitButton);
         
         await waitFor(() => {
            const errorMessage = screen.getByRole('alert');
            expect(errorMessage).toBeInTheDocument();
         });
      });

      test('handles very long email addresses', async () => {
         renderNewsletterForm();
         
         const emailInput = screen.getByLabelText(/email untuk newsletter/i);
         const submitButton = screen.getByRole('button', { name: /subscribe ke newsletter/i });
         
         const longEmail = 'a'.repeat(100) + '@example.com';
         fireEvent.change(emailInput, { target: { value: longEmail } });
         fireEvent.click(submitButton);
         
         await waitFor(() => {
            expect(emailInput).toHaveValue(longEmail);
         });
      });
   });
});
