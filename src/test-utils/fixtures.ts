/**
 * Test data fixtures for consistent test data across test suites
 */

/**
 * Common user data fixtures
 */
export const mockUsers = {
  validUser: {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
  },
  adminUser: {
    id: 2,
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
  },
  invalidUser: {
    id: 0,
    name: '',
    email: 'invalid-email',
    password: '',
  },
};

/**
 * Form data fixtures
 */
export const mockFormData = {
  validContactForm: {
    user_name: 'John Doe',
    user_email: 'john.doe@example.com',
    message: 'Test message content',
  },
  invalidContactForm: {
    user_name: '',
    user_email: 'invalid-email',
    message: '',
  },
  validLoginForm: {
    email: 'test@example.com',
    password: 'password123',
  },
  invalidLoginForm: {
    email: '',
    password: '',
  },
  validSignUpForm: {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    password: 'password123',
  },
  invalidSignUpForm: {
    name: '',
    email: 'invalid-email',
    password: 'short',
  },
  validBlogForm: {
    name: 'Blog Author',
    email: 'author@example.com',
    message: 'Blog comment content',
  },
};

/**
 * Service result fixtures
 */
export const mockServiceResults = {
  successEmail: {
    success: true,
    text: 'OK',
    status: 200,
  },
  failedEmail: {
    success: false,
    error: 'Failed to send email',
  },
  successAuth: {
    success: true,
    message: 'Authentication successful',
    user: {
      id: 'test_test_example_com',
      email: 'test@example.com',
      name: 'Test User',
    },
    token: 'mock_token_12345',
  },
  failedAuth: {
    success: false,
    error: 'Authentication failed',
  },
  timeoutError: {
    success: false,
    error: 'Request timeout',
  },
  rateLimitError: {
    success: false,
    error: 'Too many requests',
  },
};

/**
 * Mock email results
 */
export const mockEmailResults = {
  success: {
    success: true,
    text: 'OK',
    status: 200,
  },
  networkError: {
    success: false,
    error: 'Network error',
  },
  serviceError: {
    success: false,
    error: 'Service unavailable',
  },
  timeoutError: {
    success: false,
    error: 'Request timeout',
  },
};

/**
 * Mock auth results
 */
export const mockAuthResults = {
  loginSuccess: {
    success: true,
    message: 'Berhasil masuk ke portal',
    user: {
      id: 'test_test_example_com',
      email: 'test@example.com',
      name: 'Test User',
    },
    token: 'mock_token_12345',
  },
  registerSuccess: {
    success: true,
    message: 'Registrasi berhasil',
    user: {
      id: 'test_test_example_com',
      email: 'test@example.com',
      name: 'Test User',
    },
    token: 'mock_token_12345',
  },
  logoutSuccess: {
    success: true,
    message: 'Berhasil keluar',
  },
  currentUser: {
    id: 'test_test_example_com',
    email: 'test@example.com',
    name: 'Test User',
  },
  missingCredentials: {
    success: false,
    error: 'Email dan kata sandi diperlukan',
  },
  invalidEmail: {
    success: false,
    error: 'Format email tidak valid',
  },
  shortPassword: {
    success: false,
    error: 'Kata sandi harus minimal 8 karakter',
  },
  missingName: {
    success: false,
    error: 'Nama diperlukan',
  },
};

/**
 * Mock error fixtures
 */
export const mockErrors = {
  networkError: new Error('Network error'),
  timeoutError: new Error('Request timeout'),
  serviceError: new Error('Service unavailable'),
  validationError: new Error('Validation failed'),
  authenticationError: new Error('Authentication failed'),
  authorizationError: new Error('Unauthorized access'),
  notFoundError: new Error('Resource not found'),
  internalServerError: new Error('Internal server error'),
  rateLimitError: new Error('Rate limit exceeded'),
};

/**
 * Pagination fixtures
 */
export const mockPagination = {
  smallPage: {
    limit: 5,
    offset: 0,
  },
  mediumPage: {
    limit: 10,
    offset: 0,
  },
  secondPage: {
    limit: 10,
    offset: 10,
  },
  lastPage: {
    limit: 10,
    offset: 90,
  },
  emptyPage: {
    limit: 10,
    offset: 1000,
  },
};

/**
 * Data item fixtures (for filter tests)
 */
export const mockDataItems = {
  homePageItems: [
    { id: 1, name: 'Item 1', page: 'home_1', active: true },
    { id: 2, name: 'Item 2', page: 'home_1', active: false },
    { id: 3, name: 'Item 3', page: 'home_1', active: true },
  ],
  aboutPageItems: [
    { id: 4, name: 'Item 4', page: 'about', active: true },
    { id: 5, name: 'Item 5', page: 'about', active: false },
  ],
  mixedPageItems: [
    { id: 1, name: 'Item 1', page: 'home_1', active: true },
    { id: 4, name: 'Item 4', page: 'about', active: true },
    { id: 2, name: 'Item 2', page: 'home_1', active: false },
  ],
  emptyItems: [],
  singleItem: [
    { id: 1, name: 'Item 1', page: 'home_1', active: true },
  ],
};
