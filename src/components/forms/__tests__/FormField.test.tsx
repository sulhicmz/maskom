import { render, screen } from '@testing-library/react';
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
});
