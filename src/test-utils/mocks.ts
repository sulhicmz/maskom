import React from 'react';

/**
 * Centralized mock setup for common dependencies
 * Import this file in test files that need these mocks
 */

/**
 * Mock react-toastify
 */
export const mockReactToastify = () => {
  const toast = {
    success: jest.fn(() => ({ __t: Date.now() })),
    error: jest.fn(() => ({ __t: Date.now() })),
    info: jest.fn(() => ({ __t: Date.now() })),
    warn: jest.fn(() => ({ __t: Date.now() })),
  };

  jest.mock('react-toastify', () => ({ toast }));
  
  return { toast };
};

/**
 * Mock next/image
 */
export const mockNextImage = () => {
  jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: Record<string, unknown>) => React.createElement('img', props),
  }));
};

/**
 * Mock next/link
 */
export const mockNextLink = () => {
  const MockLink = ({ children, href, ...rest }: { children: React.ReactNode; href: string; [key: string]: unknown }) =>
    React.createElement('a', { href, ...rest }, children);
  MockLink.displayName = 'MockLink';
  
  jest.mock('next/link', () => ({
    __esModule: true,
    default: MockLink,
  }));
};

/**
 * Mock next/dynamic for lazy-loaded components
 */
export const mockNextDynamic = (Component: React.ComponentType<Record<string, unknown>>) => {
  jest.mock('next/dynamic', () => () => {
    const DynamicComponent = Component;
    DynamicComponent.displayName = 'LoadableComponent';
    return DynamicComponent;
  });
};

/**
 * Mock EmailService
 */
export const mockEmailService = () => {
  const mockSendEmail = jest.fn();
  
  jest.mock('@/services/email', () => ({
    emailService: {
      sendEmail: mockSendEmail,
    },
  }));
  
  return { mockSendEmail };
};

/**
 * Mock AuthService
 */
export const mockAuthService = () => {
  const mockLogin = jest.fn();
  const mockRegister = jest.fn();
  const mockLogout = jest.fn();
  const mockGetCurrentUser = jest.fn();
  
  jest.mock('@/services/auth', () => ({
    authService: {
      login: mockLogin,
      register: mockRegister,
      logout: mockLogout,
      getCurrentUser: mockGetCurrentUser,
    },
  }));
  
  return {
    mockLogin,
    mockRegister,
    mockLogout,
    mockGetCurrentUser,
  };
};

/**
 * Setup common mocks for all tests
 * Call this in jest.setup.js or beforeAll in test files
 */
export const setupCommonMocks = () => {
  mockNextImage();
  mockNextLink();
  mockReactToastify();
};

/**
 * Cleanup common mocks
 * Call this in afterAll or afterEach in test files
 */
export const cleanupCommonMocks = () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
};
