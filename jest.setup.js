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

global.Request = class Request {
  constructor(input, init = {}) {
    const url = typeof input === 'string' ? new URL(input) : input;
    this.url = url.href;
    this.method = init.method || 'GET';
    this.headers = new Headers(init.headers || {});
    this.body = init.body || null;
    this.signal = init.signal;
  }
}

global.Response = class Response {
  constructor(body = null, init = {}) {
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = new Headers(init.headers || {});
    this.body = body;
    this.ok = this.status >= 200 && this.status < 300;
  }

  static json(data, init = {}) {
    const body = JSON.stringify(data);
    return new Response(body, init);
  }

  async json() {
    if (typeof this.body === 'string') {
      return JSON.parse(this.body);
    }
    return this.body;
  }
}

global.fetch = jest.fn();
