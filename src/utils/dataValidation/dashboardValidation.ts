import type { WiFiDevice, WebsiteTemplate, AIStep } from "@/types/data";
import { createValidator } from "./baseValidation";

export const validateWiFiDevice = createValidator<WiFiDevice>({
  typeName: "WiFiDevice",
  numberFields: [],
  stringFields: [
    { key: "name", required: true },
    { key: "ip", required: true },
  ],
  enumFields: [
    { key: "status", required: true, allowedValues: ["Online", "Offline"] },
  ],
  customRules: [
    (item) => {
      if (typeof item.id !== "number" || item.id <= 0) {
        return "WiFiDevice: id must be a positive number";
      }
      return null;
    },
  ],
});

export const validateWebsiteTemplate = createValidator<WebsiteTemplate>({
  typeName: "WebsiteTemplate",
  numberFields: [{ key: "id", required: true, min: 1 }],
  stringFields: [
    { key: "name", required: true },
    { key: "preview", required: true },
  ],
});

export const validateAIStep = createValidator<AIStep>({
  typeName: "AIStep",
  numberFields: [{ key: "id", required: true, min: 1 }],
  stringFields: [
    { key: "title", required: true },
    { key: "content", required: true },
  ],
});
