import tags from "../BlogTagData";

describe('BlogTagData', () => {
   describe('data structure', () => {
      it('should export default tags array', () => {
         expect(tags).toBeDefined();
         expect(Array.isArray(tags)).toBe(true);
      });

      it('should have 6 tags', () => {
         expect(tags).toHaveLength(6);
      });

      it('each item should be a string', () => {
         tags.forEach((tag) => {
            expect(typeof tag).toBe('string');
         });
      });
   });

   describe('data content', () => {
      it('should include SD-WAN tag', () => {
         expect(tags).toContain('SD-WAN');
      });

      it('should include Managed Wi-Fi tag', () => {
         expect(tags).toContain('Managed Wi-Fi');
      });

      it('should include Keamanan tag', () => {
         expect(tags).toContain('Keamanan');
      });

      it('should include Cloud Connect tag', () => {
         expect(tags).toContain('Cloud Connect');
      });

      it('should include Monitoring tag', () => {
         expect(tags).toContain('Monitoring');
      });

      it('should include IoT tag', () => {
         expect(tags).toContain('IoT');
      });
   });
});
