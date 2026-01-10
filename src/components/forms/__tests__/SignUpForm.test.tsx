/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('react-toastify', () => ({
  toast: jest.fn(() => ({ __t: Date.now() })),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignUpForm from '../SignUpForm';

describe('SignUpForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      expect(screen.getByText('Nama is a required field')).toBeInTheDocument();
      expect(screen.getByText('Email is a required field')).toBeInTheDocument();
      expect(screen.getByText('Kata sandi is a required field')).toBeInTheDocument();
    });
  });

  it('should handle email with valid format', async () => {
    render(<SignUpForm />);

    const emailInput = screen.getByPlaceholderText('nama@perusahaan.co.id');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /daftarkan akun/i }));

    await waitFor(() => {
      expect(screen.queryByText(/must be a valid email/i)).not.toBeInTheDocument();
    });
  });

  it('should submit form with valid data and show toast', async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByPlaceholderText('Contoh: Andi Wijaya'), { target: { value: 'Andi Wijaya' } });
    fireEvent.change(screen.getByPlaceholderText('nama@perusahaan.co.id'), { target: { value: 'andi@perusahaan.co.id' } });
    fireEvent.change(screen.getByPlaceholderText('Minimal 8 karakter'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /daftarkan akun/i }));

    await waitFor(() => {
      const { toast } = require('react-toastify');
      expect(toast).toHaveBeenCalledWith('Registrasi berhasil dikirim', { position: 'top-center' });
    });
  });

  it('should not show validation errors for valid data', async () => {
    render(<SignUpForm />);

    fireEvent.change(screen.getByPlaceholderText('Contoh: Andi Wijaya'), { target: { value: 'Andi Wijaya' } });
    fireEvent.change(screen.getByPlaceholderText('nama@perusahaan.co.id'), { target: { value: 'andi@perusahaan.co.id' } });
    fireEvent.change(screen.getByPlaceholderText('Minimal 8 karakter'), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /daftarkan akun/i }));

    await waitFor(() => {
      expect(screen.queryByText(/is a required field/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/must be a valid email/i)).not.toBeInTheDocument();
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
      const { toast } = require('react-toastify');
      expect(toast).toHaveBeenCalled();
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
