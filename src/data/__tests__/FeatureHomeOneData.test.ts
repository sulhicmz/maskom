import feature_list from "../FeatureHomeOneData";

describe('FeatureHomeOneData', () => {
   describe('data structure', () => {
      it('should export default feature list array', () => {
         expect(feature_list).toBeDefined();
         expect(Array.isArray(feature_list)).toBe(true);
      });

      it('should have 3 feature items', () => {
         expect(feature_list).toHaveLength(3);
      });

      it('each item should have required properties', () => {
         feature_list.forEach((item) => {
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('icon');
            expect(item).toHaveProperty('title');
            expect(item).toHaveProperty('desc');
         });
      });

      it('each id should be unique', () => {
         const ids = feature_list.map((item) => item.id);
         const uniqueIds = new Set(ids);
         expect(uniqueIds.size).toBe(ids.length);
      });
   });

   describe('data content', () => {
      it('first item should be about network expansion', () => {
         const firstItem = feature_list[0];
         expect(firstItem.title).toBe('Jaringan Siap Ekspansi');
         expect(firstItem.icon).toBe('flaticon-communication');
      });

      it('second item should be about security', () => {
         const secondItem = feature_list[1];
         expect(secondItem.title).toBe('Keamanan Berlapis');
         expect(secondItem.icon).toBe('flaticon-security');
      });

      it('third item should be about operations', () => {
         const thirdItem = feature_list[2];
         expect(thirdItem.title).toBe('Operasional Terpantau');
         expect(thirdItem.icon).toBe('flaticon-support');
      });
   });
});
