/* eslint-disable @typescript-eslint/no-require-imports */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFormSubmission, ServiceResult } from '../useFormSubmission';

jest.mock('react-toastify', () => ({
  toast: jest.fn(() => ({ __t: Date.now() })),
}));

type TestServiceResult = ServiceResult & { message?: string };

const mockToast = require('react-toastify').toast;

mockToast.success = jest.fn(() => ({ __t: Date.now() }));
mockToast.error = jest.fn(() => ({ __t: Date.now() }));

describe('useFormSubmission', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('submit function - happy path', () => {
        it('should handle successful submission with success message', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<TestServiceResult>>;
            mockServiceCall.mockResolvedValue({
                success: true,
                message: 'Success!',
            });
            const onSuccess = jest.fn();
            const resetForm = jest.fn();

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall, {
                    onSuccess,
                    resetForm,
                    successMessage: 'Custom success message',
                })
            );

            await act(async () => {
                const resultData = await result.current.submit({ test: 'data' });
                expect(resultData).toEqual({ success: true, message: 'Success!' });
            });

            await waitFor(() => {
                expect(result.current.isSubmitting).toBe(false);
            });

            expect(mockServiceCall).toHaveBeenCalledWith({ test: 'data' });
            expect(mockToast.success).toHaveBeenCalledWith('Custom success message', { position: 'top-center' });
            expect(onSuccess).toHaveBeenCalledWith({ success: true, message: 'Success!' });
            expect(resetForm).toHaveBeenCalled();
        });

        it('should handle successful submission without success message', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<TestServiceResult>>;
            mockServiceCall.mockResolvedValue({
                success: true,
                message: 'Service message',
            });

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall)
            );

            await act(async () => {
                await result.current.submit({ test: 'data' });
            });

            await waitFor(() => {
                expect(result.current.isSubmitting).toBe(false);
            });

            expect(mockToast).toHaveBeenCalledWith('Service message', { position: 'top-center' });
        });

        it('should handle successful submission without message', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<ServiceResult>>;
            mockServiceCall.mockResolvedValue({
                success: true,
            });

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall)
            );

            await act(async () => {
                await result.current.submit({ test: 'data' });
            });

            await waitFor(() => {
                expect(result.current.isSubmitting).toBe(false);
            });

            expect(mockToast.success).not.toHaveBeenCalled();
        });

        it('should handle successful submission without callbacks', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<ServiceResult>>;
            mockServiceCall.mockResolvedValue({
                success: true,
            });

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall)
            );

            await act(async () => {
                await result.current.submit({ test: 'data' });
            });

            await waitFor(() => {
                expect(result.current.isSubmitting).toBe(false);
            });

            expect(mockServiceCall).toHaveBeenCalled();
        });
    });

    describe('submit function - error path', () => {
        it('should handle service failure with error message', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<TestServiceResult>>;
            mockServiceCall.mockResolvedValue({
                success: false,
                error: 'Service error',
            });
            const onError = jest.fn();

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall, { onError })
            );

            await act(async () => {
                const resultData = await result.current.submit({ test: 'data' });
                expect(resultData).toEqual({ success: false, error: 'Service error' });
            });

            await waitFor(() => {
                expect(result.current.isSubmitting).toBe(false);
            });

            expect(mockToast.error).toHaveBeenCalledWith('Service error', { position: 'top-center' });
            expect(onError).toHaveBeenCalledWith('Service error');
        });

        it('should handle service failure with default error message', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<ServiceResult>>;
            mockServiceCall.mockResolvedValue({
                success: false,
            });

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall)
            );

            await act(async () => {
                await result.current.submit({ test: 'data' });
            });

            await waitFor(() => {
                expect(result.current.isSubmitting).toBe(false);
            });

            expect(mockToast.error).toHaveBeenCalledWith('Gagal. Silakan coba lagi.', { position: 'top-center' });
        });

        it('should handle service failure without callbacks', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<TestServiceResult>>;
            mockServiceCall.mockResolvedValue({
                success: false,
                error: 'Error',
            });

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall)
            );

            await act(async () => {
                await result.current.submit({ test: 'data' });
            });

            await waitFor(() => {
                expect(result.current.isSubmitting).toBe(false);
            });

            expect(mockToast.error).toHaveBeenCalled();
        });
    });

    describe('submit function - rate limited path', () => {
        it('should handle rate limited submission with custom error', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<TestServiceResult>>;
            mockServiceCall.mockResolvedValue({
                success: false,
                rateLimited: true,
                error: 'Too many requests',
            });
            const onError = jest.fn();

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall, { onError })
            );

            await act(async () => {
                const resultData = await result.current.submit({ test: 'data' });
                expect(resultData).toEqual({ success: false, rateLimited: true, error: 'Too many requests' });
            });

            await waitFor(() => {
                expect(result.current.isSubmitting).toBe(false);
            });

            expect(mockToast.error).toHaveBeenCalledWith('Too many requests', { position: 'top-center' });
            expect(onError).toHaveBeenCalledWith('Too many requests');
        });

        it('should handle rate limited submission with default message', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<ServiceResult>>;
            mockServiceCall.mockResolvedValue({
                success: false,
                rateLimited: true,
            });

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall)
            );

            await act(async () => {
                await result.current.submit({ test: 'data' });
            });

            await waitFor(() => {
                expect(result.current.isSubmitting).toBe(false);
            });

            expect(mockToast.error).toHaveBeenCalledWith('Terlalu banyak percobaan. Silakan coba lagi nanti.', { position: 'top-center' });
        });
    });

    describe('isSubmitting state', () => {
        it('should set isSubmitting to true during submission', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<ServiceResult>>;
            mockServiceCall.mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
            );

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall)
            );

            let submitPromise: Promise<ServiceResult>;
            act(() => {
                submitPromise = result.current.submit({ test: 'data' });
            });

            expect(result.current.isSubmitting).toBe(true);

            await act(async () => {
                await submitPromise;
            });

            expect(result.current.isSubmitting).toBe(false);
        });

        it('should reset isSubmitting to false after successful submission', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<ServiceResult>>;
            mockServiceCall.mockResolvedValue({ success: true });

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall)
            );

            await act(async () => {
                await result.current.submit({ test: 'data' });
            });

            await waitFor(() => {
                expect(result.current.isSubmitting).toBe(false);
            });
        });

        it('should reset isSubmitting to false after failed submission', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<ServiceResult>>;
            mockServiceCall.mockResolvedValue({ success: false });

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall)
            );

            await act(async () => {
                await result.current.submit({ test: 'data' });
            });

            await waitFor(() => {
                expect(result.current.isSubmitting).toBe(false);
            });
        });

        it('should reset isSubmitting to false after error', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<ServiceResult>>;
            mockServiceCall.mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall)
            );

            await act(async () => {
                await expect(result.current.submit({ test: 'data' })).rejects.toThrow('Network error');
            });

            await waitFor(() => {
                expect(result.current.isSubmitting).toBe(false);
            });
        });
    });

    describe('callbacks', () => {
        it('should call onSuccess callback on successful submission', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<TestServiceResult>>;
            mockServiceCall.mockResolvedValue({ success: true, message: 'Success' });
            const onSuccess = jest.fn();

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall, { onSuccess })
            );

            await act(async () => {
                await result.current.submit({ test: 'data' });
            });

            expect(onSuccess).toHaveBeenCalledWith({ success: true, message: 'Success' });
        });

        it('should call onError callback on failed submission', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<TestServiceResult>>;
            mockServiceCall.mockResolvedValue({ success: false, error: 'Error' });
            const onError = jest.fn();

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall, { onError })
            );

            await act(async () => {
                await result.current.submit({ test: 'data' });
            });

            expect(onError).toHaveBeenCalledWith('Error');
        });

        it('should call onError callback on rate limited submission', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<TestServiceResult>>;
            mockServiceCall.mockResolvedValue({ success: false, rateLimited: true, error: 'Rate limited' });
            const onError = jest.fn();

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall, { onError })
            );

            await act(async () => {
                await result.current.submit({ test: 'data' });
            });

            expect(onError).toHaveBeenCalledWith('Rate limited');
        });

        it('should call resetForm callback on successful submission', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<ServiceResult>>;
            mockServiceCall.mockResolvedValue({ success: true });
            const resetForm = jest.fn();

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall, { resetForm })
            );

            await act(async () => {
                await result.current.submit({ test: 'data' });
            });

            expect(resetForm).toHaveBeenCalled();
        });

        it('should not call resetForm on failed submission', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<ServiceResult>>;
            mockServiceCall.mockResolvedValue({ success: false });
            const resetForm = jest.fn();

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall, { resetForm })
            );

            await act(async () => {
                await result.current.submit({ test: 'data' });
            });

            expect(resetForm).not.toHaveBeenCalled();
        });
    });

    describe('type safety', () => {
        it('should accept typed data and return ServiceResult', async () => {
            interface TestData {
                name: string;
                email: string;
            }

            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: TestData) => Promise<ServiceResult>>;
            mockServiceCall.mockResolvedValue({
                success: true,
            });

            const { result } = renderHook(() =>
                useFormSubmission<TestData>(mockServiceCall)
            );

            const serviceResult = await act(async () => {
                return await result.current.submit({ name: 'Test', email: 'test@example.com' });
            });

            expect(serviceResult).toBeDefined();
            expect(serviceResult.success).toBe(true);
        });
    });

    describe('edge cases', () => {
        it('should handle empty options', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<ServiceResult>>;
            mockServiceCall.mockResolvedValue({ success: true });

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall, {})
            );

            await act(async () => {
                await result.current.submit({ test: 'data' });
            });

            await waitFor(() => {
                expect(result.current.isSubmitting).toBe(false);
            });

            expect(mockServiceCall).toHaveBeenCalled();
        });

        it('should handle service call rejection', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<ServiceResult>>;
            mockServiceCall.mockRejectedValue(new Error('Network error'));

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall)
            );

            await act(async () => {
                await expect(result.current.submit({ test: 'data' })).rejects.toThrow('Network error');
            });

            await waitFor(() => {
                expect(result.current.isSubmitting).toBe(false);
            });

            expect(mockToast.error).not.toHaveBeenCalled();
        });

        it('should handle undefined properties in return value from service', async () => {
            const mockServiceCall = jest.fn() as jest.MockedFunction<(data: unknown) => Promise<ServiceResult>>;
            mockServiceCall.mockResolvedValue({
                success: true,
            });

            const { result } = renderHook(() =>
                useFormSubmission(mockServiceCall)
            );

            await act(async () => {
                const resultData = await result.current.submit({ test: 'data' });
                expect(resultData).toBeDefined();
                expect(resultData.success).toBe(true);
            });

            await waitFor(() => {
                expect(result.current.isSubmitting).toBe(false);
            });
        });
    });
});
