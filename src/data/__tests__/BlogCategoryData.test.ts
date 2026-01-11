import categories from "../BlogCategoryData";

describe('BlogCategoryData', () => {
   describe('data structure', () => {
      it('should export default categories array', () => {
         expect(categories).toBeDefined();
         expect(Array.isArray(categories)).toBe(true);
      });

      it('should have 6 categories', () => {
         expect(categories).toHaveLength(6);
      });

      it('each item should be a string', () => {
         categories.forEach((category) => {
            expect(typeof category).toBe('string');
         });
      });
   });

   describe('data content', () => {
      it('should include Konektivitas Terkelola', () => {
         expect(categories).toContain('Konektivitas Terkelola');
      });

      it('should include Keamanan Jaringan', () => {
         expect(categories).toContain('Keamanan Jaringan');
      });

      it('should include Operasional & Dukungan', () => {
         expect(categories).toContain('Operasional & Dukungan');
      });

      it('should include Transformasi Digital', () => {
         expect(categories).toContain('Transformasi Digital');
      });

      it('should include Infrastruktur Cloud', () => {
         expect(categories).toContain('Infrastruktur Cloud');
      });

      it('should include IoT & Edge', () => {
         expect(categories).toContain('IoT & Edge');
      });
   });
});
