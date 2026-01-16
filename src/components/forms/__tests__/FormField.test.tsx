import { render, screen, fireEvent } from '@testing-library/react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';
import FormField from '../FormField';

describe('FormField', () => {
  const mockRegister: UseFormRegisterReturn<string> = {
    name: 'testField',
    onChange: jest.fn(),
    onBlur: jest.fn(),
    ref: jest.fn(),
  };

  const baseProps = {
    id: 'test-id',
    label: 'Test Label',
    register: mockRegister,
  };

  describe('Rendering', () => {
    it('renders text input by default', () => {
      render(<FormField {...baseProps} type="text" />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('renders email input when type is email', () => {
      render(<FormField {...baseProps} type="email" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders password input when type is password', () => {
      render(<FormField {...baseProps} type="password" />);

      const input = screen.getByLabelText('Test Label');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders textarea when type is textarea', () => {
      render(<FormField {...baseProps} type="textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea.tagName).toBe('TEXTAREA');
      expect(textarea).toHaveAttribute('rows', '4');
    });

    it('renders label with htmlFor attribute', () => {
      render(<FormField {...baseProps} />);

      const label = screen.getByText('Test Label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute('for', 'test-id');
    });

    it('renders input with id', () => {
      render(<FormField {...baseProps} />);

      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('id', 'test-id');
    });

    it('renders with custom placeholder', () => {
      render(<FormField {...baseProps} placeholder="Enter text" />);

      const input = screen.getByPlaceholderText('Enter text');
      expect(input).toBeInTheDocument();
    });

    it('renders textarea with custom rows', () => {
      render(<FormField {...baseProps} type="textarea" rows={10} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '10');
    });
  });

  describe('Error Handling', () => {
    const mockError: FieldError = {
      type: 'required',
      message: 'This field is required',
    };

    it('does not render error message when error is undefined', () => {
      render(<FormField {...baseProps} />);

      const errorElement = screen.queryByRole('alert');
      expect(errorElement).not.toBeInTheDocument();
    });

    it('renders error message when error is provided', () => {
      render(<FormField {...baseProps} error={mockError} />);

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('This field is required');
    });

    it('associates error with input using aria-describedby', () => {
      render(<FormField {...baseProps} error={mockError} />);

      const input = screen.getByLabelText('Test Label');
      const errorElement = screen.getByRole('alert');
      
      expect(input).toHaveAttribute('aria-describedby', 'test-id_error');
      expect(errorElement).toHaveAttribute('id', 'test-id_error');
    });

    it('sets aria-invalid to false when error is undefined', () => {
      render(<FormField {...baseProps} />);

      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('sets aria-invalid to true when error is provided', () => {
      render(<FormField {...baseProps} error={mockError} />);

      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Disabled State', () => {
    it('enables input by default', () => {
      render(<FormField {...baseProps} />);

      const input = screen.getByLabelText('Test Label');
      expect(input).not.toBeDisabled();
    });

    it('disables input when disabled prop is true', () => {
      render(<FormField {...baseProps} disabled={true} />);

      const input = screen.getByLabelText('Test Label');
      expect(input).toBeDisabled();
    });

    it('disables input when disabled prop is false', () => {
      render(<FormField {...baseProps} disabled={false} />);

      const input = screen.getByLabelText('Test Label');
      expect(input).not.toBeDisabled();
    });

    it('disables textarea when type is textarea and disabled', () => {
      render(<FormField {...baseProps} type="textarea" disabled={true} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('associates label with input correctly', () => {
      render(<FormField {...baseProps} />);

      const label = screen.getByText('Test Label');
      const input = screen.getByLabelText('Test Label');
      
      expect(label).toHaveAttribute('for', 'test-id');
      expect(input).toHaveAttribute('id', 'test-id');
    });

    it('provides error description to screen readers', () => {
      const mockError: FieldError = {
        type: 'min',
        message: 'Minimum length required',
      };

      render(<FormField {...baseProps} error={mockError} />);

      const input = screen.getByLabelText('Test Label');
      const errorElement = screen.getByRole('alert');

      expect(input).toHaveAttribute('aria-describedby', 'test-id_error');
      expect(errorElement).toHaveAttribute('id', 'test-id_error');
      expect(errorElement).toHaveTextContent('Minimum length required');
    });

    it('sets role="alert" on error message', () => {
      const mockError: FieldError = {
        type: 'pattern',
        message: 'Invalid format',
      };

      render(<FormField {...baseProps} error={mockError} />);

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toBeInTheDocument();
    });
  });

  describe('Form Integration', () => {
    it('spreads register properties to input', () => {
      const customRegister: UseFormRegisterReturn<string> = {
        name: 'customField',
        onChange: jest.fn(),
        onBlur: jest.fn(),
        ref: jest.fn(),
      };

      render(<FormField id="custom-id" label="Custom Label" register={customRegister} />);

      const input = screen.getByLabelText('Custom Label');
      expect(input).toHaveAttribute('name', 'customField');
    });

    it('applies form-control class to input', () => {
      render(<FormField {...baseProps} />);

      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveClass('form-control');
    });

    it('applies form-control class to textarea', () => {
      render(<FormField {...baseProps} type="textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('form-control');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty error message - renders element with empty text', () => {
      const emptyError: FieldError = {
        type: 'custom',
        message: '',
      };

      render(<FormField {...baseProps} error={emptyError} />);

      const errorElement = screen.queryByRole('alert');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('');
    });

    it('handles undefined error type', () => {
      const undefinedTypeError: FieldError = {
        type: undefined as unknown as FieldError['type'],
        message: 'Some error',
      };

      render(<FormField {...baseProps} error={undefinedTypeError} />);

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveTextContent('Some error');
    });

    it('handles password input with aria-invalid false (no error)', () => {
      render(<FormField {...baseProps} type="password" />);

      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('type', 'password');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('handles textarea with default rows when not specified', () => {
      render(<FormField {...baseProps} type="textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '4');
    });

    it('handles all input types with same id and label', () => {
      const { rerender } = render(<FormField {...baseProps} type="text" />);

      let input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('type', 'text');

      rerender(<FormField {...baseProps} type="email" />);

      input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('type', 'email');

      rerender(<FormField {...baseProps} type="password" />);

      input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('type', 'password');

      rerender(<FormField {...baseProps} type="textarea" />);

      const textarea = screen.getByRole('textbox');
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('handles error message with special characters', () => {
      const specialError: FieldError = {
        type: 'custom',
        message: 'Error: "<test>" & \'special\' chars',
      };

      render(<FormField {...baseProps} error={specialError} />);

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveTextContent('Error: "<test>" & \'special\' chars');
    });

    it('handles long label text', () => {
      const longLabel = 'This is a very long label text that should still work correctly';
      render(<FormField {...baseProps} label={longLabel} />);

      const label = screen.getByText(longLabel);
      expect(label).toBeInTheDocument();
    });

    it('handles long placeholder text', () => {
      const longPlaceholder = 'This is a very long placeholder text that should still work correctly';
      render(<FormField {...baseProps} placeholder={longPlaceholder} />);

      const input = screen.getByPlaceholderText(longPlaceholder);
      expect(input).toBeInTheDocument();
    });

    it('handles disabled state with error (error takes precedence for aria-invalid)', () => {
      const mockError: FieldError = {
        type: 'required',
        message: 'Required',
      };

      render(<FormField {...baseProps} disabled={true} error={mockError} />);

      const input = screen.getByLabelText('Test Label');
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Combined States', () => {
    it('renders text input with error and disabled', () => {
      const mockError: FieldError = {
        type: 'required',
        message: 'Required',
      };

      render(
        <FormField
          {...baseProps}
          type="text"
          disabled={true}
          error={mockError}
        />
      );

      const input = screen.getByLabelText('Test Label');
      const errorElement = screen.getByRole('alert');

      expect(input).toHaveAttribute('type', 'text');
      expect(input).toBeDisabled();
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(errorElement).toHaveTextContent('Required');
    });

    it('renders textarea with custom rows, placeholder, and error', () => {
      const mockError: FieldError = {
        type: 'minLength',
        message: 'Too short',
      };

      render(
        <FormField
          {...baseProps}
          type="textarea"
          rows={8}
          placeholder="Type here..."
          error={mockError}
        />
      );

      const textarea = screen.getByPlaceholderText('Type here...');
      const errorElement = screen.getByRole('alert');

      expect(textarea.tagName).toBe('TEXTAREA');
      expect(textarea).toHaveAttribute('rows', '8');
      expect(errorElement).toHaveTextContent('Too short');
    });

    it('renders email input with custom placeholder and disabled', () => {
      render(
        <FormField
          {...baseProps}
          type="email"
          placeholder="email@example.com"
          disabled={true}
        />
      );

      const input = screen.getByPlaceholderText('email@example.com');
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toBeDisabled();
    });
  });

  describe('Required Field Indicator', () => {
    it('does not render required indicator when required is false', () => {
      render(<FormField {...baseProps} required={false} />);

      const requiredIndicator = screen.queryByLabelText('wajib diisi');
      expect(requiredIndicator).not.toBeInTheDocument();
    });

    it('does not render required indicator when required is undefined', () => {
      render(<FormField {...baseProps} />);

      const requiredIndicator = screen.queryByLabelText('wajib diisi');
      expect(requiredIndicator).not.toBeInTheDocument();
    });

    it('renders required indicator asterisk when required is true', () => {
      render(<FormField {...baseProps} required={true} />);

      const label = screen.getByText(/Test Label/);
      const requiredIndicator = screen.getByLabelText('wajib diisi');

      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent('Test Label*');
      expect(requiredIndicator).toBeInTheDocument();
      expect(requiredIndicator).toHaveTextContent('*');
    });

    it('sets aria-required to false when required is false', () => {
      render(<FormField {...baseProps} required={false} />);

      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('aria-required', 'false');
    });

    it('sets aria-required to true when required is true', () => {
      render(<FormField {...baseProps} required={true} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Field Descriptions', () => {
    it('does not render description when description is undefined', () => {
      render(<FormField {...baseProps} />);

      const description = screen.queryByTestId('test-id_description');
      expect(description).not.toBeInTheDocument();
    });

    it('renders description when description prop is provided', () => {
      render(
        <FormField
          {...baseProps}
          description="This is a field description"
        />
      );

      const description = screen.getByText('This is a field description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('form-description');
    });

    it('associates description with input using aria-describedby', () => {
      render(
        <FormField
          {...baseProps}
          description="Field description text"
        />
      );

      const input = screen.getByLabelText('Test Label');
      const description = screen.getByText('Field description text');

      expect(input).toHaveAttribute('aria-describedby', 'test-id_description');
      expect(description).toHaveAttribute('id', 'test-id_description');
    });

    it('associates both description and error using aria-describedby', () => {
      const mockError: FieldError = {
        type: 'required',
        message: 'Required field',
      };

      render(
        <FormField
          {...baseProps}
          description="Field description"
          error={mockError}
        />
      );

      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveAttribute('aria-describedby', 'test-id_description test-id_error');
    });
  });

  describe('Visual Error State', () => {
    it('does not apply error class when error is undefined', () => {
      render(<FormField {...baseProps} />);

      const input = screen.getByLabelText('Test Label');
      expect(input).not.toHaveClass('form-control-error');
    });

    it('applies error class when error is provided', () => {
      const mockError: FieldError = {
        type: 'required',
        message: 'Required',
      };

      render(<FormField {...baseProps} error={mockError} />);

      const input = screen.getByLabelText('Test Label');
      expect(input).toHaveClass('form-control-error');
    });

    it('applies error class to textarea when error is provided', () => {
      const mockError: FieldError = {
        type: 'required',
        message: 'Required',
      };

      render(<FormField {...baseProps} type="textarea" error={mockError} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('form-control-error');
    });
  });

  describe('Character Count for Textarea', () => {
    it('does not render character count when maxLength is undefined', () => {
      render(<FormField {...baseProps} type="textarea" />);

      const charCount = screen.queryByText(/karakter/);
      expect(charCount).not.toBeInTheDocument();
    });

    it('renders character count when maxLength is provided for textarea', () => {
      render(
        <FormField {...baseProps} type="textarea" maxLength={500} />
      );

      const charCount = screen.getByText(/karakter/);
      expect(charCount).toBeInTheDocument();
      expect(charCount).toHaveClass('char-count');
      expect(charCount).toHaveTextContent('0 / 500 karakter');
    });

    it('updates character count as user types', () => {
      render(
        <FormField {...baseProps} type="textarea" maxLength={100} />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const charCount = screen.getByText(/karakter/);

      expect(charCount).toHaveTextContent('0 / 100 karakter');

      fireEvent.change(textarea, { target: { value: 'Hello' } });
      expect(charCount).toHaveTextContent('5 / 100 karakter');

      fireEvent.change(textarea, { target: { value: 'Hello World' } });
      expect(charCount).toHaveTextContent('11 / 100 karakter');
    });

    it('sets aria-live="off" on character count', () => {
      render(
        <FormField {...baseProps} type="textarea" maxLength={200} />
      );

      const charCount = screen.getByText(/karakter/);
      expect(charCount).toHaveAttribute('aria-live', 'off');
    });

    it('sets maxLength attribute on textarea', () => {
      render(
        <FormField {...baseProps} type="textarea" maxLength={300} />
      );

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxlength', '300');
    });

    it('does not render character count for non-textarea fields', () => {
      render(<FormField {...baseProps} maxLength={100} />);

      const charCount = screen.queryByText(/karakter/);
      expect(charCount).not.toBeInTheDocument();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('does not render toggle button for non-password fields', () => {
      render(<FormField {...baseProps} type="text" />);

      const toggleButton = screen.queryByRole('button', {
        name: /tampilkan|sembunyikan/i,
      });
      expect(toggleButton).not.toBeInTheDocument();
    });

    it('renders toggle button for password fields', () => {
      render(<FormField {...baseProps} type="password" />);

      const toggleButton = screen.queryByRole('button', {
        name: /tampilkan/i,
      });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveClass('password-toggle');
    });

    it('displays password input type initially', () => {
      render(<FormField {...baseProps} type="password" />);

      const input = document.querySelector('#test-id') as HTMLInputElement;
      expect(input).toHaveAttribute('type', 'password');
    });

    it('toggles to text type when clicked', () => {
      render(<FormField {...baseProps} type="password" />);

      const toggleButton = screen.queryByRole('button', {
        name: /tampilkan/i,
      });
      const input = document.querySelector('#test-id') as HTMLInputElement;

      expect(input).toHaveAttribute('type', 'password');

      if (toggleButton) fireEvent.click(toggleButton);

      expect(input).toHaveAttribute('type', 'text');
    });

    it('updates aria-label when toggling password visibility', () => {
      render(<FormField {...baseProps} type="password" />);

      const toggleButton = screen.queryByRole('button', {
        name: /tampilkan kata sandi/i,
      });

      expect(toggleButton).toHaveAttribute('aria-label', 'Tampilkan kata sandi');

      if (toggleButton) fireEvent.click(toggleButton);

      expect(toggleButton).toHaveAttribute('aria-label', 'Sembunyikan kata sandi');
    });

    it('updates aria-pressed when toggling password visibility', () => {
      render(<FormField {...baseProps} type="password" />);

      const toggleButton = screen.queryByRole('button');

      expect(toggleButton).toHaveAttribute('aria-pressed', 'false');

      if (toggleButton) fireEvent.click(toggleButton);

      expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('contains eye icon when password is hidden', () => {
      render(<FormField {...baseProps} type="password" />);

      const toggleButton = screen.queryByRole('button');
      const eyeIcon = toggleButton?.querySelector('.fa-eye');

      expect(eyeIcon).toBeInTheDocument();
    });

    it('contains eye-slash icon when password is visible', () => {
      render(<FormField {...baseProps} type="password" />);

      const toggleButton = screen.queryByRole('button');

      if (toggleButton) fireEvent.click(toggleButton);

      const eyeSlashIcon = toggleButton?.querySelector('.fa-eye-slash');
      expect(eyeSlashIcon).toBeInTheDocument();
    });

    it('has aria-hidden="true" on icon', () => {
      render(<FormField {...baseProps} type="password" />);

      const toggleButton = screen.queryByRole('button');
      const icon = toggleButton?.querySelector('i');

      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('disables toggle button when input is disabled', () => {
      render(<FormField {...baseProps} type="password" disabled={true} />);

      const input = document.querySelector('#test-id') as HTMLInputElement;
      const toggleButton = screen.queryByRole('button');

      expect(input).toBeDisabled();
      expect(toggleButton).toBeDisabled();
    });
  });

  describe('Input Wrapper for Password Toggle', () => {
    it('wraps non-password input without wrapper', () => {
      render(<FormField {...baseProps} type="text" />);

      const input = screen.getByRole('textbox');
      const wrapper = input.closest('.input-wrapper');

      expect(wrapper).not.toBeInTheDocument();
    });

    it('wraps password input with wrapper div', () => {
      render(<FormField {...baseProps} type="password" />);

      const input = document.querySelector('#test-id') as HTMLInputElement;
      const wrapper = input?.closest('.input-wrapper');

      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass('input-wrapper');
    });

    it('positions toggle button inside wrapper', () => {
      render(<FormField {...baseProps} type="password" />);

      const input = document.querySelector('#test-id') as HTMLInputElement;
      const wrapper = input?.closest('.input-wrapper');
      const toggleButton = wrapper?.querySelector('.password-toggle');

      expect(toggleButton).toBeInTheDocument();
      expect(wrapper).toContainElement(toggleButton as HTMLElement);
    });
  });

  describe('Real-Time Validation', () => {
    it('triggers validation when trigger prop is provided', () => {
      const mockTrigger = jest.fn().mockResolvedValue(true);
      jest.useFakeTimers();

      render(
        <FormField
          {...baseProps}
          trigger={mockTrigger}
          debounceMs={300}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });

      jest.advanceTimersByTime(300);
      expect(mockTrigger).toHaveBeenCalledWith('test-id');
      expect(mockTrigger).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('does not trigger validation when trigger prop is undefined', () => {
      const mockTrigger = jest.fn();

      render(
        <FormField
          {...baseProps}
          trigger={undefined}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });

      expect(mockTrigger).not.toHaveBeenCalled();
    });

    it('debounces validation calls with default debounceMs', () => {
      const mockTrigger = jest.fn().mockResolvedValue(true);
      jest.useFakeTimers();

      render(
        <FormField
          {...baseProps}
          trigger={mockTrigger}
          debounceMs={300}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'a' } });
      fireEvent.change(input, { target: { value: 'ab' } });
      fireEvent.change(input, { target: { value: 'abc' } });

      expect(mockTrigger).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);
      expect(mockTrigger).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('uses custom debounceMs value', () => {
      const mockTrigger = jest.fn().mockResolvedValue(true);
      jest.useFakeTimers();

      render(
        <FormField
          {...baseProps}
          trigger={mockTrigger}
          debounceMs={500}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });

      jest.advanceTimersByTime(400);
      expect(mockTrigger).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockTrigger).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('handles rapid input changes correctly', () => {
      const mockTrigger = jest.fn().mockResolvedValue(true);
      jest.useFakeTimers();

      render(
        <FormField
          {...baseProps}
          trigger={mockTrigger}
          debounceMs={300}
        />
      );

      const input = screen.getByRole('textbox');

      for (let i = 0; i < 10; i++) {
        fireEvent.change(input, { target: { value: `test${i}` } });
      }

      jest.advanceTimersByTime(300);
      expect(mockTrigger).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('updates character count before debounce completes', () => {
      const mockTrigger = jest.fn().mockResolvedValue(true);
      jest.useFakeTimers();

      render(
        <FormField
          {...baseProps}
          type="textarea"
          maxLength={100}
          trigger={mockTrigger}
          debounceMs={300}
        />
      );

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      const charCount = screen.getByText(/karakter/);

      fireEvent.change(textarea, { target: { value: 'Hello' } });
      expect(charCount).toHaveTextContent('5 / 100 karakter');
      expect(mockTrigger).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);
      expect(mockTrigger).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('applies debounceMs=0 (no debouncing)', () => {
      const mockTrigger = jest.fn().mockResolvedValue(true);
      jest.useFakeTimers();

      render(
        <FormField
          {...baseProps}
          trigger={mockTrigger}
          debounceMs={0}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });

      jest.advanceTimersByTime(0);
      expect(mockTrigger).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });
  });

  describe('ARIA Live Regions for Real-Time Validation', () => {
    it('applies aria-live="polite" by default to error messages', () => {
      const mockError: FieldError = {
        type: 'required',
        message: 'This field is required',
      };

      render(<FormField {...baseProps} error={mockError} />);

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveAttribute('aria-live', 'polite');
    });

    it('applies custom aria-live value from props', () => {
      const mockError: FieldError = {
        type: 'required',
        message: 'This field is required',
      };

      render(
        <FormField
          {...baseProps}
          error={mockError}
          ariaLive="assertive"
        />
      );

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveAttribute('aria-live', 'assertive');
    });

    it('applies aria-live="off" when specified', () => {
      const mockError: FieldError = {
        type: 'required',
        message: 'This field is required',
      };

      render(
        <FormField
          {...baseProps}
          error={mockError}
          ariaLive="off"
        />
      );

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveAttribute('aria-live', 'off');
    });

    it('removes aria-live when error is cleared', () => {
      const mockError: FieldError = {
        type: 'required',
        message: 'This field is required',
      };

      const { rerender } = render(
        <FormField
          {...baseProps}
          error={mockError}
          ariaLive="polite"
        />
      );

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toHaveAttribute('aria-live', 'polite');

      rerender(<FormField {...baseProps} error={undefined} />);

      const errorAfterClear = screen.queryByRole('alert');
      expect(errorAfterClear).not.toBeInTheDocument();
    });
  });

  describe('Real-Time Validation with Debounce Integration', () => {
    it('prevents excessive validation calls during rapid typing', () => {
      const mockTrigger = jest.fn().mockResolvedValue(true);
      jest.useFakeTimers();

      render(
        <FormField
          {...baseProps}
          trigger={mockTrigger}
          debounceMs={300}
        />
      );

      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'a' } });
      jest.advanceTimersByTime(100);
      expect(mockTrigger).not.toHaveBeenCalled();

      fireEvent.change(input, { target: { value: 'ab' } });
      jest.advanceTimersByTime(100);
      expect(mockTrigger).not.toHaveBeenCalled();

      fireEvent.change(input, { target: { value: 'abc' } });
      jest.advanceTimersByTime(300);
      expect(mockTrigger).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('calls validation after debounce period completes', () => {
      const mockTrigger = jest.fn().mockResolvedValue(true);
      jest.useFakeTimers();

      render(
        <FormField
          {...baseProps}
          trigger={mockTrigger}
          debounceMs={300}
        />
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });

      jest.advanceTimersByTime(299);
      expect(mockTrigger).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(mockTrigger).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });

    it('handles consecutive debounce cycles correctly', () => {
      const mockTrigger = jest.fn().mockResolvedValue(true);
      jest.useFakeTimers();

      render(
        <FormField
          {...baseProps}
          trigger={mockTrigger}
          debounceMs={300}
        />
      );

      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'first' } });
      jest.advanceTimersByTime(300);
      expect(mockTrigger).toHaveBeenCalledTimes(1);

      fireEvent.change(input, { target: { value: 'second' } });
      jest.advanceTimersByTime(300);
      expect(mockTrigger).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });
  });
});
