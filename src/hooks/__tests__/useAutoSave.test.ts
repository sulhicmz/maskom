 
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoSave } from '../useAutoSave';

const mockLocalStorage = (() => {
   let store: Record<string, string> = {};

   return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
         store[key] = value;
      },
      removeItem: (key: string) => {
         delete store[key];
      },
      clear: () => {
         store = {};
      },
      _getStore: () => ({ ...store })
   };
})();

Object.defineProperty(global, 'localStorage', {
   value: mockLocalStorage as unknown as Storage,
   writable: true
});

interface TestFormData {
   name: string;
   email: string;
   message: string;
}

describe('useAutoSave', () => {
   beforeEach(() => {
      mockLocalStorage.clear();
      jest.useFakeTimers();
      jest.clearAllMocks();
   });

   afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
   });

   describe('initialization', () => {
      it('should initialize with default config values', () => {
         const testData: TestFormData = {
            name: 'Test User',
            email: 'test@example.com',
            message: 'Test message'
         };

         const { result } = renderHook(() =>
            useAutoSave<TestFormData>({
               formId: 'test_form',
               data: testData
            })
         );

         expect(result.current.isAutoSaving).toBe(false);
         expect(result.current.lastSavedAt).toBeNull();
         expect(result.current.hasDraft).toBe(false);
      });

      it('should restore draft on mount if exists', () => {
         const existingDraft: TestFormData = {
            name: 'Existing Draft',
            email: 'draft@example.com',
            message: 'Existing draft message'
         };

         mockLocalStorage.setItem(
            'draft_test_form',
            JSON.stringify({
               data: existingDraft,
               savedAt: new Date().toISOString(),
               formId: 'test_form'
            })
         );

         const onRestore = jest.fn();
         const { result } = renderHook(() =>
            useAutoSave<TestFormData>({
               formId: 'test_form',
               data: { name: '', email: '', message: '' },
               onRestore
            })
         );

         expect(onRestore).toHaveBeenCalledWith(existingDraft);
         expect(result.current.hasDraft).toBe(true);
      });

      it('should not restore draft when onRestore not provided', () => {
         const existingDraft: TestFormData = {
            name: 'Existing Draft',
            email: 'draft@example.com',
            message: 'Existing draft message'
         };

         mockLocalStorage.setItem(
            'draft_test_form',
            JSON.stringify({
               data: existingDraft,
               savedAt: new Date().toISOString(),
               formId: 'test_form'
            })
         );

         const { result } = renderHook(() =>
            useAutoSave<TestFormData>({
               formId: 'test_form',
               data: { name: '', email: '', message: '' }
            })
         );

         expect(result.current.hasDraft).toBe(true);
      });

      it('should handle invalid draft data gracefully', () => {
         mockLocalStorage.setItem('draft_test_form', 'invalid json');

         const onRestore = jest.fn();
         const { result } = renderHook(() =>
            useAutoSave<TestFormData>({
               formId: 'test_form',
               data: { name: '', email: '', message: '' },
               onRestore
            })
         );

         expect(onRestore).not.toHaveBeenCalled();
         expect(result.current.hasDraft).toBe(false);
      });

      it('should set hasDraft to true when draft exists', () => {
         const existingDraft: TestFormData = {
            name: 'Draft User',
            email: 'draft@example.com',
            message: 'Draft message'
         };

         mockLocalStorage.setItem(
            'draft_test_form',
            JSON.stringify({
               data: existingDraft,
               savedAt: new Date().toISOString(),
               formId: 'test_form'
            })
         );

         const { result } = renderHook(() =>
            useAutoSave<TestFormData>({
               formId: 'test_form',
               data: { name: '', email: '', message: '' }
            })
         );

         expect(result.current.hasDraft).toBe(true);
      });
   });

   describe('saveDraft', () => {
      it('should save draft to localStorage', () => {
         const testData: TestFormData = {
            name: 'Test User',
            email: 'test@example.com',
            message: 'Test message'
         };

         const { result } = renderHook(() =>
            useAutoSave<TestFormData>({
               formId: 'test_form',
               data: testData
            })
         );

         act(() => {
            result.current.saveDraft();
         });

         const stored = mockLocalStorage.getItem('draft_test_form');
         expect(stored).toBeDefined();

         const parsed = JSON.parse(stored!);
         expect(parsed.data).toEqual(testData);
         expect(parsed.formId).toBe('test_form');
         expect(parsed.savedAt).toBeDefined();
      });

      it('should update lastSavedAt timestamp', () => {
         const testData: TestFormData = {
            name: 'Test User',
            email: 'test@example.com',
            message: 'Test message'
         };

         const { result } = renderHook(() =>
            useAutoSave<TestFormData>({
               formId: 'test_form',
               data: testData
            })
         );

         expect(result.current.lastSavedAt).toBeNull();

         act(() => {
            result.current.saveDraft();
         });

         expect(result.current.lastSavedAt).toBeInstanceOf(Date);
      });

      it('should call onSave callback if provided', async () => {
         const testData: TestFormData = {
            name: 'Test User',
            email: 'test@example.com',
            message: 'Test message'
         };

         const onSave = jest.fn();
         const { result } = renderHook(() =>
            useAutoSave<TestFormData>({
               formId: 'test_form',
               data: testData,
               onSave
            })
         );

         await act(async () => {
            await result.current.saveDraft();
         });

         expect(onSave).toHaveBeenCalledWith(testData);
      });

      it('should set isAutoSaving to false after save', async () => {
         const testData: TestFormData = {
            name: 'Test User',
            email: 'test@example.com',
            message: 'Test message'
         };

         const { result } = renderHook(() =>
            useAutoSave<TestFormData>({
               formId: 'test_form',
               data: testData
            })
         );

         await act(async () => {
            await result.current.saveDraft();
         });

         await waitFor(() => {
            expect(result.current.isAutoSaving).toBe(false);
         });
      });

      it('should handle localStorage save errors gracefully', () => {
         const testData: TestFormData = {
            name: 'Test User',
            email: 'test@example.com',
            message: 'Test message'
         };

         const originalSetItem = mockLocalStorage.setItem;
         mockLocalStorage.setItem = jest.fn(() => {
            throw new Error('Storage error');
         });

         const { result } = renderHook(() =>
            useAutoSave<TestFormData>({
               formId: 'test_form',
               data: testData
            })
         );

         act(() => {
            result.current.saveDraft();
         });

         mockLocalStorage.setItem = originalSetItem;
         expect(result.current.isAutoSaving).toBe(false);
      });
   });

   describe('clearDraft', () => {
      it('should remove draft from localStorage', () => {
         const testData: TestFormData = {
            name: 'Test User',
            email: 'test@example.com',
            message: 'Test message'
         };

         mockLocalStorage.setItem(
            'draft_test_form',
            JSON.stringify({
               data: testData,
               savedAt: new Date().toISOString(),
               formId: 'test_form'
            })
         );

         const { result } = renderHook(() =>
            useAutoSave<TestFormData>({
               formId: 'test_form',
               data: testData
            })
         );

         act(() => {
            result.current.clearDraft();
         });

         const stored = mockLocalStorage.getItem('draft_test_form');
         expect(stored).toBeNull();
      });

      it('should reset lastSavedAt to null', () => {
         const testData: TestFormData = {
            name: 'Test User',
            email: 'test@example.com',
            message: 'Test message'
         };

         mockLocalStorage.setItem(
            'draft_test_form',
            JSON.stringify({
               data: testData,
               savedAt: new Date().toISOString(),
               formId: 'test_form'
            })
         );

         const { result } = renderHook(() =>
            useAutoSave<TestFormData>({
               formId: 'test_form',
               data: testData
            })
         );

         act(() => {
            result.current.saveDraft();
         });

         expect(result.current.lastSavedAt).toBeInstanceOf(Date);

         act(() => {
            result.current.clearDraft();
         });

         expect(result.current.lastSavedAt).toBeNull();
      });

      it('should set hasDraft to false', () => {
         const testData: TestFormData = {
            name: 'Test User',
            email: 'test@example.com',
            message: 'Test message'
         };

         mockLocalStorage.setItem(
            'draft_test_form',
            JSON.stringify({
               data: testData,
               savedAt: new Date().toISOString(),
               formId: 'test_form'
            })
         );

         const { result } = renderHook(() =>
            useAutoSave<TestFormData>({
               formId: 'test_form',
               data: testData
            })
         );

         expect(result.current.hasDraft).toBe(true);

         act(() => {
            result.current.clearDraft();
         });

         expect(result.current.hasDraft).toBe(false);
      });
   });

   describe('restoreDraft', () => {
      it('should return draft data from localStorage', () => {
         const existingDraft: TestFormData = {
            name: 'Restored User',
            email: 'restored@example.com',
            message: 'Restored message'
         };

         mockLocalStorage.setItem(
            'draft_test_form',
            JSON.stringify({
               data: existingDraft,
               savedAt: new Date().toISOString(),
               formId: 'test_form'
            })
         );

         const { result } = renderHook(() =>
            useAutoSave<TestFormData>({
               formId: 'test_form',
               data: { name: '', email: '', message: '' }
            })
         );

         const restored = result.current.restoreDraft();

         expect(restored).toEqual(existingDraft);
      });

      it('should return null when no draft exists', () => {
         const { result } = renderHook(() =>
            useAutoSave<TestFormData>({
               formId: 'test_form',
               data: { name: '', email: '', message: '' }
            })
         );

         const restored = result.current.restoreDraft();

         expect(restored).toBeNull();
      });

      it('should handle invalid JSON data', () => {
         mockLocalStorage.setItem('draft_test_form', 'invalid json');

         const { result } = renderHook(() =>
            useAutoSave<TestFormData>({
               formId: 'test_form',
               data: { name: '', email: '', message: '' }
            })
         );

         const restored = result.current.restoreDraft();

         expect(restored).toBeNull();
      });
   });

   describe('auto-save interval', () => {
       it('should respect default auto-save interval', () => {
          const testData: TestFormData = {
             name: 'Test User',
             email: 'test@example.com',
             message: 'Test message'
          };

          const onSave = jest.fn();
          renderHook(() =>
             useAutoSave<TestFormData>({
                formId: 'test_form',
                data: testData,
                onSave
             })
          );

          act(() => {
             jest.advanceTimersByTime(30000);
          });

          expect(onSave).toHaveBeenCalled();
       });

       it('should stop auto-save when disabled', () => {
          const testData: TestFormData = {
             name: 'Test User',
             email: 'test@example.com',
             message: 'Test message'
          };

          const onSave = jest.fn();
          renderHook(() =>
             useAutoSave<TestFormData>({
                formId: 'test_form',
                data: testData,
                enabled: false,
                autoSaveInterval: 1000,
                onSave
             })
          );

          act(() => {
             jest.advanceTimersByTime(5000);
          });

          expect(onSave).not.toHaveBeenCalled();
       });
   });

   describe('cleanup', () => {
      it('should clear timers on unmount', () => {
         const testData: TestFormData = {
            name: 'Test User',
            email: 'test@example.com',
            message: 'Test message'
         };

         const { unmount } = renderHook(() =>
            useAutoSave<TestFormData>({
               formId: 'test_form',
               data: testData,
               autoSaveInterval: 1000
            })
         );

         unmount();

         act(() => {
            jest.advanceTimersByTime(5000);
         });
      });
   });

   describe('type safety', () => {
      it('should accept typed data', () => {
         interface CustomData {
            customField: string;
            numberField: number;
         }

         const customData: CustomData = {
            customField: 'value',
            numberField: 42
         };

         const { result } = renderHook(() =>
            useAutoSave<CustomData>({
               formId: 'custom_form',
               data: customData
            })
         );

         expect(result.current).toBeDefined();
      });
   });

   describe('edge cases', () => {
      it('should handle undefined data gracefully', () => {
         const { result } = renderHook(() =>
            useAutoSave<TestFormData>({
               formId: 'test_form',
               data: { name: '', email: '', message: '' }
            })
         );

         act(() => {
            result.current.saveDraft();
         });

         const stored = mockLocalStorage.getItem('draft_test_form');
         expect(stored).toBeDefined();
      });

      it('should handle empty formId', () => {
         const testData: TestFormData = {
            name: 'Test User',
            email: 'test@example.com',
            message: 'Test message'
         };

         const { result } = renderHook(() =>
            useAutoSave<TestFormData>({
               formId: '',
               data: testData
            })
         );

         act(() => {
            result.current.saveDraft();
         });

         const stored = mockLocalStorage.getItem('draft_');
         expect(stored).toBeDefined();
      });
   });
});