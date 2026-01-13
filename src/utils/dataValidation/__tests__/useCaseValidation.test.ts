import { validateUseCaseSidebarItem } from "../useCaseValidation";

describe("validateUseCaseSidebarItem", () => {
   describe("should validate valid UseCaseSidebarItem", () => {
      it("should pass with valid item", () => {
         const validItem = {
            id: 1,
            title: "Integrasi Konektivitas Ritel Nasional",
            link: "/use-case-details",
            active: true
         };
         const result = validateUseCaseSidebarItem(validItem);
         expect(result.isValid).toBe(true);
         expect(result.errors).toHaveLength(0);
      });

      it("should pass with valid item without active flag", () => {
         const validItem = {
            id: 2,
            title: "Managed Wi-Fi untuk F&B Chain",
            link: "/use-case-details"
         };
         const result = validateUseCaseSidebarItem(validItem);
         expect(result.isValid).toBe(true);
         expect(result.errors).toHaveLength(0);
      });

      it("should pass with active: false", () => {
         const validItem = {
            id: 3,
            title: "SD-WAN & Prioritas Aplikasi Logistik",
            link: "/use-case-details",
            active: false
         };
         const result = validateUseCaseSidebarItem(validItem);
         expect(result.isValid).toBe(true);
         expect(result.errors).toHaveLength(0);
      });
   });

   describe("should fail validation", () => {
      it("should fail with missing id", () => {
         const invalidItem = {
            title: "Keamanan Jaringan Rumah Sakit",
            link: "/use-case-details"
         };
         const result = validateUseCaseSidebarItem(invalidItem);
         expect(result.isValid).toBe(false);
         expect(result.errors.length).toBeGreaterThan(0);
         expect(result.errors.some(e => e.field === "id" || e.message.includes("id"))).toBe(true);
      });

      it("should fail with missing title", () => {
         const invalidItem = {
            id: 4,
            link: "/use-case-details"
         };
         const result = validateUseCaseSidebarItem(invalidItem);
         expect(result.isValid).toBe(false);
         expect(result.errors.length).toBeGreaterThan(0);
         expect(result.errors.some(e => e.field === "title" || e.message.includes("title"))).toBe(true);
      });

      it("should fail with missing link", () => {
         const invalidItem = {
            id: 5,
            title: "Interkoneksi Data Center & Cloud"
         };
         const result = validateUseCaseSidebarItem(invalidItem);
         expect(result.isValid).toBe(false);
         expect(result.errors.length).toBeGreaterThan(0);
         expect(result.errors.some(e => e.field === "link" || e.message.includes("link"))).toBe(true);
      });

      it("should fail with invalid id type", () => {
         const invalidItem = {
            id: "1" as unknown as number,
            title: "Invalid ID Type",
            link: "/use-case-details"
         };
         const result = validateUseCaseSidebarItem(invalidItem);
         expect(result.isValid).toBe(false);
      });

      it("should fail with non-positive id", () => {
         const invalidItem = {
            id: 0,
            title: "Zero ID",
            link: "/use-case-details"
         };
         const result = validateUseCaseSidebarItem(invalidItem);
         expect(result.isValid).toBe(false);
      });

      it("should fail with negative id", () => {
         const invalidItem = {
            id: -1,
            title: "Negative ID",
            link: "/use-case-details"
         };
         const result = validateUseCaseSidebarItem(invalidItem);
         expect(result.isValid).toBe(false);
      });

      it("should fail with empty title", () => {
         const invalidItem = {
            id: 1,
            title: "   ",
            link: "/use-case-details"
         };
         const result = validateUseCaseSidebarItem(invalidItem);
         expect(result.isValid).toBe(false);
      });

      it("should fail with empty link", () => {
         const invalidItem = {
            id: 1,
            title: "Test Title",
            link: "   "
         };
         const result = validateUseCaseSidebarItem(invalidItem);
         expect(result.isValid).toBe(false);
      });
   });

   describe("should handle edge cases", () => {
      it("should handle very long title", () => {
         const longTitle = "A".repeat(500);
         const validItem = {
            id: 1,
            title: longTitle,
            link: "/use-case-details"
         };
         const result = validateUseCaseSidebarItem(validItem);
         expect(result.isValid).toBe(true);
      });

      it("should handle special characters in title", () => {
         const validItem = {
            id: 1,
            title: "Keamanan & Integrasi: Solusi untuk Enterprise",
            link: "/use-case-details"
         };
         const result = validateUseCaseSidebarItem(validItem);
         expect(result.isValid).toBe(true);
      });

      it("should handle link with query parameters", () => {
         const validItem = {
            id: 1,
            title: "Use Case Details",
            link: "/use-case-details?tab=overview"
         };
         const result = validateUseCaseSidebarItem(validItem);
         expect(result.isValid).toBe(true);
      });

      it("should handle link with hash", () => {
         const validItem = {
            id: 1,
            title: "Use Case Details",
            link: "/use-case-details#section-1"
         };
         const result = validateUseCaseSidebarItem(validItem);
         expect(result.isValid).toBe(true);
      });
   });
});
