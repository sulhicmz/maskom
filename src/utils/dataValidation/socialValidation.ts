import type { SocialLink } from "@/types/data";
import { createValidator } from "./baseValidation";

export const validateSocialLink = createValidator<SocialLink>({
  typeName: "SocialLink",
  stringFields: [
    { key: "url", required: true },
    { key: "iconClass", required: true },
    { key: "ariaLabel", required: true },
  ],
  enumFields: [
    { key: "target", required: false, allowedValues: ["_blank", "_self"] },
  ],
  customRules: [
    (item) => {
      if (item.target && !["_blank", "_self"].includes(item.target)) {
        return `SocialLink[${item.url}]: target must be either "_blank" or "_self"`;
      }
      return null;
    },
  ],
});
