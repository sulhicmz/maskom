import type { MenuItem, NavigationItem, NavigationSection } from "@/types/data";
import { createValidator } from "./baseValidation";

export const validateMenuItem = createValidator<MenuItem>({
  typeName: "MenuItem",
  numberFields: [{ key: "id", required: true, min: 1 }],
  stringFields: [
    { key: "title", required: true },
    { key: "link", required: true },
  ],
  enumFields: [
    { key: "has_dropdown", required: true, allowedValues: [true, false] },
  ],
  customRules: [
    (item) => {
      if (item.has_dropdown) {
        if (!Array.isArray(item.sub_menus) || item.sub_menus.length === 0) {
          return `MenuItem[${item.id}]: sub_menus must be a non-empty array when has_dropdown is true`;
        }
        for (let i = 0; i < (item.sub_menus || []).length; i++) {
          const sub = item.sub_menus![i];
          if (typeof sub.link !== "string" || sub.link.trim() === "") {
            return `MenuItem[${item.id}]: sub_menus[${i}].link must be a non-empty string`;
          }
          if (typeof sub.title !== "string" || sub.title.trim() === "") {
            return `MenuItem[${item.id}]: sub_menus[${i}].title must be a non-empty string`;
          }
        }
      }
      return null;
    },
  ],
});

export const validateNavigationItem = createValidator<NavigationItem>({
  typeName: "NavigationItem",
  stringFields: [
    { key: "url", required: true },
  ],
  enumFields: [
    { key: "target", required: false, allowedValues: ["_blank", "_self"] },
  ],
  customRules: [
    (item) => {
      if (typeof item.label !== "string" || item.label.trim() === "") {
        return `NavigationItem[${item.url}]: label must be a non-empty string`;
      }
      return null;
    },
    (item) => {
      if (item.target && !["_blank", "_self"].includes(item.target)) {
        return `NavigationItem[${item.url}]: target must be either "_blank" or "_self"`;
      }
      return null;
    },
  ],
});

export const validateNavigationSection = createValidator<NavigationSection>({
  typeName: "NavigationSection",
  stringFields: [],
  arrayFields: [
    {
      key: "items",
      required: true,
      itemValidator: (navItem: unknown) => {
        const result = validateNavigationItem(navItem as NavigationItem);
        return result.errors.length > 0 ? result.errors[0] : null;
      },
    },
  ],
  customRules: [
    (item) => {
      if (typeof item.title !== "string" || item.title.trim() === "") {
        return "NavigationSection: title must be a non-empty string";
      }
      return null;
    },
    (item) => {
      if (!Array.isArray(item.items) || item.items.length === 0) {
        return `NavigationSection[${item.title}]: items must be a non-empty array`;
      }
      return null;
    },
  ],
});
