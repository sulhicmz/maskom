import type { DataRelationship } from "@/types/data";

export const DATA_RELATIONSHIPS: DataRelationship[] = [
  {
    sourceCollection: "BlogCommentData",
    targetCollection: "InnerBlogData",
    sourceField: "blogId",
    targetField: "id",
    type: "many-to-one",
    optional: false,
  },
];

export default DATA_RELATIONSHIPS;
