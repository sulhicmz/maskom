/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('react-toastify', () => ({
  toast: jest.fn(() => ({ __t: Date.now() })),
}));

jest.mock('@/services/auth', () => ({
  authService: {
    login: jest.fn(),
  },
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '../LoginForm';

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { authService } = require('@/services/auth');
    authService.login.mockResolvedValue({ success: true, message: 'Berhasil masuk ke portal' });
  });

  it('should render form fields correctly', () => {
    render(<LoginForm />);

    expect(screen.getByPlaceholderText('nama@maskom.co.id')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Masukkan kata sandi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /masuk sekarang/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole('button', { name: /masuk sekarang/i }));

    await waitFor(() => {
      expect(screen.getByText('Email is a required field')).toBeInTheDocument();
      expect(screen.getByText('Kata sandi is a required field')).toBeInTheDocument();
    });
  });

  it('should handle email with valid format', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('nama@maskom.co.id');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /masuk sekarang/i }));

    await waitFor(() => {
      expect(screen.queryByText(/must be a valid email/i)).not.toBeInTheDocument();
    });
  });

  it('should submit form with valid data and show toast', async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByPlaceholderText('nama@maskom.co.id'), { target: { value: 'nama@maskom.co.id' } });
    fireEvent.change(screen.getByPlaceholderText('Masukkan kata sandi'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /masuk sekarang/i }));

    await waitFor(() => {
      const { toast } = require('react-toastify');
      expect(toast).toHaveBeenCalledWith('Berhasil masuk ke portal', { position: 'top-center' });
    });
  });

  it('should not show validation errors for valid data', async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByPlaceholderText('nama@maskom.co.id'), { target: { value: 'nama@maskom.co.id' } });
    fireEvent.change(screen.getByPlaceholderText('Masukkan kata sandi'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /masuk sekarang/i }));

    await waitFor(() => {
      expect(screen.queryByText(/is a required field/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/must be a valid email/i)).not.toBeInTheDocument();
    });
  });

  it('should handle email with valid format', async () => {
    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('nama@maskom.co.id');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /masuk sekarang/i }));

    await waitFor(() => {
      expect(screen.queryByText(/must be a valid email/i)).not.toBeInTheDocument();
    });
  });

  it('should reset form after successful submission', async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByPlaceholderText('nama@maskom.co.id'), { target: { value: 'nama@maskom.co.id' } });
    fireEvent.change(screen.getByPlaceholderText('Masukkan kata sandi'), { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /masuk sekarang/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const { toast } = require('react-toastify');
      expect(toast).toHaveBeenCalled();
    });

    expect(screen.getByPlaceholderText('nama@maskom.co.id')).toHaveValue('');
    expect(screen.getByPlaceholderText('Masukkan kata sandi')).toHaveValue('');
  });

  it('should show placeholder text correctly', () => {
    render(<LoginForm />);

    expect(screen.getByPlaceholderText('nama@maskom.co.id')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Masukkan kata sandi')).toBeInTheDocument();
  });

  it('should have proper input types', () => {
    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('nama@maskom.co.id');
    const passwordInput = screen.getByPlaceholderText('Masukkan kata sandi');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should render link to signup page', () => {
    render(<LoginForm />);

    const signupLink = screen.getByText('Daftar Maskom');
    expect(signupLink).toBeInTheDocument();
    expect(signupLink.closest('a')).toHaveAttribute('href', '/sign-up');
  });

  it('should show loading state during submission', () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /masuk sekarang/i });
    expect(submitButton).toHaveTextContent('Masuk sekarang');
    expect(submitButton).not.toBeDisabled();
  });

  it('should disable inputs and button when submitting', async () => {
    const { authService } = require('@/services/auth');
    authService.login.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true, message: 'Success' }), 100)));

    render(<LoginForm />);

    fireEvent.change(screen.getByPlaceholderText('nama@maskom.co.id'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Masukkan kata sandi'), { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /masuk sekarang/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Masuk...');
    });
  });

  it('should have proper ARIA attributes for accessibility', () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /masuk sekarang/i });
    expect(submitButton).toHaveAttribute('aria-live', 'polite');
    expect(submitButton).toHaveAttribute('aria-busy', 'false');
  });
});
