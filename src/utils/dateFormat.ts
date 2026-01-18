/**
 * Date Formatting and Validation Utilities
 *
 * Purpose: Standardize date handling across the application
 * - All stored dates should use ISO 8601 format (YYYY-MM-DD)
 * - Display dates can be formatted for user readability
 * - Provides validation for ISO 8601 format
 */

/**
 * Formats an ISO 8601 date string to a human-readable format
 *
 * @param isoDate - Date string in ISO 8601 format (YYYY-MM-DD)
 * @param locale - Locale string for formatting (default: "id-ID" for Indonesian)
 * @param options - Intl.DateTimeFormatOptions for custom formatting
 * @returns Formatted date string (e.g., "15 Mar 2024")
 *
 * @example
 * ```typescript
 * formatDate("2024-03-15") // "15 Mar 2024" (Indonesian locale)
 * formatDate("2024-03-15", "en-US") // "Mar 15, 2024"
 * ```
 */
export function formatDate(
  isoDate: string,
  locale: string = "id-ID",
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }
): string {
  if (!isValidISODate(isoDate)) {
    throw new Error(`Invalid ISO 8601 date: ${isoDate}`);
  }
  const date = new Date(isoDate);
  return date.toLocaleDateString(locale, options);
}

/**
 * Validates if a date string is in ISO 8601 format (YYYY-MM-DD)
 *
 * @param dateString - Date string to validate
 * @returns true if valid ISO 8601 format, false otherwise
 *
 * @example
 * ```typescript
 * isValidISODate("2024-03-15") // true
 * isValidISODate("15 Mar 2024") // false
 * isValidISODate("invalid-date") // false
 * ```
 */
export function isValidISODate(dateString: string): boolean {
  if (typeof dateString !== "string") {
    return false;
  }
  
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDateRegex.test(dateString)) {
    return false;
  }
  
  const [yearStr, monthStr, dayStr] = dateString.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return false;
  }
  
  if (month < 1 || month > 12) {
    return false;
  }
  
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return false;
  }
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Parses a date string in various formats and converts to ISO 8601
 *
 * Supported formats:
 * - ISO 8601 (YYYY-MM-DD) - returned as-is
 * - "15 Mar 2024", "Mar 15, 2024" - parsed and converted
 * - "27 Aug, 2023", "Aug 27, 2023" - parsed and converted
 *
 * @param dateString - Date string in any supported format
 * @returns ISO 8601 date string (YYYY-MM-DD)
 *
 * @throws Error if date string cannot be parsed
 *
 * @example
 * ```typescript
 * toISODate("2024-03-15") // "2024-03-15"
 * toISODate("15 Mar 2024") // "2024-03-15"
 * toISODate("27 Aug, 2023") // "2023-08-27"
 * ```
 */
export function toISODate(dateString: string): string {
  if (isValidISODate(dateString)) {
    return dateString;
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Cannot parse date: ${dateString}`);
  }
  
  return date.toISOString().split("T")[0];
}

/**
 * Format date for blog post display
 *
 * @param isoDate - Date string in ISO 8601 format
 * @returns Formatted date string in Indonesian locale
 *
 * @example
 * ```typescript
 * formatBlogDate("2024-03-15") // "15 Mar 2024"
 * ```
 */
export function formatBlogDate(isoDate: string): string {
  return formatDate(isoDate, "id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

/**
 * Format date for comment display
 *
 * @param isoDate - Date string in ISO 8601 format
 * @returns Formatted date string
 *
 * @example
 * ```typescript
 * formatCommentDate("2023-08-27") // "27 Agu 2023"
 * ```
 */
export function formatCommentDate(isoDate: string): string {
  return formatDate(isoDate, "id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

/**
 * Get the current date in ISO 8601 format
 *
 * @returns Current date string in ISO 8601 format (YYYY-MM-DD)
 *
 * @example
 * ```typescript
 * getTodayISO() // "2024-01-12"
 * ```
 */
export function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Format timestamp with date and time
 *
 * @param timestamp - ISO timestamp string
 * @param locale - Locale string for formatting (default: "id-ID" for Indonesian)
 * @returns Formatted timestamp string with date and time
 *
 * @example
 * ```typescript
 * formatTimestamp("2024-03-15T14:30:00Z") // "15 Mar 2024, 14:30"
 * formatTimestamp("2024-03-15T14:30:00Z", "en-US") // "Mar 15, 2024, 2:30 PM"
 * ```
 */
export function formatTimestamp(timestamp: string, locale: string = "id-ID"): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
