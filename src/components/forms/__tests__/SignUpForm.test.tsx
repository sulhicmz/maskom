/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('react-toastify', () => ({
  toast: Object.assign(
    jest.fn(() => ({ __t: Date.now() })),
    {
      success: jest.fn(() => ({ __t: Date.now() })),
      error: jest.fn(() => ({ __t: Date.now() })),
    }
  ),
}));

jest.mock('@/services/auth', () => ({
  authService: {
    register: jest.fn(),
  },
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignUpForm from '../SignUpForm';

const mockToast = require('react-toastify').toast;

describe('SignUpForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { authService } = require('@/services/auth');
    authService.register.mockResolvedValue({ success: true, message: 'Registrasi berhasil dikirim' });
  });

  it('should render form fields correctly', () => {
    render(<SignUpForm />);

    expect(screen.getByPlaceholderText('Contoh: Andi Wijaya')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('nama@perusahaan.co.id')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Minimal 8 karakter')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /daftarkan akun/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(<SignUpForm />);

    fireEvent.click(screen.getByRole('button', { name: /daftarkan akun/i }));

    await waitFor(() => {
      expect(screen.getByText('Nama diperlukan')).toBeInTheDocument();
      expect(screen.getByText('Email diperlukan')).toBeInTheDocument();
      expect(screen.getByText('Kata sandi diperlukan')).toBeInTheDocument();
    });
  });

  it('should handle email with valid format', async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByPlaceholderText('Contoh: Andi Wijaya'), { target: { value: 'Test User' } });
    const emailInput = screen.getByPlaceholderText('nama@perusahaan.co.id');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /daftarkan akun/i }));

    await waitFor(() => {
      expect(screen.queryByText(/tidak valid/i)).not.toBeInTheDocument();
    });
  });

  it('should submit form with valid data and show toast', async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByPlaceholderText('Contoh: Andi Wijaya'), { target: { value: 'Andi Wijaya' } });
    fireEvent.change(screen.getByPlaceholderText('nama@perusahaan.co.id'), { target: { value: 'andi@perusahaan.co.id' } });
    fireEvent.change(screen.getByPlaceholderText('Minimal 8 karakter'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /daftarkan akun/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith('Registrasi berhasil dikirim', { position: 'top-center' });
    });
  });

  it('should not show validation errors for valid data', async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByPlaceholderText('Contoh: Andi Wijaya'), { target: { value: 'Andi Wijaya' } });
    fireEvent.change(screen.getByPlaceholderText('nama@perusahaan.co.id'), { target: { value: 'andi@perusahaan.co.id' } });
    fireEvent.change(screen.getByPlaceholderText('Minimal 8 karakter'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /daftarkan akun/i }));

    await waitFor(() => {
      expect(screen.queryByText(/diperlukan/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/tidak valid/i)).not.toBeInTheDocument();
    });
  });

  it('should reset form after successful submission', async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByPlaceholderText('Contoh: Andi Wijaya'), { target: { value: 'Andi Wijaya' } });
    fireEvent.change(screen.getByPlaceholderText('nama@perusahaan.co.id'), { target: { value: 'andi@perusahaan.co.id' } });
    fireEvent.change(screen.getByPlaceholderText('Minimal 8 karakter'), { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /daftarkan akun/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalled();
    });

    expect(screen.getByPlaceholderText('Contoh: Andi Wijaya')).toHaveValue('');
    expect(screen.getByPlaceholderText('nama@perusahaan.co.id')).toHaveValue('');
    expect(screen.getByPlaceholderText('Minimal 8 karakter')).toHaveValue('');
  });

  it('should show placeholder text correctly', () => {
    render(<SignUpForm />);

    expect(screen.getByPlaceholderText('Contoh: Andi Wijaya')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('nama@perusahaan.co.id')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Minimal 8 karakter')).toBeInTheDocument();
  });

  it('should have proper input types', () => {
    render(<SignUpForm />);

    const nameInput = screen.getByPlaceholderText('Contoh: Andi Wijaya');
    const emailInput = screen.getByPlaceholderText('nama@perusahaan.co.id');
    const passwordInput = screen.getByPlaceholderText('Minimal 8 karakter');

    expect(nameInput).toHaveAttribute('type', 'text');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should render link to login page', () => {
    render(<SignUpForm />);

    const loginLink = screen.getByText('Masuk di sini');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
});
