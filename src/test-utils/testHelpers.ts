import { render, RenderOptions, fireEvent } from '@testing-library/react';
import { ReactElement } from 'react';

/**
 * Custom render function with common providers
 * Extend this in future to add more providers (context, theme, etc.)
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, options);
};

/**
 * Helper to type assertion for mocks
 */
export const mockOf = <T,>(mock: jest.Mock): jest.Mocked<T> => {
  return mock as unknown as jest.Mocked<T>;
};

/**
 * Helper to mock async function with resolved value
 */
export const mockAsyncResolved = <T,>(value: T): jest.Mock => {
  return jest.fn().mockResolvedValue(value);
};

/**
 * Helper to mock async function with rejected value
 */
export const mockAsyncRejected = (error: Error): jest.Mock => {
  return jest.fn().mockRejectedValue(error);
};

/**
 * Helper to wait for async operations
 */
export const waitForAsync = async (ms: number = 0): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Helper to create mock event
 */
export const createMockEvent = (value: string) => ({
  target: { value }
});

/**
 * Helper to click element by text
 */
export const clickByText = async (text: string | RegExp) => {
  const { screen } = await import('@testing-library/react');
  const buttons = screen.getAllByRole('button');
  const button = buttons.find(btn => 
    typeof text === 'string' 
      ? btn.textContent?.toLowerCase().includes(text.toLowerCase())
      : text.test(btn.textContent || '')
  );
  
  if (!button) {
    throw new Error(`Button with text "${text}" not found`);
  }
  
  fireEvent.click(button);
};

/**
 * Helper to type in input by placeholder
 */
export const typeByPlaceholder = async (placeholder: string | RegExp, value: string) => {
  const { screen } = await import('@testing-library/react');
  
  const input = screen.getByPlaceholderText(placeholder) as HTMLInputElement;
  
  if (!input) {
    throw new Error(`Input with placeholder "${placeholder}" not found`);
  }
  
  fireEvent.change(input, { target: { value } });
};

/**
 * Helper to assert element is visible
 */
export const assertVisible = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

/**
 * Helper to assert element is hidden
 */
export const assertHidden = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument();
  expect(element).not.toBeVisible();
};

/**
 * Helper to assert element is not in document
 */
export const assertNotExists = (element: HTMLElement | null) => {
  expect(element).not.toBeInTheDocument();
};

/**
 * Helper to get text content safely
 */
export const getTextContent = (element: HTMLElement | null): string => {
  return element?.textContent || '';
};

/**
 * Helper to assert text content
 */
export const assertTextContent = (element: HTMLElement | null, expected: string | RegExp) => {
  expect(element).toBeInTheDocument();
  const text = getTextContent(element);
  
  if (typeof expected === 'string') {
    expect(text).toBe(expected);
  } else {
    expect(text).toMatch(expected);
  }
};

/**
 * Helper to setup toast mock
 */
export const mockToast = () => {
  const toast = {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
  return toast;
};
