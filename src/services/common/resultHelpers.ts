import { 
    ServiceResult, 
    ServiceErrorCode, 
    ServiceErrorCodeType,
    ServiceException, 
    isServiceException 
} from './';

export function createSuccessResult<T>(
    message: string,
    data?: T,
    metadata?: Record<string, unknown>
): ServiceResult<T> {
    return {
        success: true,
        message,
        data,
        metadata,
    };
}

export function createErrorResult<T = void>(
    error: string | ServiceException,
    errorCode?: ServiceErrorCodeType,
    metadata?: Record<string, unknown>
): ServiceResult<T> {
    if (isServiceException(error)) {
        return {
            success: false,
            error: error.message,
            errorCode: error.code as ServiceErrorCodeType,
            metadata: {
                ...metadata,
                isRetryable: error.isRetryable,
                isTimeout: error.isTimeout,
            },
        };
    }

    return {
        success: false,
        error: error as string,
        errorCode: (errorCode || ServiceErrorCode.UNKNOWN) as ServiceErrorCodeType,
        metadata,
    };
}

export function mapToServiceResult<T>(
    success: boolean,
    successMessage: string,
    errorMessage: string,
    data?: T,
    errorCode?: ServiceErrorCodeType
): ServiceResult<T> {
    if (success) {
        return {
            success: true,
            message: successMessage,
            data,
        };
    }

    return {
        success: false,
        error: errorMessage,
        errorCode: errorCode as ServiceErrorCodeType,
    };
}
