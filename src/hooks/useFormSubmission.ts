import { useState } from 'react';
import { toast } from 'react-toastify';

export type BaseResult = {
    success: boolean;
    message?: string;
    error?: string;
    metadata?: Record<string, unknown>;
};

export interface FormSubmissionOptions<T> {
    onSuccess?: (result: T) => void;
    onError?: (error: string) => void;
    resetForm?: () => void;
    successMessage?: string;
}

export function useFormSubmission<TData = void, TResult extends BaseResult = BaseResult>(
    serviceCall: (data?: TData) => Promise<TResult>,
    options: FormSubmissionOptions<TResult> = {}
) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { onSuccess, onError, resetForm, successMessage } = options;

    const submit = async (data?: TData): Promise<TResult> => {
        setIsSubmitting(true);
        try {
            const result = await serviceCall(data);

            if (result.success) {
                setIsSuccess(true);
                if (successMessage) {
                    toast.success(successMessage, { position: 'top-center' });
                } else if (result.message) {
                    toast(result.message, { position: 'top-center' });
                }
                onSuccess?.(result);
                if (resetForm) {
                    resetForm();
                }
            } else if (result.metadata?.rateLimited) {
                setIsSuccess(false);
                toast.error(result.error || 'Terlalu banyak percobaan. Silakan coba lagi nanti.', { position: 'top-center' });
                onError?.(result.error || 'Rate limited');
            } else {
                setIsSuccess(false);
                toast.error(result.error || 'Gagal. Silakan coba lagi.', { position: 'top-center' });
                onError?.(result.error || 'Unknown error');
            }

            return result;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { submit, isSubmitting, isSuccess };
}
