import { render, screen } from '@testing-library/react';
import ServiceWorkerUpdate from '@/components/common/ServiceWorkerUpdate';
import { ThemeProvider } from '@/contexts/ThemeContext';

declare global {
  interface ServiceWorkerRegistration {
    addEventListener(type: string, listener: () => void): void;
    removeEventListener(type: string, listener: () => void): void;
    scope: string;
    installing: ServiceWorker | null;
    waiting: ServiceWorker | null;
    active: ServiceWorker | null;
    update: () => void;
    unregister: () => void;
  }

  interface ServiceWorker {
    postMessage(message: unknown, transfer?: Transferable[]): void;
  }
}

describe('ServiceWorkerUpdate', () => {
  const originalServiceWorker = navigator.serviceWorker;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
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

  it('should not render anything when service worker is unsupported', () => {
    render(
      <ThemeProvider>
        <ServiceWorkerUpdate />
      </ThemeProvider>
    );
    expect(screen.queryByText('Update Tersedia')).not.toBeInTheDocument();
  });

  it('should not render anything when no update is available', async () => {
    const mockRegistration = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      scope: 'https://example.com/sw.js',
      installing: null as ServiceWorker | null,
      waiting: null as ServiceWorker | null,
      active: null as ServiceWorker | null,
      update: jest.fn(),
      unregister: jest.fn(),
    } as ServiceWorkerRegistration;

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: jest.fn(() => Promise.resolve(mockRegistration)),
      },
      writable: true,
      configurable: true,
    });

    render(
      <ThemeProvider>
        <ServiceWorkerUpdate />
      </ThemeProvider>
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(screen.queryByText('Update Tersedia')).not.toBeInTheDocument();
  });

  it('should render update notification when update is available', async () => {
    const mockWaitingWorker = { postMessage: jest.fn() } as ServiceWorker;
    const mockRegistration = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      scope: 'https://example.com/sw.js',
      installing: null as ServiceWorker | null,
      waiting: mockWaitingWorker,
      active: null as ServiceWorker | null,
      update: jest.fn(),
      unregister: jest.fn(),
    } as ServiceWorkerRegistration;

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: jest.fn(() => Promise.resolve(mockRegistration)),
      },
      writable: true,
      configurable: true,
    });

    render(
      <ThemeProvider>
        <ServiceWorkerUpdate />
      </ThemeProvider>
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(screen.getByText('Update Tersedia')).toBeInTheDocument();
    expect(screen.getByText('Versi baru Maskom tersedia. Klik untuk memperbarui.')).toBeInTheDocument();
  });

  it('should have proper ARIA attributes', async () => {
    const mockWaitingWorker = { postMessage: jest.fn() } as ServiceWorker;
    const mockRegistration = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      scope: 'https://example.com/sw.js',
      installing: null as ServiceWorker | null,
      waiting: mockWaitingWorker,
      active: null as ServiceWorker | null,
      update: jest.fn(),
      unregister: jest.fn(),
    } as ServiceWorkerRegistration;

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: jest.fn(() => Promise.resolve(mockRegistration)),
      },
      writable: true,
      configurable: true,
    });

    render(
      <ThemeProvider>
        <ServiceWorkerUpdate />
      </ThemeProvider>
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    const alertBox = screen.getByRole('alert');
    expect(alertBox).toHaveAttribute('aria-live', 'polite');
  });

  it('should have skipWaiting function available', async () => {
    const mockWaitingWorker = { postMessage: jest.fn() } as ServiceWorker;
    const mockRegistration = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      scope: 'https://example.com/sw.js',
      installing: null as ServiceWorker | null,
      waiting: mockWaitingWorker,
      active: null as ServiceWorker | null,
      update: jest.fn(),
      unregister: jest.fn(),
    } as ServiceWorkerRegistration;

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: jest.fn(() => Promise.resolve(mockRegistration)),
      },
      writable: true,
      configurable: true,
    });

    render(
      <ThemeProvider>
        <ServiceWorkerUpdate />
      </ThemeProvider>
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    const updateButton = screen.getByText('Perbarui Sekarang');
    expect(updateButton).toBeInTheDocument();
  });

  it('should have clear cache button available', async () => {
    const mockActiveWorker = { postMessage: jest.fn() } as ServiceWorker;
    const mockWaitingWorker = { postMessage: jest.fn() } as ServiceWorker;
    const mockRegistration = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      scope: 'https://example.com/sw.js',
      installing: null as ServiceWorker | null,
      waiting: mockWaitingWorker,
      active: mockActiveWorker,
      update: jest.fn(),
      unregister: jest.fn(),
    } as ServiceWorkerRegistration;

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: jest.fn(() => Promise.resolve(mockRegistration)),
      },
      writable: true,
      configurable: true,
    });

    render(
      <ThemeProvider>
        <ServiceWorkerUpdate />
      </ThemeProvider>
    );

    await new Promise(resolve => setTimeout(resolve, 100));

    const clearCacheButton = screen.getByText('Bersihkan Cache');
    expect(clearCacheButton).toBeInTheDocument();
  });
});
