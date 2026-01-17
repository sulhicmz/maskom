import { versionStorage } from '../versionStorage';
import { BlogPostVersion } from '@/types/blog';

describe('VersionStorage', () => {
   const mockPostId = 1;

   beforeEach(() => {
      localStorage.clear();
   });

   afterEach(() => {
      localStorage.clear();
   });

   describe('saveVersion', () => {
      it('should save a new version', () => {
         const version: BlogPostVersion = {
            id: 'version-1',
            postId: mockPostId,
            content: { title: 'Test Title', desc: 'Test Description' },
            timestamp: new Date().toISOString(),
            notes: 'Initial version',
            author: 'test-user'
         };

         versionStorage.saveVersion(version);

         const versions = versionStorage.getPostVersions(mockPostId);
         expect(versions).toHaveLength(1);
         expect(versions[0].id).toBe('version-1');
         expect(versions[0].content.title).toBe('Test Title');
      });

      it('should handle multiple versions for same post', () => {
         const version1: BlogPostVersion = {
            id: 'version-1',
            postId: mockPostId,
            content: { title: 'Title 1', desc: 'Desc 1' },
            timestamp: new Date(Date.now() - 1000).toISOString(),
            notes: 'First version',
            author: 'user1'
         };

         const version2: BlogPostVersion = {
            id: 'version-2',
            postId: mockPostId,
            content: { title: 'Title 2', desc: 'Desc 2' },
            timestamp: new Date().toISOString(),
            notes: 'Second version',
            author: 'user1'
         };

         versionStorage.saveVersion(version1);
         versionStorage.saveVersion(version2);

         const versions = versionStorage.getPostVersions(mockPostId);
         expect(versions).toHaveLength(2);
         expect(versions[0].id).toBe('version-2');
         expect(versions[1].id).toBe('version-1');
      });

      it('should limit versions to maxVersions', () => {
         for (let i = 0; i < 25; i++) {
            const version: BlogPostVersion = {
               id: `version-${i}`,
               postId: mockPostId,
               content: { title: `Title ${i}`, desc: `Desc ${i}` },
               timestamp: new Date(Date.now() - (25 - i) * 1000).toISOString(),
               notes: `Version ${i}`,
               author: 'user1'
            };
            versionStorage.saveVersion(version);
         }

         const versions = versionStorage.getPostVersions(mockPostId);
         expect(versions.length).toBeLessThanOrEqual(20);
      });
   });

   describe('getPostVersions', () => {
      it('should return empty array for post with no versions', () => {
         const versions = versionStorage.getPostVersions(999);
         expect(versions).toEqual([]);
      });

      it('should return versions sorted by timestamp (newest first)', () => {
         const now = Date.now();
         const version1: BlogPostVersion = {
            id: 'version-1',
            postId: mockPostId,
            content: { title: 'Title 1' },
            timestamp: new Date(now - 3000).toISOString(),
            notes: 'First',
            author: 'user1'
         };
         const version2: BlogPostVersion = {
            id: 'version-2',
            postId: mockPostId,
            content: { title: 'Title 2' },
            timestamp: new Date(now - 1000).toISOString(),
            notes: 'Second',
            author: 'user1'
         };
         const version3: BlogPostVersion = {
            id: 'version-3',
            postId: mockPostId,
            content: { title: 'Title 3' },
            timestamp: new Date(now - 2000).toISOString(),
            notes: 'Third',
            author: 'user1'
         };

         versionStorage.saveVersion(version1);
         versionStorage.saveVersion(version2);
         versionStorage.saveVersion(version3);

         const versions = versionStorage.getPostVersions(mockPostId);
         expect(versions).toHaveLength(3);
         expect(versions[0].id).toBe('version-2');
         expect(versions[1].id).toBe('version-3');
         expect(versions[2].id).toBe('version-1');
      });

      it('should handle corrupt localStorage data gracefully', () => {
         localStorage.setItem('blog_version_list_1', 'invalid-json');
         const versions = versionStorage.getPostVersions(mockPostId);
         expect(versions).toEqual([]);
      });
   });

   describe('deleteVersion', () => {
      it('should delete a specific version', () => {
         const version1: BlogPostVersion = {
            id: 'version-1',
            postId: mockPostId,
            content: { title: 'Title 1' },
            timestamp: new Date().toISOString(),
            notes: 'First',
            author: 'user1'
         };
         const version2: BlogPostVersion = {
            id: 'version-2',
            postId: mockPostId,
            content: { title: 'Title 2' },
            timestamp: new Date().toISOString(),
            notes: 'Second',
            author: 'user1'
         };

         versionStorage.saveVersion(version1);
         versionStorage.saveVersion(version2);

         versionStorage.deleteVersion(mockPostId, 'version-1');

         const versions = versionStorage.getPostVersions(mockPostId);
         expect(versions).toHaveLength(1);
         expect(versions[0].id).toBe('version-2');
      });

      it('should clear list when last version deleted', () => {
         const version: BlogPostVersion = {
            id: 'version-1',
            postId: mockPostId,
            content: { title: 'Title' },
            timestamp: new Date().toISOString(),
            notes: 'Only version',
            author: 'user1'
         };

         versionStorage.saveVersion(version);
         versionStorage.deleteVersion(mockPostId, 'version-1');

         const versions = versionStorage.getPostVersions(mockPostId);
         expect(versions).toEqual([]);
      });
   });

   describe('clearPostVersions', () => {
      it('should clear all versions for a post', () => {
         for (let i = 0; i < 5; i++) {
            const version: BlogPostVersion = {
               id: `version-${i}`,
               postId: mockPostId,
               content: { title: `Title ${i}` },
               timestamp: new Date().toISOString(),
               notes: `Version ${i}`,
               author: 'user1'
            };
            versionStorage.saveVersion(version);
         }

         versionStorage.clearPostVersions(mockPostId);

         const versions = versionStorage.getPostVersions(mockPostId);
         expect(versions).toEqual([]);
      });
   });

   describe('compareVersions', () => {
      it('should detect added fields', () => {
         const version1: BlogPostVersion = {
            id: 'version-1',
            postId: mockPostId,
            content: { title: 'Title' },
            timestamp: new Date().toISOString(),
            notes: 'First',
            author: 'user1'
         };
         const version2: BlogPostVersion = {
            id: 'version-2',
            postId: mockPostId,
            content: { title: 'Title', desc: 'Description' },
            timestamp: new Date().toISOString(),
            notes: 'Added desc',
            author: 'user1'
         };

         const diffs = versionStorage.compareVersions(version1, version2);

         expect(diffs).toHaveLength(1);
         expect(diffs[0].field).toBe('desc');
         expect(diffs[0].type).toBe('added');
      });

      it('should detect removed fields', () => {
         const version1: BlogPostVersion = {
            id: 'version-1',
            postId: mockPostId,
            content: { title: 'Title', desc: 'Description' },
            timestamp: new Date().toISOString(),
            notes: 'With desc',
            author: 'user1'
         };
         const version2: BlogPostVersion = {
            id: 'version-2',
            postId: mockPostId,
            content: { title: 'Title' },
            timestamp: new Date().toISOString(),
            notes: 'Removed desc',
            author: 'user1'
         };

         const diffs = versionStorage.compareVersions(version1, version2);

         expect(diffs).toHaveLength(1);
         expect(diffs[0].field).toBe('desc');
         expect(diffs[0].type).toBe('removed');
      });

      it('should detect changed fields', () => {
         const version1: BlogPostVersion = {
            id: 'version-1',
            postId: mockPostId,
            content: { title: 'Old Title', desc: 'Description' },
            timestamp: new Date().toISOString(),
            notes: 'Old',
            author: 'user1'
         };
         const version2: BlogPostVersion = {
            id: 'version-2',
            postId: mockPostId,
            content: { title: 'New Title', desc: 'Description' },
            timestamp: new Date().toISOString(),
            notes: 'New',
            author: 'user1'
         };

         const diffs = versionStorage.compareVersions(version1, version2);

         expect(diffs).toHaveLength(1);
         expect(diffs[0].field).toBe('title');
         expect(diffs[0].type).toBe('changed');
         expect(diffs[0].oldValue).toBe('Old Title');
         expect(diffs[0].newValue).toBe('New Title');
      });

      it('should return empty array when versions are identical', () => {
         const version1: BlogPostVersion = {
            id: 'version-1',
            postId: mockPostId,
            content: { title: 'Title', desc: 'Description' },
            timestamp: new Date().toISOString(),
            notes: 'Version 1',
            author: 'user1'
         };
         const version2: BlogPostVersion = {
            id: 'version-2',
            postId: mockPostId,
            content: { title: 'Title', desc: 'Description' },
            timestamp: new Date().toISOString(),
            notes: 'Version 2',
            author: 'user1'
         };

         const diffs = versionStorage.compareVersions(version1, version2);

         expect(diffs).toEqual([]);
      });

      it('should handle multiple field changes', () => {
         const version1: BlogPostVersion = {
            id: 'version-1',
            postId: mockPostId,
            content: { title: 'Title 1', desc: 'Desc 1' },
            timestamp: new Date().toISOString(),
            notes: 'First',
            author: 'user1'
         };
         const version2: BlogPostVersion = {
            id: 'version-2',
            postId: mockPostId,
            content: { title: 'Title 2', desc: 'Desc 2', status: 'published' },
            timestamp: new Date().toISOString(),
            notes: 'Second',
            author: 'user1'
         };

         const diffs = versionStorage.compareVersions(version1, version2);

         expect(diffs.length).toBeGreaterThanOrEqual(2);
         const titleDiff = diffs.find(d => d.field === 'title');
         expect(titleDiff?.type).toBe('changed');
      });
   });

   describe('getVersionCount', () => {
      it('should return 0 for post with no versions', () => {
         const count = versionStorage.getVersionCount(999);
         expect(count).toBe(0);
      });

      it('should return correct version count', () => {
         for (let i = 0; i < 5; i++) {
            const version: BlogPostVersion = {
               id: `version-${i}`,
               postId: mockPostId,
               content: { title: `Title ${i}` },
               timestamp: new Date().toISOString(),
               notes: `Version ${i}`,
               author: 'user1'
            };
            versionStorage.saveVersion(version);
         }

         const count = versionStorage.getVersionCount(mockPostId);
         expect(count).toBe(5);
      });
   });

   describe('Edge Cases', () => {
      it('should handle very large version notes', () => {
         const largeNotes = 'x'.repeat(10000);
         const version: BlogPostVersion = {
            id: 'version-large',
            postId: mockPostId,
            content: { title: 'Title' },
            timestamp: new Date().toISOString(),
            notes: largeNotes,
            author: 'user1'
         };

         versionStorage.saveVersion(version);
         const versions = versionStorage.getPostVersions(mockPostId);
         expect(versions[0].notes).toBe(largeNotes);
      });

      it('should handle special characters in notes', () => {
         const version: BlogPostVersion = {
            id: 'version-special',
            postId: mockPostId,
            content: { title: 'Title' },
            timestamp: new Date().toISOString(),
            notes: 'Special chars: <>&"\'🎉',
            author: 'user1'
         };

         versionStorage.saveVersion(version);
         const versions = versionStorage.getPostVersions(mockPostId);
         expect(versions[0].notes).toBe('Special chars: <>&"\'🎉');
      });

      it('should handle empty content object', () => {
         const version: BlogPostVersion = {
            id: 'version-empty',
            postId: mockPostId,
            content: {},
            timestamp: new Date().toISOString(),
            notes: 'Empty content',
            author: 'user1'
         };

         versionStorage.saveVersion(version);
         const versions = versionStorage.getPostVersions(mockPostId);
         expect(versions[0].content).toEqual({});
      });

      it('should handle concurrent version saves for different posts', () => {
         const version1: BlogPostVersion = {
            id: 'version-1',
            postId: 1,
            content: { title: 'Title 1' },
            timestamp: new Date().toISOString(),
            notes: 'Post 1',
            author: 'user1'
         };
         const version2: BlogPostVersion = {
            id: 'version-2',
            postId: 2,
            content: { title: 'Title 2' },
            timestamp: new Date().toISOString(),
            notes: 'Post 2',
            author: 'user1'
         };

         versionStorage.saveVersion(version1);
         versionStorage.saveVersion(version2);

         const versions1 = versionStorage.getPostVersions(1);
         const versions2 = versionStorage.getPostVersions(2);

         expect(versions1).toHaveLength(1);
         expect(versions2).toHaveLength(1);
         expect(versions1[0].id).toBe('version-1');
         expect(versions2[0].id).toBe('version-2');
      });
   });
});
