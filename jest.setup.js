import '@testing-library/jest-dom';

import './src/test-utils/customMatchers';

global.TextEncoder = class TextEncoder {
  encode(input) {
    const str = typeof input === 'string' ? input : String(input);
    let res = [];
    for (let i = 0, len = str.length; i < len; i++) {
      res.push(str.charCodeAt(i));
    }
    return new Uint8Array(res);
  }
};

global.TextDecoder = class TextDecoder {
  decode(input) {
    const bytes = new Uint8Array(input);
    let result = '';
    for (let i = 0, len = bytes.length; i < len; i++) {
      result += String.fromCharCode(bytes[i]);
    }
    return result;
  }
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
