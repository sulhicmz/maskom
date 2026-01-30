import { logComponentError, logServiceError, logAPICallError, handleAsyncError } from '../../errorHandler'

describe('errorHandler', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('logComponentError', () => {
    it('should log error with component name, operation, and error message', () => {
      const error = new Error('Test error')
      logComponentError({ componentName: 'TestComponent', operation: 'test operation', error })

      expect(console.error).toHaveBeenCalledWith(
        '[TestComponent] Failed to test operation:',
        expect.objectContaining({
          message: 'Test error',
          stack: expect.any(String)
        })
      )
    })

    it('should handle string errors', () => {
      logComponentError({ componentName: 'TestComponent', operation: 'test operation', error: 'String error' })

      expect(console.error).toHaveBeenCalledWith(
        '[TestComponent] Failed to test operation:',
        expect.objectContaining({
          message: 'String error',
          stack: undefined
        })
      )
    })

    it('should handle unknown error types', () => {
      logComponentError({ componentName: 'TestComponent', operation: 'test operation', error: 12345 })

      expect(console.error).toHaveBeenCalledWith(
        '[TestComponent] Failed to test operation:',
        expect.objectContaining({
          message: '12345',
          stack: undefined
        })
      )
    })

    it('should include additional context in log', () => {
      const error = new Error('Test error')
      logComponentError({
        componentName: 'TestComponent',
        operation: 'test operation',
        error,
        additionalContext: { userId: '123', action: 'click' }
      })

      expect(console.error).toHaveBeenCalledWith(
        '[TestComponent] Failed to test operation:',
        expect.objectContaining({
          message: 'Test error',
          userId: '123',
          action: 'click'
        })
      )
    })

    it('should handle missing additional context', () => {
      const error = new Error('Test error')
      logComponentError({ componentName: 'TestComponent', operation: 'test operation', error })

      expect(console.error).toHaveBeenCalledWith(
        '[TestComponent] Failed to test operation:',
        expect.objectContaining({
          message: 'Test error',
          stack: expect.any(String)
        })
      )
    })
  })

  describe('logServiceError', () => {
    it('should log service error with service name, operation, and error message', () => {
      const error = new Error('Service error')
      logServiceError('TestService', 'test operation', error)

      expect(console.error).toHaveBeenCalledWith(
        '[TestService] Service error during test operation:',
        'Service error'
      )
    })

    it('should handle string errors', () => {
      logServiceError('TestService', 'test operation', 'String error')

      expect(console.error).toHaveBeenCalledWith(
        '[TestService] Service error during test operation:',
        'String error'
      )
    })

    it('should handle unknown error types', () => {
      logServiceError('TestService', 'test operation', { code: 500 })

      expect(console.error).toHaveBeenCalledWith(
        '[TestService] Service error during test operation:',
        '[object Object]'
      )
    })
  })

  describe('logAPICallError', () => {
    it('should log API error with endpoint, method, and error message', () => {
      const error = new Error('API error')
      logAPICallError('/api/test', 'GET', error)

      expect(console.error).toHaveBeenCalledWith(
        '[API] GET /api/test failed:',
        'API error'
      )
    })

    it('should handle string errors', () => {
      logAPICallError('/api/test', 'POST', 'String error')

      expect(console.error).toHaveBeenCalledWith(
        '[API] POST /api/test failed:',
        'String error'
      )
    })

    it('should handle unknown error types', () => {
      logAPICallError('/api/test', 'DELETE', { status: 404 })

      expect(console.error).toHaveBeenCalledWith(
        '[API] DELETE /api/test failed:',
        '[object Object]'
      )
    })
  })

  describe('handleAsyncError', () => {
    it('should return a function that calls logComponentError', () => {
      const error = new Error('Async error')
      const handler = handleAsyncError('TestComponent', 'async operation')

      handler(error)

      expect(console.error).toHaveBeenCalledWith(
        '[TestComponent] Failed to async operation:',
        expect.objectContaining({
          message: 'Async error'
        })
      )
    })

    it('should allow passing error to returned function', () => {
      const error = new Error('Async error')
      const handler = handleAsyncError('TestComponent', 'async operation')

      handler(error)

      expect(console.error).toHaveBeenCalledTimes(1)
    })

    it('should handle different error types through returned function', () => {
      const handler = handleAsyncError('TestComponent', 'async operation')

      handler('String async error')
      handler({ code: 500 })

      expect(console.error).toHaveBeenCalledTimes(2)
    })

    it('should not throw when called', () => {
      const handler = handleAsyncError('TestComponent', 'async operation')

      expect(() => handler(new Error('Test'))).not.toThrow()
    })
  })

  describe('error formatting', () => {
    it('should preserve error stack for Error objects', () => {
      const error = new Error('Test error')
      error.stack = 'Error: Test error\n  at test.js:1:10'

      logComponentError({ componentName: 'TestComponent', operation: 'test operation', error })

      expect(console.error).toHaveBeenCalledWith(
        '[TestComponent] Failed to test operation:',
        expect.objectContaining({
          stack: 'Error: Test error\n  at test.js:1:10'
        })
      )
    })

    it('should handle Error subclasses', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message)
          this.name = 'CustomError'
        }
      }

      const error = new CustomError('Custom error')
      logComponentError({ componentName: 'TestComponent', operation: 'test operation', error })

      expect(console.error).toHaveBeenCalledWith(
        '[TestComponent] Failed to test operation:',
        expect.objectContaining({
          message: 'Custom error',
          stack: expect.any(String)
        })
      )
    })
  })
})
