import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContactForm from '../ContactForm';
import emailjs from '@emailjs/browser';

// Mock emailjs
jest.mock('@emailjs/browser', () => ({
  sendForm: jest.fn(() => Promise.resolve({ text: 'OK' })),
}));

describe('ContactForm', () => {
  // Set environment variables for testing
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

  it('calls emailjs.sendForm on successful submission', async () => {
    render(<ContactForm />);

    fireEvent.change(screen.getByPlaceholderText('Nama lengkap'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email kantor'), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Tuliskan kebutuhan Anda'), { target: { value: 'Test message' } });

    fireEvent.click(screen.getByRole('button', { name: /kirim pesan/i }));

    await waitFor(() => {
      expect(emailjs.sendForm).toHaveBeenCalledTimes(1);
      expect(emailjs.sendForm).toHaveBeenCalledWith(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
        expect.any(HTMLFormElement),
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      );
    });
  });
});
