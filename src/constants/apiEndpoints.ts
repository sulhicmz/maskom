export const API_ENDPOINTS = {
  QR_CODE_API: 'https://api.qrserver.com/v1/create-qr-code/',
} as const;

export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];
