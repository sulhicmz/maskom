/**
 * Test Suite for Date Formatting Utilities
 *
 * Tests cover:
 * - formatDate function
 * - isValidISODate function
 * - toISODate function
 * - formatBlogDate function
 * - formatCommentDate function
 * - getTodayISO function
 * - Error handling
 * - Edge cases
 */

import {
  formatDate,
  formatBlogDate,
  formatCommentDate,
  getTodayISO,
  isValidISODate,
  toISODate,
} from "../dateFormat";

describe("Date Formatting Utilities", () => {
  describe("isValidISODate", () => {
    it("validates correct ISO 8601 dates", () => {
      expect(isValidISODate("2024-03-15")).toBe(true);
      expect(isValidISODate("2023-08-27")).toBe(true);
      expect(isValidISODate("2020-01-01")).toBe(true);
      expect(isValidISODate("1999-12-31")).toBe(true);
    });

    it("rejects invalid date formats", () => {
      expect(isValidISODate("15 Mar 2024")).toBe(false);
      expect(isValidISODate("Mar 15, 2024")).toBe(false);
      expect(isValidISODate("27 Aug, 2023")).toBe(false);
      expect(isValidISODate("invalid-date")).toBe(false);
      expect(isValidISODate("")).toBe(false);
    });

    it("rejects non-string inputs", () => {
      expect(isValidISODate(null as unknown as string)).toBe(false);
      expect(isValidISODate(undefined as unknown as string)).toBe(false);
      expect(isValidISODate(123 as unknown as string)).toBe(false);
      expect(isValidISODate({} as unknown as string)).toBe(false);
    });

    it("rejects invalid dates", () => {
      expect(isValidISODate("2024-02-30")).toBe(false);
      expect(isValidISODate("2024-13-01")).toBe(false);
      expect(isValidISODate("2024-00-01")).toBe(false);
      expect(isValidISODate("9999-99-99")).toBe(false);
    });

    it("handles NaN values in date components", () => {
      expect(isValidISODate("abcd-ef-gh")).toBe(false);
      expect(isValidISODate("2024-ab-15")).toBe(false);
      expect(isValidISODate("2024-03-ab")).toBe(false);
      expect(isValidISODate("xxxx-yy-zz")).toBe(false);
      expect(isValidISODate("9999999999999-12-31")).toBe(false);
      expect(isValidISODate("2024-9999999999999-15")).toBe(false);
    });
  });

  describe("formatDate", () => {
    it("formats ISO dates to Indonesian locale by default", () => {
      expect(formatDate("2024-03-15")).toBe("15 Mar 2024");
      expect(formatDate("2023-08-27")).toBe("27 Agu 2023");
      expect(formatDate("2024-02-12")).toBe("12 Feb 2024");
    });

    it("formats ISO dates to English locale when specified", () => {
      expect(formatDate("2024-03-15", "en-US")).toBe("Mar 15, 2024");
      expect(formatDate("2023-08-27", "en-US")).toBe("Aug 27, 2023");
    });

    it("accepts custom formatting options", () => {
      expect(formatDate("2024-03-15", "id-ID", { year: "numeric", month: "long", day: "numeric" }))
        .toBe("15 Maret 2024");
      expect(formatDate("2024-03-15", "en-US", { year: "numeric", month: "2-digit", day: "2-digit" }))
        .toBe("03/15/2024");
    });

    it("throws error for invalid ISO dates", () => {
      expect(() => formatDate("invalid-date")).toThrow("Invalid ISO 8601 date: invalid-date");
      expect(() => formatDate("15 Mar 2024")).toThrow("Invalid ISO 8601 date: 15 Mar 2024");
    });
  });

  describe("formatBlogDate", () => {
    it("formats blog dates in Indonesian locale", () => {
      expect(formatBlogDate("2024-03-15")).toBe("15 Mar 2024");
      expect(formatBlogDate("2023-08-27")).toBe("27 Agu 2023");
      expect(formatBlogDate("2024-02-21")).toBe("21 Feb 2024");
      expect(formatBlogDate("2024-02-12")).toBe("12 Feb 2024");
    });

    it("handles leap year dates", () => {
      expect(formatBlogDate("2024-02-29")).toBe("29 Feb 2024");
    });

    it("throws error for invalid dates", () => {
      expect(() => formatBlogDate("invalid")).toThrow();
    });
  });

  describe("formatCommentDate", () => {
    it("formats comment dates in Indonesian locale", () => {
      expect(formatCommentDate("2023-08-27")).toBe("27 Agu 2023");
      expect(formatCommentDate("2024-01-01")).toBe("01 Jan 2024");
      expect(formatCommentDate("2024-12-31")).toBe("31 Des 2024");
    });

    it("formats dates consistently across months", () => {
      const jan = formatCommentDate("2024-01-15");
      const feb = formatCommentDate("2024-02-15");
      const mar = formatCommentDate("2024-03-15");
      const apr = formatCommentDate("2024-04-15");
      const may = formatCommentDate("2024-05-15");
      const jun = formatCommentDate("2024-06-15");
      const jul = formatCommentDate("2024-07-15");
      const aug = formatCommentDate("2024-08-15");
      const sep = formatCommentDate("2024-09-15");
      const oct = formatCommentDate("2024-10-15");
      const nov = formatCommentDate("2024-11-15");
      const dec = formatCommentDate("2024-12-15");

      expect(jan).toBe("15 Jan 2024");
      expect(feb).toBe("15 Feb 2024");
      expect(mar).toBe("15 Mar 2024");
      expect(apr).toBe("15 Apr 2024");
      expect(may).toBe("15 Mei 2024");
      expect(jun).toBe("15 Jun 2024");
      expect(jul).toBe("15 Jul 2024");
      expect(aug).toBe("15 Agu 2024");
      expect(sep).toBe("15 Sep 2024");
      expect(oct).toBe("15 Okt 2024");
      expect(nov).toBe("15 Nov 2024");
      expect(dec).toBe("15 Des 2024");
    });

    it("throws error for invalid dates", () => {
      expect(() => formatCommentDate("invalid")).toThrow();
    });
  });

  describe("toISODate", () => {
    it("returns ISO 8601 dates unchanged", () => {
      expect(toISODate("2024-03-15")).toBe("2024-03-15");
      expect(toISODate("2023-08-27")).toBe("2023-08-27");
      expect(toISODate("2024-01-01")).toBe("2024-01-01");
    });

    it("converts various date formats to ISO 8601", () => {
      expect(toISODate("15 Mar 2024")).toBe("2024-03-15");
      expect(toISODate("Mar 15, 2024")).toBe("2024-03-15");
      expect(toISODate("27 Aug, 2023")).toBe("2023-08-27");
      expect(toISODate("Aug 27, 2023")).toBe("2023-08-27");
      expect(toISODate("21 Feb 2024")).toBe("2024-02-21");
    });

    it("throws error for unparseable dates", () => {
      expect(() => toISODate("invalid-date")).toThrow("Cannot parse date: invalid-date");
      expect(() => toISODate("not a date")).toThrow("Cannot parse date: not a date");
    });
  });

  describe("getTodayISO", () => {
    it("returns today's date in ISO 8601 format", () => {
      const today = getTodayISO();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(isValidISODate(today)).toBe(true);
    });

    it("returns a valid date", () => {
      const today = getTodayISO();
      const date = new Date(today);
      expect(isNaN(date.getTime())).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("handles year 2000", () => {
      expect(formatBlogDate("2000-01-01")).toBe("01 Jan 2000");
      expect(isValidISODate("2000-01-01")).toBe(true);
    });

    it("handles future dates", () => {
      expect(formatBlogDate("2050-12-31")).toBe("31 Des 2050");
      expect(isValidISODate("2050-12-31")).toBe(true);
    });

    it("handles early dates", () => {
      expect(formatBlogDate("1970-01-01")).toBe("01 Jan 1970");
      expect(isValidISODate("1970-01-01")).toBe(true);
    });

    it("handles leap year (2024)", () => {
      expect(isValidISODate("2024-02-29")).toBe(true);
      expect(formatBlogDate("2024-02-29")).toBe("29 Feb 2024");
    });

    it("rejects non-leap year February 29", () => {
      expect(isValidISODate("2023-02-29")).toBe(false);
    });

    it("handles month boundaries", () => {
      expect(formatBlogDate("2024-01-31")).toBe("31 Jan 2024");
      expect(formatBlogDate("2024-04-30")).toBe("30 Apr 2024");
      expect(formatBlogDate("2024-06-30")).toBe("30 Jun 2024");
    });

    it("handles date format consistency", () => {
      const formatted = formatBlogDate("2024-03-15");
      expect(formatted).toMatch(/^\d{2} \w{3} \d{4}$/);
    });
  });

  describe("Error Messages", () => {
    it("provides clear error messages for invalid dates", () => {
      try {
        formatDate("not-a-date");
        fail("Should have thrown an error");
      } catch (error) {
        expect((error as Error).message).toContain("Invalid ISO 8601 date");
        expect((error as Error).message).toContain("not-a-date");
      }
    });

    it("provides clear error messages for unparseable dates", () => {
      try {
        toISODate("not-a-date");
        fail("Should have thrown an error");
      } catch (error) {
        expect((error as Error).message).toContain("Cannot parse date");
        expect((error as Error).message).toContain("not-a-date");
      }
    });
  });
});
