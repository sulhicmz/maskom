import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContactForm from '../ContactForm';
import { emailService } from '@/services/email';

jest.mock('@/services/email', () => ({
  emailService: {
    sendEmail: jest.fn(),
  },
}));

const mockSendEmail = emailService.sendEmail as jest.MockedFunction<typeof emailService.sendEmail>;

describe('ContactForm', () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID = 'test_service_id';
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID = 'test_template_id';
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY = 'test_public_key';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form with all fields', () => {
    render(<ContactForm />);

    expect(screen.getByPlaceholderText('Nama lengkap')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email kantor')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tuliskan kebutuhan Anda')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kirim pesan/i })).toBeInTheDocument();
  });

  it('displays validation errors for empty fields on submission', async () => {
    render(<ContactForm />);

    fireEvent.click(screen.getByRole('button', { name: /kirim pesan/i }));

    await waitFor(() => {
      expect(screen.getByText('Nama is a required field')).toBeInTheDocument();
      expect(screen.getByText('Email is a required field')).toBeInTheDocument();
      expect(screen.getByText('Pesan is a required field')).toBeInTheDocument();
    });
  });

  it('calls emailService.sendEmail on successful submission', async () => {
    mockSendEmail.mockResolvedValue({ success: true, text: 'OK' });
    render(<ContactForm />);

    fireEvent.change(screen.getByPlaceholderText('Nama lengkap'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email kantor'), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Tuliskan kebutuhan Anda'), { target: { value: 'Test message' } });

    fireEvent.click(screen.getByRole('button', { name: /kirim pesan/i }));

    await waitFor(() => {
      expect(mockSendEmail).toHaveBeenCalledTimes(1);
      expect(mockSendEmail).toHaveBeenCalledWith({
        templateParams: {
          user_name: 'John Doe',
          user_email: 'john.doe@example.com',
          message: 'Test message',
        },
      });
    });
  });

  it('shows error toast on failed submission', async () => {
    mockSendEmail.mockResolvedValue({ success: false, error: 'Failed to send' });
    render(<ContactForm />);

    fireEvent.change(screen.getByPlaceholderText('Nama lengkap'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email kantor'), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Tuliskan kebutuhan Anda'), { target: { value: 'Test message' } });

    fireEvent.click(screen.getByRole('button', { name: /kirim pesan/i }));

    await waitFor(() => {
      expect(mockSendEmail).toHaveBeenCalledTimes(1);
    });
  });
});
