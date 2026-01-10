import React from 'react';
import {
  renderWithProviders,
  mockOf,
  mockAsyncResolved,
  mockAsyncRejected,
  waitForAsync,
  createMockEvent,
  assertVisible,
  assertHidden,
  assertNotExists,
  getTextContent,
  assertTextContent,
  mockToast,
} from '../testHelpers';

describe('testHelpers', () => {
  describe('renderWithProviders', () => {
    it('should render React element', () => {
      const { container } = renderWithProviders(React.createElement('div', null, 'Test Content'));
      
      expect(container).toBeInTheDocument();
      expect(container.textContent).toBe('Test Content');
    });

    it('should render with options', () => {
      const { container } = renderWithProviders(React.createElement('div', null, 'With Options'), {
        container: document.createElement('div'),
      });
      
      expect(container.textContent).toBe('With Options');
    });
  });

  describe('mockOf', () => {
    it('should cast mock to typed mocked function', () => {
      const mockFn = jest.fn();
      const typedMock = mockOf<(val: string) => boolean>(mockFn);
      
      typedMock('value');
      
      expect(mockFn).toHaveBeenCalled();
    });
  });

  describe('mockAsyncResolved', () => {
    it('should create mock that resolves with value', async () => {
      const mock = mockAsyncResolved({ success: true });
      
      const result = await mock();
      
      expect(result).toEqual({ success: true });
    });
  });

  describe('mockAsyncRejected', () => {
    it('should create mock that rejects with error', async () => {
      const error = new Error('Test error');
      const mock = mockAsyncRejected(error);
      
      await expect(mock()).rejects.toThrow('Test error');
    });
  });

  describe('waitForAsync', () => {
    it('should wait for specified milliseconds', async () => {
      const start = Date.now();
      await waitForAsync(100);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(100);
    });

    it('should default to 0 milliseconds', async () => {
      const promise = waitForAsync();
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('createMockEvent', () => {
    it('should create mock event object', () => {
      const event = createMockEvent('test value');
      
      expect(event).toEqual({
        target: { value: 'test value' }
      });
    });
  });

  describe('assertVisible', () => {
    it('should assert element is visible', () => {
      const { container } = renderWithProviders(React.createElement('div', null, 'Visible'));
      const element = container.querySelector('div');
      
      expect(() => assertVisible(element)).not.toThrow();
    });

    it('should throw if element is null', () => {
      expect(() => assertVisible(null)).toThrow();
    });
  });

  describe('assertHidden', () => {
    it('should assert element is hidden', () => {
      const { container } = renderWithProviders(
        React.createElement('div', { style: { display: 'none' } }, 'Hidden')
      );
      const element = container.querySelector('div');
      
      expect(() => assertHidden(element)).not.toThrow();
    });
  });

  describe('assertNotExists', () => {
    it('should assert element is not in document', () => {
      const element = document.createElement('div');
      
      expect(() => assertNotExists(element)).not.toThrow();
    });
  });

  describe('getTextContent', () => {
    it('should get text content from element', () => {
      const element = document.createElement('div');
      element.textContent = 'Test Content';
      
      expect(getTextContent(element)).toBe('Test Content');
    });

    it('should return empty string for null element', () => {
      expect(getTextContent(null)).toBe('');
    });

    it('should return empty string for element without text content', () => {
      const element = document.createElement('div');
      
      expect(getTextContent(element)).toBe('');
    });
  });

  describe('assertTextContent', () => {
    it('should assert exact text content match', () => {
      const { container } = renderWithProviders(React.createElement('div', null, 'Test Content'));
      const element = container.querySelector('div');
      
      expect(() => assertTextContent(element, 'Test Content')).not.toThrow();
    });

    it('should assert regex pattern match', () => {
      const { container } = renderWithProviders(React.createElement('div', null, 'Test Content 123'));
      const element = container.querySelector('div');
      
      expect(() => assertTextContent(element, /Content \d+/)).not.toThrow();
    });

    it('should throw if element is null', () => {
      expect(() => assertTextContent(null, 'Test')).toThrow();
    });
  });

  describe('mockToast', () => {
    it('should create toast mock with success, error, info, warn methods', () => {
      const toast = mockToast();
      
      expect(toast.success).toBeDefined();
      expect(toast.error).toBeDefined();
      expect(toast.info).toBeDefined();
      expect(toast.warn).toBeDefined();
    });

    it('should call success method', () => {
      const toast = mockToast();
      
      toast.success('Success message');
      
      expect(toast.success).toHaveBeenCalledWith('Success message');
    });

    it('should call error method', () => {
      const toast = mockToast();
      
      toast.error('Error message');
      
      expect(toast.error).toHaveBeenCalledWith('Error message');
    });
  });
});
