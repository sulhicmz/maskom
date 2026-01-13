import { createValidator } from "./baseValidation";
import { UseCaseSidebarItem } from "@/types/data";

export const validateUseCaseSidebarItem = createValidator<UseCaseSidebarItem>({
   typeName: "UseCaseSidebarItem",
   numberFields: [
      { key: "id", required: true, min: 1 }
   ],
   stringFields: [
      { key: "title", required: true },
      { key: "link", required: true }
   ]
});
