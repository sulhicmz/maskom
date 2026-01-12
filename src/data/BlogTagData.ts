import type { BlogTagItem } from "@/types/data";

const tags: BlogTagItem[] = [
   { id: 1, name: "SD-WAN" },
   { id: 2, name: "Managed Wi-Fi" },
   { id: 3, name: "Keamanan" },
   { id: 4, name: "Cloud Connect" },
   { id: 5, name: "Monitoring" },
   { id: 6, name: "IoT" },
   { id: 7, name: "Managed Service" },
   { id: 8, name: "Infrastruktur" },
   { id: 9, name: "Wi-Fi" },
];

export default tags;
export const tagsByName = new Map(tags.map(tag => [tag.name, tag]));
export const tagsById = new Map(tags.map(tag => [tag.id, tag]));
