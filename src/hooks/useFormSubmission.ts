import { useState } from 'react';
import { toast } from 'react-toastify';

export interface FormSubmissionOptions<T> {
    onSuccess?: (result: T) => void;
    onError?: (error: string) => void;
    resetForm?: () => void;
    successMessage?: string;
}

export type ServiceResult = {
    success: boolean;
    message?: string;
    error?: string;
    rateLimited?: boolean;
};

export function useFormSubmission<T>(
    serviceCall: (data: T) => Promise<ServiceResult>,
    options: FormSubmissionOptions<ServiceResult> = {}
) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { onSuccess, onError, resetForm, successMessage } = options;

    const submit = async (data: T): Promise<ServiceResult> => {
        setIsSubmitting(true);
        try {
            const result = await serviceCall(data);

            if (result.success) {
                if (successMessage) {
                    toast.success(successMessage, { position: 'top-center' });
                } else if (result.message) {
                    toast(result.message, { position: 'top-center' });
                }
                onSuccess?.(result);
                if (resetForm) {
                    resetForm();
                }
            } else if (result.rateLimited) {
                toast.error(result.error || 'Terlalu banyak percobaan. Silakan coba lagi nanti.', { position: 'top-center' });
                onError?.(result.error || 'Rate limited');
            } else {
                toast.error(result.error || 'Gagal. Silakan coba lagi.', { position: 'top-center' });
                onError?.(result.error || 'Unknown error');
            }

            return result;
        } finally {
            setIsSubmitting(false);
        }
    };

    return { submit, isSubmitting };
}
