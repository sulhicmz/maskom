import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import FormField from '../FormField';

describe('FormField - Real-time Validation', () => {
  let mockTrigger: jest.Mock;
  let mockRegister: jest.Mock;

  beforeEach(() => {
    mockTrigger = jest.fn().mockResolvedValue({});
    mockRegister = jest.fn().mockReturnValue({
      name: 'test_field',
      onChange: jest.fn(),
      onBlur: jest.fn(),
      ref: jest.fn(),
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('trigger Prop', () => {
    it('should not call trigger when trigger prop is not provided', () => {
      render(
        <FormField
          id="test_field"
          label="Test Field"
          type="text"
          register={mockRegister('test_field')}
        />
      );

      const input = screen.getByRole('textbox', { name: 'Test Field' });
      fireEvent.change(input, { target: { value: 'test' } });

      expect(mockTrigger).not.toHaveBeenCalled();
    });

    it('should call trigger on input change when trigger prop is provided', async () => {
      render(
        <FormField
          id="test_field"
          label="Test Field"
          type="text"
          register={mockRegister('test_field')}
          trigger={mockTrigger}
        />
      );

      const input = screen.getByRole('textbox', { name: 'Test Field' });
      fireEvent.change(input, { target: { value: 'test' } });

      expect(mockTrigger).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalledWith('test_field');
      });
    });

    it('should call trigger on textarea change when trigger prop is provided', async () => {
      render(
        <FormField
          id="test_field"
          label="Test Field"
          type="textarea"
          register={mockRegister('test_field')}
          trigger={mockTrigger}
        />
      );

      const textarea = screen.getByRole('textbox', { name: 'Test Field' });
      fireEvent.change(textarea, { target: { value: 'test' } });

      expect(mockTrigger).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalledWith('test_field');
      });
    });

    it('should debounce trigger calls with multiple rapid changes', async () => {
      render(
        <FormField
          id="test_field"
          label="Test Field"
          type="text"
          register={mockRegister('test_field')}
          trigger={mockTrigger}
        />
      );

      const input = screen.getByRole('textbox', { name: 'Test Field' });

      fireEvent.change(input, { target: { value: 'test1' } });
      fireEvent.change(input, { target: { value: 'test2' } });
      fireEvent.change(input, { target: { value: 'test3' } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalledTimes(1);
        expect(mockTrigger).toHaveBeenCalledWith('test_field');
      });
    });

    it('should reset debounce timer on each change', async () => {
      render(
        <FormField
          id="test_field"
          label="Test Field"
          type="text"
          register={mockRegister('test_field')}
          trigger={mockTrigger}
        />
      );

      const input = screen.getByRole('textbox', { name: 'Test Field' });

      fireEvent.change(input, { target: { value: 'test1' } });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(mockTrigger).not.toHaveBeenCalled();

      fireEvent.change(input, { target: { value: 'test2' } });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      expect(mockTrigger).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('debounceMs Prop', () => {
    it('should use default 300ms debounce delay', async () => {
      render(
        <FormField
          id="test_field"
          label="Test Field"
          type="text"
          register={mockRegister('test_field')}
          trigger={mockTrigger}
        />
      );

      const input = screen.getByRole('textbox', { name: 'Test Field' });
      fireEvent.change(input, { target: { value: 'test' } });

      act(() => {
        jest.advanceTimersByTime(299);
      });

      expect(mockTrigger).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1);
      });

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalledTimes(1);
      });
    });

    it('should use custom debounceMs delay', async () => {
      render(
        <FormField
          id="test_field"
          label="Test Field"
          type="text"
          register={mockRegister('test_field')}
          trigger={mockTrigger}
          debounceMs={500}
        />
      );

      const input = screen.getByRole('textbox', { name: 'Test Field' });
      fireEvent.change(input, { target: { value: 'test' } });

      act(() => {
        jest.advanceTimersByTime(499);
      });

      expect(mockTrigger).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1);
      });

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalledTimes(1);
      });
    });

    it('should debounce with 100ms custom delay', async () => {
      render(
        <FormField
          id="test_field"
          label="Test Field"
          type="text"
          register={mockRegister('test_field')}
          trigger={mockTrigger}
          debounceMs={100}
        />
      );

      const input = screen.getByRole('textbox', { name: 'Test Field' });
      fireEvent.change(input, { target: { value: 'test' } });

      act(() => {
        jest.advanceTimersByTime(99);
      });

      expect(mockTrigger).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(1);
      });

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('ariaLive Prop', () => {
    it('should use default aria-live="polite" for error messages', () => {
      render(
        <FormField
          id="test_field"
          label="Test Field"
          type="text"
          register={mockRegister('test_field')}
          trigger={mockTrigger}
          error={{ message: 'Test error', type: 'required' }}
        />
      );

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });

    it('should use aria-live="polite" when specified', () => {
      render(
        <FormField
          id="test_field"
          label="Test Field"
          type="text"
          register={mockRegister('test_field')}
          trigger={mockTrigger}
          ariaLive="polite"
          error={{ message: 'Test error', type: 'required' }}
        />
      );

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });

    it('should use aria-live="assertive" when specified', () => {
      render(
        <FormField
          id="test_field"
          label="Test Field"
          type="text"
          register={mockRegister('test_field')}
          trigger={mockTrigger}
          ariaLive="assertive"
          error={{ message: 'Test error', type: 'required' }}
        />
      );

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
    });

    it('should use aria-live="off" when specified', () => {
      render(
        <FormField
          id="test_field"
          label="Test Field"
          type="text"
          register={mockRegister('test_field')}
          trigger={mockTrigger}
          ariaLive="off"
          error={{ message: 'Test error', type: 'required' }}
        />
      );

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'off');
    });
  });

  describe('Accessibility', () => {
    it('should maintain existing accessibility features with real-time validation', () => {
      render(
        <FormField
          id="test_field"
          label="Test Field"
          type="text"
          register={mockRegister('test_field')}
          trigger={mockTrigger}
          required
          description="Field description"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('should show error message with aria-live when validation fails', () => {
      render(
        <FormField
          id="test_field"
          label="Test Field"
          type="text"
          register={mockRegister('test_field')}
          trigger={mockTrigger}
          error={{ message: 'Field is required', type: 'required' }}
          ariaLive="polite"
        />
      );

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Field is required');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Integration with Existing Features', () => {
    it('should work with password field type', async () => {
      render(
        <FormField
          id="test_password"
          label="Password"
          type="password"
          register={mockRegister('test_password')}
          trigger={mockTrigger}
        />
      );

      const input = screen.getByLabelText('Password');
      fireEvent.change(input, { target: { value: 'testpass' } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalledWith('test_password');
      });
    });

    it('should work with textarea field type', async () => {
      render(
        <FormField
          id="test_textarea"
          label="Message"
          type="textarea"
          register={mockRegister('test_textarea')}
          trigger={mockTrigger}
          maxLength={500}
        />
      );

      const textarea = screen.getByRole('textbox', { name: 'Message' });
      fireEvent.change(textarea, { target: { value: 'test message' } });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalledWith('test_textarea');
      });
    });

    it('should render disabled input correctly', () => {
      render(
        <FormField
          id="test_field"
          label="Test Field"
          type="text"
          register={mockRegister('test_field')}
          trigger={mockTrigger}
          disabled
        />
      );

      const input = screen.getByRole('textbox', { name: 'Test Field' });
      expect(input).toBeDisabled();
    });

    it('should update character count with debounced validation', async () => {
      render(
        <FormField
          id="test_textarea"
          label="Message"
          type="textarea"
          register={mockRegister('test_textarea')}
          trigger={mockTrigger}
          maxLength={500}
        />
      );

      const textarea = screen.getByRole('textbox', { name: 'Message' });
      fireEvent.change(textarea, { target: { value: 'test' } });

      expect(screen.getByText(/4 \/ 500 karakter/)).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(mockTrigger).toHaveBeenCalledWith('test_textarea');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error from submit validation', () => {
      render(
        <FormField
          id="test_field"
          label="Test Field"
          type="text"
          register={mockRegister('test_field')}
          trigger={mockTrigger}
          error={{ message: 'Submit validation error', type: 'validation' }}
          ariaLive="polite"
        />
      );

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('Submit validation error');
    });

    it('should update error when error prop changes', () => {
      const { rerender } = render(
        <FormField
          id="test_field"
          label="Test Field"
          type="text"
          register={mockRegister('test_field')}
          trigger={mockTrigger}
          error={{ message: 'First error', type: 'validation' }}
          ariaLive="polite"
        />
      );

      expect(screen.getByRole('alert')).toHaveTextContent('First error');

      rerender(
        <FormField
          id="test_field"
          label="Test Field"
          type="text"
          register={mockRegister('test_field')}
          trigger={mockTrigger}
          error={{ message: 'Second error', type: 'validation' }}
          ariaLive="polite"
        />
      );

      expect(screen.getByRole('alert')).toHaveTextContent('Second error');
    });
  });
});
