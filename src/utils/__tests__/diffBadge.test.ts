import { getDiffBadgeClass, DiffType } from '../diffBadge';

describe('getDiffBadgeClass', () => {
  test('returns correct CSS class for "added" type', () => {
    expect(getDiffBadgeClass('added')).toBe('diff-badge-added');
  });

  test('returns correct CSS class for "removed" type', () => {
    expect(getDiffBadgeClass('removed')).toBe('diff-badge-removed');
  });

  test('returns correct CSS class for "changed" type', () => {
    expect(getDiffBadgeClass('changed')).toBe('diff-badge-changed');
  });

  test('returns empty string for unknown type', () => {
    expect(getDiffBadgeClass('unknown' as unknown as DiffType)).toBe('');
  });

  test('returns empty string for undefined type', () => {
    expect(getDiffBadgeClass(undefined as unknown as DiffType)).toBe('');
  });

  test('returns empty string for null type', () => {
    expect(getDiffBadgeClass(null as unknown as DiffType)).toBe('');
  });

  test('handles empty string type', () => {
    expect(getDiffBadgeClass('' as unknown as DiffType)).toBe('');
  });

  test('supports all three valid diff types', () => {
    const diffTypes: DiffType[] = ['added', 'removed', 'changed'];
    diffTypes.forEach((type) => {
      const result = getDiffBadgeClass(type);
      expect(result).toBe(`diff-badge-${type}`);
      expect(result).toBeTruthy();
    });
  });

  test('returns non-empty strings for all valid types', () => {
    const validTypes = ['added', 'removed', 'changed'] as const;
    validTypes.forEach((type) => {
      const result = getDiffBadgeClass(type);
      expect(result).not.toBe('');
      expect(result).toContain('diff-badge-');
    });
  });
});
