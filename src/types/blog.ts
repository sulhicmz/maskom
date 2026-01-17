import { InnerBlogPost } from '@/types/data';

export interface BlogPostVersion {
   id: string;
   postId: number;
   content: Partial<InnerBlogPost>;
   timestamp: string;
   notes: string;
   author: string;
}

export interface VersionDiff {
   field: string;
   oldValue: unknown;
   newValue: unknown;
   type: 'added' | 'removed' | 'changed';
}
