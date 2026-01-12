import tags from "../BlogTagData";
import type { BlogTagItem } from "@/types/data";

describe('BlogTagData', () => {
   describe('data structure', () => {
      it('should export default tags array', () => {
         expect(tags).toBeDefined();
         expect(Array.isArray(tags)).toBe(true);
      });

      it('should have 9 tags', () => {
         expect(tags).toHaveLength(9);
      });

      it('each item should have id and name', () => {
         tags.forEach((tag: BlogTagItem) => {
            expect(tag).toHaveProperty('id');
            expect(tag).toHaveProperty('name');
            expect(typeof tag.id).toBe('number');
            expect(typeof tag.name).toBe('string');
         });
      });

      it('tags should have unique IDs', () => {
         const ids = tags.map(tag => tag.id);
         const uniqueIds = new Set(ids);
         expect(uniqueIds.size).toBe(ids.length);
      });

      it('tags should have unique names', () => {
         const names = tags.map(tag => tag.name);
         const uniqueNames = new Set(names);
         expect(uniqueNames.size).toBe(names.length);
      });
   });

   describe('data content', () => {
      it('should include SD-WAN tag', () => {
         expect(tags).toContainEqual({ id: 1, name: 'SD-WAN' });
      });

      it('should include Managed Wi-Fi tag', () => {
         expect(tags).toContainEqual({ id: 2, name: 'Managed Wi-Fi' });
      });

      it('should include Keamanan tag', () => {
         expect(tags).toContainEqual({ id: 3, name: 'Keamanan' });
      });

      it('should include Cloud Connect tag', () => {
         expect(tags).toContainEqual({ id: 4, name: 'Cloud Connect' });
      });

      it('should include Monitoring tag', () => {
         expect(tags).toContainEqual({ id: 5, name: 'Monitoring' });
      });

      it('should include IoT tag', () => {
         expect(tags).toContainEqual({ id: 6, name: 'IoT' });
      });

      it('should include Managed Service tag', () => {
         expect(tags).toContainEqual({ id: 7, name: 'Managed Service' });
      });

      it('should include Infrastruktur tag', () => {
         expect(tags).toContainEqual({ id: 8, name: 'Infrastruktur' });
      });

      it('should include Wi-Fi tag', () => {
         expect(tags).toContainEqual({ id: 9, name: 'Wi-Fi' });
      });
   });

   describe('index exports', () => {
      it('should export tagsByName map', async () => {
         const { tagsByName } = await import('../BlogTagData');
         expect(tagsByName).toBeInstanceOf(Map);
         expect(tagsByName.has('SD-WAN')).toBe(true);
      });

      it('should export tagsById map', async () => {
         const { tagsById } = await import('../BlogTagData');
         expect(tagsById).toBeInstanceOf(Map);
         expect(tagsById.has(1)).toBe(true);
      });
   });
});
