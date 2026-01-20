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

global.crypto.subtle = {
  importKey: jest.fn().mockImplementation(async (format, keyData, algorithm, extractable, keyUsages) => {
    return {
      algorithm,
      extractable,
      type: 'secret',
      usages: keyUsages,
    };
  }),
  sign: jest.fn().mockImplementation(async () => {
    const signature = new Uint8Array(20);
    signature[19] = 0x31;
    return signature.buffer;
  }),
};

global.crypto.getRandomValues = jest.fn().mockImplementation((array) => {
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
});
