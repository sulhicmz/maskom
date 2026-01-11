import { render, screen, fireEvent } from '@testing-library/react';
import LoadingButton from '../LoadingButton';

describe('LoadingButton', () => {
  const baseProps = {
    children: 'Submit',
  };

  describe('Rendering', () => {
    it('renders button with children', () => {
      render(<LoadingButton {...baseProps} />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Submit');
    });

    it('renders as submit type by default', () => {
      render(<LoadingButton {...baseProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('renders with custom className', () => {
      render(<LoadingButton {...baseProps} className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('renders with multiple class names', () => {
      render(<LoadingButton {...baseProps} className="class1 class2 class3" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('class1');
      expect(button).toHaveClass('class2');
      expect(button).toHaveClass('class3');
    });

    it('renders children as React node', () => {
      render(
        <LoadingButton>
          <span>Button Content</span>
        </LoadingButton>
      );

      const button = screen.getByRole('button');
      expect(button).toContainHTML('<span>Button Content</span>');
    });

    it('renders children as complex content', () => {
      render(
        <LoadingButton>
          <span>Icon</span> Text <span>Icon2</span>
        </LoadingButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Icon Text Icon2');
    });
  });

  describe('Loading State', () => {
    it('shows children when isLoading is false', () => {
      render(<LoadingButton {...baseProps} isLoading={false} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Submit');
    });

    it('shows children when isLoading is undefined', () => {
      render(<LoadingButton {...baseProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Submit');
    });

    it('shows loadingText when isLoading is true', () => {
      render(<LoadingButton {...baseProps} isLoading={true} loadingText="Loading..." />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Loading...');
    });

    it('shows default loading text when isLoading is true and loadingText is not provided', () => {
      render(<LoadingButton {...baseProps} isLoading={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Loading...');
    });

    it('hides children when isLoading is true', () => {
      render(<LoadingButton {...baseProps} isLoading={true} loadingText="Sending..." />);

      const button = screen.getByRole('button');
      expect(button).not.toHaveTextContent('Submit');
      expect(button).toHaveTextContent('Sending...');
    });
  });

  describe('Disabled State', () => {
    it('enables button when disabled is false', () => {
      render(<LoadingButton {...baseProps} disabled={false} />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('enables button when disabled is undefined', () => {
      render(<LoadingButton {...baseProps} />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    it('disables button when disabled prop is true', () => {
      render(<LoadingButton {...baseProps} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('disables button when isLoading is true', () => {
      render(<LoadingButton {...baseProps} isLoading={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('disables button when both disabled and isLoading are true', () => {
      render(<LoadingButton {...baseProps} disabled={true} isLoading={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('keeps button disabled when isLoading is false but disabled is true', () => {
      render(<LoadingButton {...baseProps} disabled={true} isLoading={false} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('sets aria-live to polite', () => {
      render(<LoadingButton {...baseProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-live', 'polite');
    });

    it('sets aria-busy to true when isLoading is true', () => {
      render(<LoadingButton {...baseProps} isLoading={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('sets aria-busy to false when isLoading is false', () => {
      render(<LoadingButton {...baseProps} isLoading={false} />);

      const button = screen.getByRole('button');
      const ariaBusy = button.getAttribute('aria-busy');
      expect(ariaBusy).toBe('false');
    });

    it('sets aria-busy to false when isLoading is undefined', () => {
      render(<LoadingButton {...baseProps} />);

      const button = screen.getByRole('button');
      const ariaBusy = button.getAttribute('aria-busy');
      expect(ariaBusy).toBe(null);
    });
  });

  describe('Event Handling', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<LoadingButton {...baseProps} onClick={handleClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick handler when disabled', () => {
      const handleClick = jest.fn();
      render(<LoadingButton {...baseProps} disabled={true} onClick={handleClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick handler when isLoading is true', () => {
      const handleClick = jest.fn();
      render(<LoadingButton {...baseProps} isLoading={true} onClick={handleClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Additional Props', () => {
    it('spreads additional props to button', () => {
      render(
        <LoadingButton
          {...baseProps}
          data-testid="test-button"
          id="button-id"
          name="button-name"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-testid', 'test-button');
      expect(button).toHaveAttribute('id', 'button-id');
      expect(button).toHaveAttribute('name', 'button-name');
    });

    it('applies custom type when provided', () => {
      render(<LoadingButton {...baseProps} type="button" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('applies custom form prop', () => {
      render(<LoadingButton {...baseProps} form="test-form" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('form', 'test-form');
    });

    it('applies custom value prop', () => {
      render(<LoadingButton {...baseProps} value="custom-value" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('value', 'custom-value');
    });

    it('applies title prop', () => {
      render(<LoadingButton {...baseProps} title="Button title" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Button title');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      render(<LoadingButton>Submit</LoadingButton>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Submit');
    });

    it('handles whitespace-only children', () => {
      render(<LoadingButton>   </LoadingButton>);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('');
    });

    it('handles undefined loadingText', () => {
      render(<LoadingButton {...baseProps} isLoading={true} loadingText={undefined} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Loading...');
    });

    it('handles empty string loadingText', () => {
      render(<LoadingButton {...baseProps} isLoading={true} loadingText="" />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Loading...');
    });

    it('handles long children text', () => {
      const longText = 'This is a very long button text that should still work correctly';
      render(<LoadingButton>{longText}</LoadingButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(longText);
    });

    it('handles long loadingText', () => {
      const longLoadingText = 'This is a very long loading text that should still work correctly';
      render(<LoadingButton {...baseProps} isLoading={true} loadingText={longLoadingText} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent(longLoadingText);
    });

    it('handles special characters in children', () => {
      render(<LoadingButton>Button &amp; &quot;test&quot; <span>content</span></LoadingButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Button & "test" content');
    });

    it('handles special characters in loadingText', () => {
      render(<LoadingButton {...baseProps} isLoading={true} loadingText='Loading & "test"' />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Loading & "test"');
    });

    it('handles number children', () => {
      render(<LoadingButton>{123}</LoadingButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('123');
    });

    it('handles boolean children (true renders as empty)', () => {
      render(<LoadingButton>{true}</LoadingButton>);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('');
    });

    it('handles React Fragment children', () => {
      render(
        <LoadingButton>
          <>Fragment</>
        </LoadingButton>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Fragment');
    });
  });

  describe('Combined States', () => {
    it('handles loading state with custom className', () => {
      render(
        <LoadingButton
          {...baseProps}
          isLoading={true}
          className="loading-btn"
          loadingText="Sending..."
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('loading-btn');
      expect(button).toHaveTextContent('Sending...');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('handles disabled state with custom className and loadingText', () => {
      render(
        <LoadingButton
          {...baseProps}
          disabled={true}
          className="disabled-btn"
          loadingText="Disabled"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled-btn');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Submit');
    });

    it('handles loading, disabled, and custom props together', () => {
      render(
        <LoadingButton
          {...baseProps}
          isLoading={true}
          disabled={true}
          className="btn-primary"
          data-testid="loading-btn"
          loadingText="Processing..."
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-primary');
      expect(button).toHaveAttribute('data-testid', 'loading-btn');
      expect(button).toBeDisabled();
      expect(button).toHaveTextContent('Processing...');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('handles non-loading state with all optional props', () => {
      render(
        <LoadingButton
          {...baseProps}
          isLoading={false}
          disabled={false}
          className="btn-submit"
          id="submit-btn"
          title="Submit form"
        />
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-submit');
      expect(button).toHaveAttribute('id', 'submit-btn');
      expect(button).toHaveAttribute('title', 'Submit form');
      expect(button).not.toBeDisabled();
      expect(button).toHaveTextContent('Submit');
      expect(button).toHaveAttribute('aria-busy', 'false');
    });
  });
});
