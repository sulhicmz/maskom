import blog_categories_data, { blogCategoryById, blogCategoriesByName } from "../BlogCategoryData";

describe('BlogCategoryData', () => {
   describe('data structure', () => {
      it('should export default blog_categories_data array', () => {
         expect(blog_categories_data).toBeDefined();
         expect(Array.isArray(blog_categories_data)).toBe(true);
      });

      it('should have 6 categories', () => {
         expect(blog_categories_data).toHaveLength(6);
      });

      it('each item should have id and name properties', () => {
         blog_categories_data.forEach((category) => {
            expect(category).toHaveProperty('id');
            expect(category).toHaveProperty('name');
            expect(typeof category.id).toBe('number');
            expect(typeof category.name).toBe('string');
         });
      });

      it('all ids should be unique', () => {
         const ids = blog_categories_data.map((cat) => cat.id);
         const uniqueIds = new Set(ids);
         expect(ids.length).toBe(uniqueIds.size);
      });
   });

   describe('data content', () => {
      it('should include Konektivitas Terkelola with id 1', () => {
         const category = blog_categories_data.find((cat) => cat.name === 'Konektivitas Terkelola');
         expect(category).toBeDefined();
         expect(category?.id).toBe(1);
      });

      it('should include Keamanan Jaringan with id 2', () => {
         const category = blog_categories_data.find((cat) => cat.name === 'Keamanan Jaringan');
         expect(category).toBeDefined();
         expect(category?.id).toBe(2);
      });

      it('should include Operasional & Dukungan with id 3', () => {
         const category = blog_categories_data.find((cat) => cat.name === 'Operasional & Dukungan');
         expect(category).toBeDefined();
         expect(category?.id).toBe(3);
      });

      it('should include Transformasi Digital with id 4', () => {
         const category = blog_categories_data.find((cat) => cat.name === 'Transformasi Digital');
         expect(category).toBeDefined();
         expect(category?.id).toBe(4);
      });

      it('should include Infrastruktur Cloud with id 5', () => {
         const category = blog_categories_data.find((cat) => cat.name === 'Infrastruktur Cloud');
         expect(category).toBeDefined();
         expect(category?.id).toBe(5);
      });

      it('should include IoT & Edge with id 6', () => {
         const category = blog_categories_data.find((cat) => cat.name === 'IoT & Edge');
         expect(category).toBeDefined();
         expect(category?.id).toBe(6);
      });
   });

   describe('exports', () => {
      it('should export blogCategoryById IdIndex', () => {
         expect(blogCategoryById).toBeDefined();
         expect(typeof blogCategoryById.get).toBe('function');
      });

      it('should export blogCategoriesByName Map', () => {
         expect(blogCategoriesByName).toBeDefined();
         expect(blogCategoriesByName instanceof Map).toBe(true);
      });

      it('blogCategoryById should allow O(1) lookups by id', () => {
         const category = blogCategoryById.get(1);
         expect(category).toBeDefined();
         expect(category?.name).toBe('Konektivitas Terkelola');
      });

      it('blogCategoriesByName should allow O(1) lookups by name', () => {
         const category = blogCategoriesByName.get('IoT & Edge');
         expect(category).toBeDefined();
         expect(category?.id).toBe(6);
      });
   });
});
