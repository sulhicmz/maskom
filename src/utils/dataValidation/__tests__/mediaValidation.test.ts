import { validateMediaItem, validateMediaAssets } from "../mediaValidation";
import type { MediaAsset } from "@/types/data";

describe("mediaValidation", () => {
   describe("validateMediaItem", () => {
      it("should validate a valid media asset with image type", () => {
         const validMediaAsset: MediaAsset = {
            id: 1,
            url: "https://res.cloudinary.com/demo/image/upload/v1234567890/image.jpg",
            type: "image",
            alt: "Valid image",
            tags: ["tag1", "tag2"],
            createdAt: "2026-01-17T00:00:00Z",
            usageCount: 5,
         };

         const result = validateMediaItem(validMediaAsset);
         expect(result.isValid).toBe(true);
         expect(result.errors).toEqual([]);
      });

      it("should validate a valid media asset with video type", () => {
         const validMediaAsset: MediaAsset = {
            id: 2,
            url: "https://res.cloudinary.com/demo/video/upload/v1234567890/video.mp4",
            type: "video",
            alt: "Valid video",
            tags: ["video", "tutorial"],
            createdAt: "2026-01-17T00:00:00Z",
         };

         const result = validateMediaItem(validMediaAsset);
         expect(result.isValid).toBe(true);
         expect(result.errors).toEqual([]);
      });

      it("should reject media asset with invalid ID (zero)", () => {
         const invalidMediaAsset: MediaAsset = {
            id: 0,
            url: "https://res.cloudinary.com/demo/image/upload/v1234567890/image.jpg",
            type: "image",
            alt: "Invalid ID",
            tags: ["tag1"],
            createdAt: "2026-01-17T00:00:00Z",
         };

         const result = validateMediaItem(invalidMediaAsset);
         expect(result.isValid).toBe(false);
         expect(result.errors).toContain("MediaAsset[0]: id must be a positive number");
      });

      it("should reject media asset with invalid ID (negative)", () => {
         const invalidMediaAsset: MediaAsset = {
            id: -1,
            url: "https://res.cloudinary.com/demo/image/upload/v1234567890/image.jpg",
            type: "image",
            alt: "Invalid ID",
            tags: ["tag1"],
            createdAt: "2026-01-17T00:00:00Z",
         };

         const result = validateMediaItem(invalidMediaAsset);
         expect(result.isValid).toBe(false);
         expect(result.errors).toContain("MediaAsset[-1]: id must be a positive number");
      });

      it("should reject media asset with invalid URL", () => {
         const invalidMediaAsset: MediaAsset = {
            id: 1,
            url: "not-a-valid-url",
            type: "image",
            alt: "Invalid URL",
            tags: ["tag1"],
            createdAt: "2026-01-17T00:00:00Z",
         };

         const result = validateMediaItem(invalidMediaAsset);
         expect(result.isValid).toBe(false);
         expect(result.errors).toContain("MediaAsset[1]: url must be a valid URL");
      });

      it("should reject media asset with invalid type", () => {
         const invalidMediaAsset = {
            id: 1,
            url: "https://res.cloudinary.com/demo/image/upload/v1234567890/image.jpg",
            type: "audio" as const,
            alt: "Invalid type",
            tags: ["tag1"],
            createdAt: "2026-01-17T00:00:00Z",
         } as MediaAsset;

         const result = validateMediaItem(invalidMediaAsset);
         expect(result.isValid).toBe(false);
         expect(result.errors).toContain('MediaAsset[1]: type must be either "image" or "video"');
      });

      it("should reject media asset with empty alt text", () => {
         const invalidMediaAsset: MediaAsset = {
            id: 1,
            url: "https://res.cloudinary.com/demo/image/upload/v1234567890/image.jpg",
            type: "image",
            alt: "",
            tags: ["tag1"],
            createdAt: "2026-01-17T00:00:00Z",
         };

         const result = validateMediaItem(invalidMediaAsset);
         expect(result.isValid).toBe(false);
         expect(result.errors).toContain("MediaAsset[1]: alt must not be empty");
      });

      it("should reject media asset with tags exceeding maximum count (11 tags)", () => {
         const invalidMediaAsset: MediaAsset = {
            id: 1,
            url: "https://res.cloudinary.com/demo/image/upload/v1234567890/image.jpg",
            type: "image",
            alt: "Too many tags",
            tags: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10", "tag11"],
            createdAt: "2026-01-17T00:00:00Z",
         };

         const result = validateMediaItem(invalidMediaAsset);
         expect(result.isValid).toBe(false);
         expect(result.errors).toContain("MediaAsset[1]: tags must have at most 10 items");
      });

      it("should accept media asset with exactly 10 tags (boundary)", () => {
         const validMediaAsset: MediaAsset = {
            id: 1,
            url: "https://res.cloudinary.com/demo/image/upload/v1234567890/image.jpg",
            type: "image",
            alt: "Exactly 10 tags",
            tags: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],
            createdAt: "2026-01-17T00:00:00Z",
         };

         const result = validateMediaItem(validMediaAsset);
         expect(result.isValid).toBe(true);
         expect(result.errors).toEqual([]);
      });

      it("should reject media asset with tag exceeding maximum length (51 chars)", () => {
         const invalidMediaAsset: MediaAsset = {
            id: 1,
            url: "https://res.cloudinary.com/demo/image/upload/v1234567890/image.jpg",
            type: "image",
            alt: "Long tag",
            tags: ["a".repeat(51)],
            createdAt: "2026-01-17T00:00:00Z",
         };

         const result = validateMediaItem(invalidMediaAsset);
         expect(result.isValid).toBe(false);
         expect(result.errors).toContain("tags[0]: must be at most 50 characters");
      });

      it("should accept media asset with tag at maximum length (50 chars)", () => {
         const validMediaAsset: MediaAsset = {
            id: 1,
            url: "https://res.cloudinary.com/demo/image/upload/v1234567890/image.jpg",
            type: "image",
            alt: "Max length tag",
            tags: ["a".repeat(50)],
            createdAt: "2026-01-17T00:00:00Z",
         };

         const result = validateMediaItem(validMediaAsset);
         expect(result.isValid).toBe(true);
         expect(result.errors).toEqual([]);
      });

      it("should reject media asset with empty tag", () => {
         const invalidMediaAsset: MediaAsset = {
            id: 1,
            url: "https://res.cloudinary.com/demo/image/upload/v1234567890/image.jpg",
            type: "image",
            alt: "Empty tag",
            tags: ["valid-tag", ""],
            createdAt: "2026-01-17T00:00:00Z",
         };

         const result = validateMediaItem(invalidMediaAsset);
         expect(result.isValid).toBe(false);
         expect(result.errors).toContain("tags[1]: must not be empty");
      });

      it("should reject media asset with invalid ISO date format", () => {
         const invalidMediaAsset: MediaAsset = {
            id: 1,
            url: "https://res.cloudinary.com/demo/image/upload/v1234567890/image.jpg",
            type: "image",
            alt: "Invalid date",
            tags: ["tag1"],
            createdAt: "2026-01-17",
         };

         const result = validateMediaItem(invalidMediaAsset);
         expect(result.isValid).toBe(false);
         expect(result.errors).toContain("MediaAsset[1]: createdAt must be a valid ISO 8601 date");
      });

      it("should reject media asset with negative usageCount", () => {
         const invalidMediaAsset: MediaAsset = {
            id: 1,
            url: "https://res.cloudinary.com/demo/image/upload/v1234567890/image.jpg",
            type: "image",
            alt: "Negative usage count",
            tags: ["tag1"],
            createdAt: "2026-01-17T00:00:00Z",
            usageCount: -1,
         };

         const result = validateMediaItem(invalidMediaAsset);
         expect(result.isValid).toBe(false);
         expect(result.errors).toContain("MediaAsset[1]: usageCount must be a positive number");
      });

      it("should validate media asset with zero usageCount", () => {
         const validMediaAsset: MediaAsset = {
            id: 1,
            url: "https://res.cloudinary.com/demo/image/upload/v1234567890/image.jpg",
            type: "image",
            alt: "Zero usage count",
            tags: ["tag1"],
            createdAt: "2026-01-17T00:00:00Z",
            usageCount: 0,
         };

         const result = validateMediaItem(validMediaAsset);
         expect(result.isValid).toBe(true);
         expect(result.errors).toEqual([]);
      });

      it("should accept valid Cloudinary URLs", () => {
         const validMediaAsset: MediaAsset = {
            id: 1,
            url: "https://res.cloudinary.com/my-cloud/image/upload/v1234567890/folder/image.jpg",
            type: "image",
            alt: "Cloudinary URL",
            tags: ["cloudinary"],
            createdAt: "2026-01-17T00:00:00Z",
         };

         const result = validateMediaItem(validMediaAsset);
         expect(result.isValid).toBe(true);
         expect(result.errors).toEqual([]);
      });

      it("should accept valid ISO date with timezone offset", () => {
         const validMediaAsset: MediaAsset = {
            id: 1,
            url: "https://res.cloudinary.com/demo/image/upload/v1234567890/image.jpg",
            type: "image",
            alt: "Date with timezone",
            tags: ["tag1"],
            createdAt: "2026-01-17T12:30:45+07:00",
         };

         const result = validateMediaItem(validMediaAsset);
         expect(result.isValid).toBe(true);
         expect(result.errors).toEqual([]);
      });
   });

   describe("validateMediaAssets", () => {
      it("should validate an array of valid media assets", () => {
         const validMediaAssets: MediaAsset[] = [
            {
               id: 1,
               url: "https://res.cloudinary.com/demo/image/upload/v1234567890/image.jpg",
               type: "image",
               alt: "Image 1",
               tags: ["tag1"],
               createdAt: "2026-01-17T00:00:00Z",
            },
            {
               id: 2,
               url: "https://res.cloudinary.com/demo/video/upload/v1234567890/video.mp4",
               type: "video",
               alt: "Video 1",
               tags: ["video"],
               createdAt: "2026-01-17T00:00:00Z",
            },
         ];

         const result = validateMediaAssets(validMediaAssets);
         expect(result.isValid).toBe(true);
         expect(result.errors).toEqual([]);
      });

      it("should collect all errors from multiple invalid media assets", () => {
         const invalidMediaAssets: MediaAsset[] = [
            {
               id: 0,
               url: "not-a-url",
               type: "image",
               alt: "Invalid 1",
               tags: ["tag1"],
               createdAt: "2026-01-17T00:00:00Z",
            },
            {
                id: 1,
                url: "https://res.cloudinary.com/demo/image/upload/v1234567890/image.jpg",
                type: "audio" as const,
                alt: "Invalid 2",
                tags: ["tag1"],
                createdAt: "2026-01-17",
             } as MediaAsset,
         ];

         const result = validateMediaAssets(invalidMediaAssets);
         expect(result.isValid).toBe(false);
         expect(result.errors.length).toBeGreaterThan(0);
         expect(result.errors).toContain("MediaAsset[0]: id must be a positive number");
         expect(result.errors).toContain("MediaAsset[0]: url must be a valid URL");
         expect(result.errors).toContain('MediaAsset[1]: type must be either "image" or "video"');
         expect(result.errors).toContain("MediaAsset[1]: createdAt must be a valid ISO 8601 date");
      });

      it("should accept empty array of media assets", () => {
         const result = validateMediaAssets([]);
         expect(result.isValid).toBe(true);
         expect(result.errors).toEqual([]);
      });
   });
});
