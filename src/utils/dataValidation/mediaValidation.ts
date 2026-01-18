import type { MediaAsset } from "@/types/data";

const isValidUrl = (url: string): boolean => {
   try {
      new URL(url);
      return true;
   } catch {
      return false;
   }
};

const isValidISODate = (date: string): boolean => {
   const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?$/;
   return isoDateRegex.test(date);
};

export const validateMediaItem = (item: MediaAsset): { isValid: boolean; errors: string[] } => {
   const errors: string[] = [];

   if (typeof item.id !== "number" || item.id <= 0) {
      errors.push(`MediaAsset[${item.id}]: id must be a positive number`);
   }

   if (!isValidUrl(item.url)) {
      errors.push(`MediaAsset[${item.id}]: url must be a valid URL`);
   }

   const validTypes = ['image', 'video'] as const;
   if (!validTypes.includes(item.type)) {
      errors.push(`MediaAsset[${item.id}]: type must be either "image" or "video"`);
   }

   if (typeof item.alt !== "string" || item.alt.trim() === "") {
      errors.push(`MediaAsset[${item.id}]: alt must not be empty`);
   }

   if (!Array.isArray(item.tags) || item.tags.length === 0) {
      errors.push(`MediaAsset[${item.id}]: tags must be a non-empty array`);
   } else {
      item.tags.forEach((tag, index) => {
         if (typeof tag !== "string") {
            errors.push(`tags[${index}]: must be a string`);
         } else if (tag.trim() === "") {
            errors.push(`tags[${index}]: must not be empty`);
         } else if (tag.length > 50) {
            errors.push(`tags[${index}]: must be at most 50 characters`);
         }
      });

      if (item.tags.length > 10) {
         errors.push(`MediaAsset[${item.id}]: tags must have at most 10 items`);
      }
   }

   if (!isValidISODate(item.createdAt)) {
      errors.push(`MediaAsset[${item.id}]: createdAt must be a valid ISO 8601 date`);
   }

   if ('usageCount' in item && item.usageCount !== undefined) {
      if (typeof item.usageCount !== "number") {
         errors.push(`MediaAsset[${item.id}]: usageCount must be a number`);
      } else if (item.usageCount < 0) {
         errors.push(`MediaAsset[${item.id}]: usageCount must be a positive number`);
      }
   }

   return {
      isValid: errors.length === 0,
      errors,
   };
};

export const validateMediaAssets = (items: MediaAsset[]): { isValid: boolean; errors: string[] } => {
   const allErrors: string[] = [];

   items.forEach((item) => {
      const result = validateMediaItem(item);
      allErrors.push(...result.errors);
   });

   return {
      isValid: allErrors.length === 0,
      errors: allErrors,
   };
};
