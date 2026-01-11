import type { ContactInfoItem } from "@/types/data";
import { createValidator } from "./baseValidation";

export const validateContactInfoItem = createValidator<ContactInfoItem>({
  typeName: "ContactInfoItem",
  numberFields: [
    { key: "id", required: true, min: 1 },
  ],
  stringFields: [
    { key: "icon", required: true },
    { key: "title", required: true },
  ],
  arrayFields: [
    {
      key: "lines",
      required: false,
      itemValidator: (line: unknown) => {
        if (typeof line !== "string" || line.trim() === "") {
          return "ContactInfoItem: lines array items must be non-empty strings";
        }
        return null;
      },
    },
    {
      key: "links",
      required: false,
      itemValidator: (link: unknown) => {
        const linkObj = link as { text: string; href: string; target?: string; rel?: string };
        const errors: string[] = [];

        if (typeof linkObj.text !== "string" || linkObj.text.trim() === "") {
          errors.push("links text must be a non-empty string");
        }

        if (typeof linkObj.href !== "string" || linkObj.href.trim() === "") {
          errors.push("links href must be a non-empty string");
        }

        if (linkObj.target && !["_blank", "_self"].includes(linkObj.target)) {
          errors.push("links target must be either '_blank' or '_self'");
        }

        return errors.length > 0 ? `ContactInfoItem: ${errors.join(", ")}` : null;
      },
    },
  ],
});
