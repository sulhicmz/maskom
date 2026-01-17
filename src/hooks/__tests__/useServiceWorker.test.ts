import { renderHook, act } from '@testing-library/react';
import { useServiceWorker } from '@/hooks/useServiceWorker';

describe('useServiceWorker', () => {
  const originalServiceWorker = navigator.serviceWorker;
  const mockRegistration = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    scope: 'https://example.com/sw.js',
    installing: null,
    waiting: null,
    active: null,
    update: jest.fn(),
    unregister: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: jest.fn(() => Promise.resolve(mockRegistration)),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'serviceWorker', {
      value: originalServiceWorker,
      writable: true,
      configurable: true,
    });
  });

  it('should initialize with unsupported status when service worker is not available', () => {
    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    delete (navigator as unknown as Record<string, unknown>).serviceWorker;

    const { result } = renderHook(() => useServiceWorker());

    expect(result.current.status).toBe('unsupported');
  });

  it('should register service worker on mount', async () => {
    const { result } = renderHook(() => useServiceWorker());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
    expect(result.current.status).toBe('activated');
  });

  it('should set status to error when registration fails', async () => {
    (navigator.serviceWorker.register as jest.Mock).mockRejectedValue(new Error('Registration failed'));

    const { result } = renderHook(() => useServiceWorker());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.status).toBe('error');
  });

  it('should detect available update when waiting worker exists', async () => {
    const waitingRegistration = {
      ...mockRegistration,
      waiting: { addEventListener: jest.fn() } as ServiceWorker,
    };
    (navigator.serviceWorker.register as jest.Mock).mockResolvedValue(waitingRegistration);

    const { result } = renderHook(() => useServiceWorker());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.updateAvailable).toBe(true);
  });

  it('should provide skipWaiting function', async () => {
    const waitingWorker = { postMessage: jest.fn() };
    const waitingRegistration = {
      ...mockRegistration,
      waiting: waitingWorker,
    };
    (navigator.serviceWorker.register as jest.Mock).mockResolvedValue(waitingRegistration);

    const { result } = renderHook(() => useServiceWorker());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(typeof result.current.skipWaiting).toBe('function');
  });

  it('should provide clearCache function', async () => {
    const activeWorker = { postMessage: jest.fn() };
    const activeRegistration = {
      ...mockRegistration,
      active: activeWorker,
    };
    (navigator.serviceWorker.register as jest.Mock).mockResolvedValue(activeRegistration);

    const { result } = renderHook(() => useServiceWorker());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(typeof result.current.clearCache).toBe('function');
  });
});
