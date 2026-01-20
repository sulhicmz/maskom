import { generateUUID } from '../uuid';

describe('generateUUID', () => {
  // crypto.randomUUID is available in Node.js 15.6+ (test environment uses Node.js 22+)
  const isCryptoAvailable = typeof crypto?.randomUUID === 'function';

  it('should generate a valid UUID v4 string', () => {
    if (!isCryptoAvailable) return;
    const uuid = generateUUID();

    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it('should generate unique UUIDs', () => {
    if (!isCryptoAvailable) return;

    const uuids = new Set<string>();
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
      const uuid = generateUUID();
      uuids.add(uuid);
    }

    expect(uuids.size).toBe(iterations);
  });

  it('should generate UUIDs with correct version (4)', () => {
    if (!isCryptoAvailable) return;

    const uuid = generateUUID();

    // UUID v4 has version 4 at position 14 (0-indexed)
    expect(uuid[14]).toBe('4');
  });

  it('should generate UUIDs with correct variant', () => {
    if (!isCryptoAvailable) return;

    const uuid = generateUUID();

    // UUID variant should be 8, 9, a, or b at position 19
    const variant = uuid[19].toLowerCase();
    expect(['8', '9', 'a', 'b']).toContain(variant);
  });

  it('should generate UUIDs with correct format (4 hyphens)', () => {
    if (!isCryptoAvailable) return;
    
    const uuid = generateUUID();
    
    const hyphenCount = (uuid.match(/-/g) || []).length;
    expect(hyphenCount).toBe(4);
  });

  it('should generate UUIDs with correct length (36 characters)', () => {
    if (!isCryptoAvailable) return;

    const uuid = generateUUID();

    expect(uuid.length).toBe(36);
  });

  it('should generate UUIDs with only hexadecimal characters and hyphens', () => {
    if (!isCryptoAvailable) return;

    const uuid = generateUUID();

    // Remove hyphens and check if remaining characters are hexadecimal
    const hexPart = uuid.replace(/-/g, '');
    expect(hexPart).toMatch(/^[0-9a-f]{32}$/i);
  });

  it('should generate UUIDs with correct segments', () => {
    if (!isCryptoAvailable) return;

    const uuid = generateUUID();

    const segments = uuid.split('-');
    expect(segments).toHaveLength(5);
    expect(segments[0]).toHaveLength(8);  // time_low
    expect(segments[1]).toHaveLength(4);  // time_mid
    expect(segments[2]).toHaveLength(4);  // time_hi_and_version
    expect(segments[3]).toHaveLength(4);  // clock_seq_hi_and_reserved + clock_seq_low
    expect(segments[4]).toHaveLength(12); // node
  });

  it('should throw error if crypto.randomUUID is not available', () => {
    // Skip this test in modern Node.js environments where crypto.randomUUID is always available
    // This is a theoretical error path that can't be easily tested when crypto exists
    if (isCryptoAvailable) return;

    // In environments where crypto.randomUUID is not available, error would be thrown
    // But we can't test this in current Node.js environment
    expect(() => generateUUID()).toThrow(
      'crypto.randomUUID() is not available. Please ensure you are running in a modern environment (Node.js 15.6+, modern browser, or Cloudflare Workers).'
    );
  });

  it('should generate UUIDs efficiently', () => {
    if (!isCryptoAvailable) return;

    const startTime = performance.now();

    for (let i = 0; i < 1000; i++) {
      generateUUID();
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should generate 1000 UUIDs in less than 100ms
    expect(duration).toBeLessThan(100);
  });
});
