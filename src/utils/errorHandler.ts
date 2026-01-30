export interface ErrorContext {
  componentName: string
  operation: string
  error: unknown
  additionalContext?: Record<string, unknown>
}

export const logComponentError = (context: ErrorContext): void => {
  const { componentName, operation, error, additionalContext } = context
  
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined
  
  console.error(`[${componentName}] Failed to ${operation}:`, {
    message: errorMessage,
    stack: errorStack,
    ...additionalContext
  })
}

export const logServiceError = (serviceName: string, operation: string, error: unknown): void => {
  const errorMessage = error instanceof Error ? error.message : String(error)
  console.error(`[${serviceName}] Service error during ${operation}:`, errorMessage)
}

export const logAPICallError = (endpoint: string, method: string, error: unknown): void => {
  const errorMessage = error instanceof Error ? error.message : String(error)
  console.error(`[API] ${method} ${endpoint} failed:`, errorMessage)
}

export const handleAsyncError = (componentName: string, operation: string) => {
  return (error: unknown) => {
    logComponentError({ componentName, operation, error })
  }
}
