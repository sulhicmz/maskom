/**
 * Diff Badge Utilities
 *
 * Purpose: Provide CSS class mapping for diff type badges
 * - Maps diff types to CSS classes for styling
 * - Provides type-safe diff type enum
 */

/**
 * Diff type enum for version comparison
 */
export type DiffType = 'added' | 'removed' | 'changed';

/**
 * Get CSS class for diff type badge
 *
 * @param type - Diff type (added, removed, changed)
 * @returns CSS class name for the badge
 *
 * @example
 * ```typescript
 * getDiffBadgeClass('added') // "diff-badge-added"
 * getDiffBadgeClass('removed') // "diff-badge-removed"
 * getDiffBadgeClass('changed') // "diff-badge-changed"
 * getDiffBadgeClass('unknown') // "" (empty string for unknown types)
 * ```
 */
export function getDiffBadgeClass(type: DiffType): string {
  switch (type) {
    case 'added':
      return 'diff-badge-added';
    case 'removed':
      return 'diff-badge-removed';
    case 'changed':
      return 'diff-badge-changed';
    default:
      return '';
  }
}
