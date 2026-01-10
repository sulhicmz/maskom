/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('react-toastify', () => ({
  toast: jest.fn(() => ({ __t: Date.now() })),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BlogForm from '../BlogForm';

describe('BlogForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form fields correctly', () => {
    render(<BlogForm />);

    expect(screen.getByPlaceholderText('Nama lengkap')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email kantor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tulis komentar Anda')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kirim komentar/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    render(<BlogForm />);

    fireEvent.click(screen.getByRole('button', { name: /kirim komentar/i }));

    await waitFor(() => {
      expect(screen.getByText('Nama is a required field')).toBeInTheDocument();
      expect(screen.getByText('Email is a required field')).toBeInTheDocument();
      expect(screen.getByText('Pesan is a required field')).toBeInTheDocument();
    });
  });

  it('should handle email with valid format', async () => {
    render(<BlogForm />);

    const emailInput = screen.getByPlaceholderText('Email kantor');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /kirim komentar/i }));

    await waitFor(() => {
      expect(screen.queryByText(/must be a valid email/i)).not.toBeInTheDocument();
    });
  });

  it('should submit form with valid data and show toast', async () => {
    render(<BlogForm />);

    fireEvent.change(screen.getByPlaceholderText('Nama lengkap'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email kantor'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Tulis komentar Anda'), { target: { value: 'This is a test comment' } });

    fireEvent.click(screen.getByRole('button', { name: /kirim komentar/i }));

    await waitFor(() => {
      const { toast } = require('react-toastify');
      expect(toast).toHaveBeenCalledWith('Komentar berhasil dikirim', { position: 'top-center' });
    });
  });

  it('should not show validation errors for valid data', async () => {
    render(<BlogForm />);

    fireEvent.change(screen.getByPlaceholderText('Nama lengkap'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email kantor'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Tulis komentar Anda'), { target: { value: 'Test comment' } });

    fireEvent.click(screen.getByRole('button', { name: /kirim komentar/i }));

    await waitFor(() => {
      expect(screen.queryByText(/is a required field/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/must be a valid email/i)).not.toBeInTheDocument();
    });
  });

  it('should handle empty message field validation', async () => {
    render(<BlogForm />);

    fireEvent.change(screen.getByPlaceholderText('Nama lengkap'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email kantor'), { target: { value: 'john@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /kirim komentar/i }));

    await waitFor(() => {
      expect(screen.getByText('Pesan is a required field')).toBeInTheDocument();
      expect(screen.queryByText('Nama is a required field')).not.toBeInTheDocument();
      expect(screen.queryByText('Email is a required field')).not.toBeInTheDocument();
    });
  });

  it('should handle email with valid format', async () => {
    render(<BlogForm />);

    const emailInput = screen.getByPlaceholderText('Email kantor');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    fireEvent.click(screen.getByRole('button', { name: /kirim komentar/i }));

    await waitFor(() => {
      expect(screen.queryByText(/must be a valid email/i)).not.toBeInTheDocument();
    });
  });

  it('should reset form after successful submission', async () => {
    render(<BlogForm />);

    fireEvent.change(screen.getByPlaceholderText('Nama lengkap'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email kantor'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Tulis komentar Anda'), { target: { value: 'Test comment' } });

    const submitButton = screen.getByRole('button', { name: /kirim komentar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const { toast } = require('react-toastify');
      expect(toast).toHaveBeenCalled();
    });

    expect(screen.getByPlaceholderText('Nama lengkap')).toHaveValue('');
    expect(screen.getByPlaceholderText('Email kantor')).toHaveValue('');
    expect(screen.getByPlaceholderText('Tulis komentar Anda')).toHaveValue('');
  });

  it('should show placeholder text correctly', () => {
    render(<BlogForm />);

    expect(screen.getByPlaceholderText('Nama lengkap')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email kantor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tulis komentar Anda')).toBeInTheDocument();
  });

  it('should have proper input types', () => {
    render(<BlogForm />);

    const nameInput = screen.getByPlaceholderText('Nama lengkap');
    const emailInput = screen.getByPlaceholderText('Email kantor');
    const messageTextarea = screen.getByPlaceholderText('Tulis komentar Anda');

    expect(nameInput).toHaveAttribute('type', 'text');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(messageTextarea.tagName.toLowerCase()).toBe('textarea');
  });

  it('should handle multiline message textarea', async () => {
    render(<BlogForm />);

    const messageTextarea = screen.getByPlaceholderText('Tulis komentar Anda');
    fireEvent.change(messageTextarea, { target: { value: 'Line 1\nLine 2\nLine 3' } });

    expect(messageTextarea).toHaveValue('Line 1\nLine 2\nLine 3');
  });

  it('should have proper textarea rows attribute', () => {
    render(<BlogForm />);

    const messageTextarea = screen.getByPlaceholderText('Tulis komentar Anda');
    expect(messageTextarea).toHaveAttribute('rows', '4');
  });

  it('should handle special characters in message', async () => {
    render(<BlogForm />);

    const messageTextarea = screen.getByPlaceholderText('Tulis komentar Anda');
    fireEvent.change(messageTextarea, { target: { value: 'Test @#$%^&*() message with symbols!' } });

    expect(messageTextarea).toHaveValue('Test @#$%^&*() message with symbols!');
  });
});
