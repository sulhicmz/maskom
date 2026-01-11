import brand_data from "../BrandData";

describe('BrandData', () => {
   describe('data structure', () => {
      it('should export default brand data array', () => {
         expect(brand_data).toBeDefined();
         expect(Array.isArray(brand_data)).toBe(true);
      });

      it('should have 8 brand logos', () => {
         expect(brand_data).toHaveLength(8);
      });

      it('each item should be a StaticImageData object', () => {
         brand_data.forEach((item) => {
            expect(item).toHaveProperty('src');
            expect(item).toHaveProperty('height');
            expect(item).toHaveProperty('width');
            expect(item).toHaveProperty('blurDataURL');
         });
      });
   });

   describe('data content', () => {
      it('should include duplicate brand for carousel effect', () => {
         const firstBrand = brand_data[0];
         const lastBrand = brand_data[brand_data.length - 1];
         expect(firstBrand.src).toBe(lastBrand.src);
      });
   });
});
