import type { TeamMember } from "@/types/data";
import { createValidator } from "./baseValidation";

export const validateTeamMember = createValidator<TeamMember>({
  typeName: "TeamMember",
  numberFields: [{ key: "id", required: true, min: 1 }],
  stringFields: [
    { key: "title", required: true },
    { key: "designation", required: true },
  ],
});
