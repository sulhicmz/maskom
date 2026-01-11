import contact_data from "../ContactData";

describe('ContactData', () => {
   describe('data structure', () => {
      it('should export default contact data array', () => {
         expect(contact_data).toBeDefined();
         expect(Array.isArray(contact_data)).toBe(true);
      });

      it('should have 3 contact items', () => {
         expect(contact_data).toHaveLength(3);
      });

      it('each item should have required properties', () => {
         contact_data.forEach((item) => {
            expect(item).toHaveProperty('id');
            expect(item).toHaveProperty('icon');
            expect(item).toHaveProperty('title');
            expect(item).toHaveProperty('lines');
         });
      });

      it('first item should have lines but no links', () => {
         const firstItem = contact_data[0];
         expect(firstItem.lines).toHaveLength(2);
         expect(firstItem.links).toBeUndefined();
      });

      it('second item should have links but no lines', () => {
         const secondItem = contact_data[1];
         expect(secondItem.lines).toHaveLength(0);
         expect(secondItem.links).toBeDefined();
         expect(secondItem.links).toHaveLength(2);
      });

      it('third item should have links but no lines', () => {
         const thirdItem = contact_data[2];
         expect(thirdItem.lines).toHaveLength(0);
         expect(thirdItem.links).toBeDefined();
         expect(thirdItem.links).toHaveLength(2);
      });

      it('each id should be unique', () => {
         const ids = contact_data.map((item) => item.id);
         const uniqueIds = new Set(ids);
         expect(uniqueIds.size).toBe(ids.length);
      });

      it('icons should be valid font-awesome class names', () => {
         contact_data.forEach((item) => {
            expect(item.icon).toMatch(/^(fa|far|fas) /);
         });
      });
   });

   describe('data content', () => {
      it('first item should be office address', () => {
         const firstItem = contact_data[0];
         expect(firstItem.title).toBe('Kantor Pusat');
         expect(firstItem.icon).toBe('fas fa-map-marker-alt');
      });

      it('second item should be email', () => {
         const secondItem = contact_data[1];
         expect(secondItem.title).toBe('Email');
         expect(secondItem.icon).toBe('far fa-envelope-open');
      });

      it('third item should be phone', () => {
         const thirdItem = contact_data[2];
         expect(thirdItem.title).toBe('Telepon');
         expect(thirdItem.icon).toBe('fas fa-phone-alt');
      });
   });
});
