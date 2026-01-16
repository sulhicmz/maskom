import { CategoryItem } from "@/types/data";
import { createIdIndex, type IdIndex } from "@/utils/dataIndex";

const { data: blog_categories_data }: { data: CategoryItem[]; nextId: number } = {
   data: [
      { name: "Konektivitas Terkelola" },
      { name: "Keamanan Jaringan" },
      { name: "Operasional & Dukungan" },
      { name: "Transformasi Digital" },
      { name: "Infrastruktur Cloud" },
      { name: "IoT & Edge" },
   ],
   nextId: 1
}.data.reduce((acc, item, index) => {
   acc.data.push({ id: index + 1, name: item.name });
   return acc;
}, { data: [] as CategoryItem[], nextId: 1 });

export default blog_categories_data;
export const blogCategoryById: IdIndex<CategoryItem> = createIdIndex(blog_categories_data);
export const blogCategoriesByName = new Map<string, CategoryItem>(
   blog_categories_data.map((category) => [category.name, category])
);
