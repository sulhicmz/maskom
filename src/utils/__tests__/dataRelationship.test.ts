import {
    validateRelationships,
    checkReferentialIntegrity,
    getRelatedItems,
    getRelatedItem,
    getOneToManyRelations,
    checkCircularDependencies,
    checkSelfReferentialCircularDependencies,
    getRelationshipGraph,
    findRelationshipsByCollection,
    cascadeDelete,
    validateForeignKey,
} from '../dataRelationship';
import type { DataRelationship } from '@/types/data';

describe('dataRelationship', () => {
    describe('validateRelationships', () => {
        it('should return valid result with no errors', () => {
            const relationships: DataRelationship[] = [
                {
                    sourceCollection: 'comments',
                    targetCollection: 'posts',
                    sourceField: 'postId',
                    targetField: 'id',
                    type: 'many-to-one',
                },
            ];

            const collections: Record<string, unknown[]> = {
                comments: [
                    { id: 1, postId: 100 },
                    { id: 2, postId: 100 },
                ],
                posts: [
                    { id: 100, title: 'Post 1' },
                ],
            };

            const result = validateRelationships(relationships, collections);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.relationshipsValidated).toBe(1);
        });

        it('should return errors when source collection not found', () => {
            const relationships: DataRelationship[] = [
                {
                    sourceCollection: 'comments',
                    targetCollection: 'posts',
                    sourceField: 'postId',
                    targetField: 'id',
                    type: 'many-to-one',
                },
            ];

            const collections: Record<string, unknown[]> = {
                posts: [{ id: 100, title: 'Post 1' }],
            };

            const result = validateRelationships(relationships, collections);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].error).toContain('Source collection');
            expect(result.relationshipsValidated).toBe(1);
        });

        it('should return errors when target collection not found', () => {
            const relationships: DataRelationship[] = [
                {
                    sourceCollection: 'comments',
                    targetCollection: 'posts',
                    sourceField: 'postId',
                    targetField: 'id',
                    type: 'many-to-one',
                },
            ];

            const collections: Record<string, unknown[]> = {
                comments: [{ id: 1, postId: 100 }],
            };

            const result = validateRelationships(relationships, collections);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].error).toContain('Target collection');
        });

        it('should validate multiple relationships', () => {
            const relationships: DataRelationship[] = [
                {
                    sourceCollection: 'comments',
                    targetCollection: 'posts',
                    sourceField: 'postId',
                    targetField: 'id',
                    type: 'many-to-one',
                },
                {
                    sourceCollection: 'posts',
                    targetCollection: 'users',
                    sourceField: 'authorId',
                    targetField: 'id',
                    type: 'many-to-one',
                },
            ];

            const collections: Record<string, unknown[]> = {
                comments: [{ id: 1, postId: 100 }],
                posts: [{ id: 100, authorId: 1 }],
                users: [{ id: 1, name: 'User 1' }],
            };

            const result = validateRelationships(relationships, collections);

            expect(result.isValid).toBe(true);
            expect(result.relationshipsValidated).toBe(2);
        });

        it('should collect all referential integrity errors', () => {
            const relationships: DataRelationship[] = [
                {
                    sourceCollection: 'comments',
                    targetCollection: 'posts',
                    sourceField: 'postId',
                    targetField: 'id',
                    type: 'many-to-one',
                },
            ];

            const collections: Record<string, unknown[]> = {
                comments: [
                    { id: 1, postId: 100 },
                    { id: 2, postId: 999 },
                ],
                posts: [{ id: 100, title: 'Post 1' }],
            };

            const result = validateRelationships(relationships, collections);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].error).toContain('Referential integrity violation');
        });
    });

    describe('checkReferentialIntegrity', () => {
        it('should pass valid foreign key references', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'comments',
                targetCollection: 'posts',
                sourceField: 'postId',
                targetField: 'id',
                type: 'many-to-one',
            };

            const sourceCollection = [
                { id: 1, postId: 100 },
                { id: 2, postId: 101 },
            ];
            const targetCollection = [
                { id: 100, title: 'Post 1' },
                { id: 101, title: 'Post 2' },
            ];

            const result = checkReferentialIntegrity(relationship, sourceCollection, targetCollection);

            expect(result).toHaveLength(0);
        });

        it('should detect missing foreign key references', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'comments',
                targetCollection: 'posts',
                sourceField: 'postId',
                targetField: 'id',
                type: 'many-to-one',
            };

            const sourceCollection = [
                { id: 1, postId: 100 },
                { id: 2, postId: 999 },
            ];
            const targetCollection = [
                { id: 100, title: 'Post 1' },
            ];

            const result = checkReferentialIntegrity(relationship, sourceCollection, targetCollection);

            expect(result).toHaveLength(1);
            expect(result[0].error).toContain('Referential integrity violation');
            expect(result[0].sourceItemId).toBe('2');
            expect(result[0].targetId).toBe('999');
        });

        it('should handle optional foreign keys when null', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'comments',
                targetCollection: 'posts',
                sourceField: 'postId',
                targetField: 'id',
                type: 'many-to-one',
                optional: true,
            };

            const sourceCollection = [
                { id: 1, postId: null },
                { id: 2, postId: 100 },
            ];
            const targetCollection = [
                { id: 100, title: 'Post 1' },
            ];

            const result = checkReferentialIntegrity(relationship, sourceCollection, targetCollection);

            expect(result).toHaveLength(0);
        });

        it('should handle optional foreign keys when undefined', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'comments',
                targetCollection: 'posts',
                sourceField: 'postId',
                targetField: 'id',
                type: 'many-to-one',
                optional: true,
            };

            const sourceCollection = [
                { id: 1, postId: undefined },
                { id: 2, postId: 100 },
            ];
            const targetCollection = [
                { id: 100, title: 'Post 1' },
            ];

            const result = checkReferentialIntegrity(relationship, sourceCollection, targetCollection);

            expect(result).toHaveLength(0);
        });

        it('should return errors for required null foreign keys', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'comments',
                targetCollection: 'posts',
                sourceField: 'postId',
                targetField: 'id',
                type: 'many-to-one',
                optional: false,
            };

            const sourceCollection = [
                { id: 1, postId: null },
                { id: 2, postId: 100 },
            ];
            const targetCollection = [
                { id: 100, title: 'Post 1' },
            ];

            const result = checkReferentialIntegrity(relationship, sourceCollection, targetCollection);

            expect(result).toHaveLength(1);
            expect(result[0].error).toContain('missing or null');
        });

        it('should handle string to number comparison', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'comments',
                targetCollection: 'posts',
                sourceField: 'postId',
                targetField: 'id',
                type: 'many-to-one',
            };

            const sourceCollection = [
                { id: 1, postId: '100' },
            ];
            const targetCollection = [
                { id: 100, title: 'Post 1' },
            ];

            const result = checkReferentialIntegrity(relationship, sourceCollection, targetCollection);

            expect(result).toHaveLength(0);
        });

        it('should handle number to string comparison', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'comments',
                targetCollection: 'posts',
                sourceField: 'postId',
                targetField: 'id',
                type: 'many-to-one',
            };

            const sourceCollection = [
                { id: 1, postId: 100 },
            ];
            const targetCollection = [
                { id: '100', title: 'Post 1' },
            ];

            const result = checkReferentialIntegrity(relationship, sourceCollection, targetCollection);

            expect(result).toHaveLength(0);
        });
    });

    describe('getRelatedItems', () => {
        it('should return related items for one-to-many relationship', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'posts',
                targetCollection: 'comments',
                sourceField: 'id',
                targetField: 'postId',
                type: 'one-to-many',
            };

            const item = { id: 100, title: 'Post 1' };
            const targetCollection = [
                { id: 1, postId: 100, text: 'Comment 1' },
                { id: 2, postId: 100, text: 'Comment 2' },
                { id: 3, postId: 200, text: 'Comment 3' },
            ];

            const result = getRelatedItems(item, relationship, targetCollection);

            expect(result).toHaveLength(2);
            expect(result[0].text).toBe('Comment 1');
            expect(result[1].text).toBe('Comment 2');
        });

        it('should return empty array when no related items found', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'posts',
                targetCollection: 'comments',
                sourceField: 'id',
                targetField: 'postId',
                type: 'one-to-many',
            };

            const item = { id: 999, title: 'Post 999' };
            const targetCollection = [
                { id: 1, postId: 100, text: 'Comment 1' },
            ];

            const result = getRelatedItems(item, relationship, targetCollection);

            expect(result).toHaveLength(0);
        });

        it('should return empty array when source field is null', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'posts',
                targetCollection: 'comments',
                sourceField: 'id',
                targetField: 'postId',
                type: 'one-to-many',
            };

            const item = { id: null, title: 'Post' };
            const targetCollection = [
                { id: 1, postId: 100, text: 'Comment 1' },
            ];

            const result = getRelatedItems(item, relationship, targetCollection);

            expect(result).toHaveLength(0);
        });

        it('should return empty array when source field is undefined', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'posts',
                targetCollection: 'comments',
                sourceField: 'id',
                targetField: 'postId',
                type: 'one-to-many',
            };

            const item = { id: undefined, title: 'Post' };
            const targetCollection = [
                { id: 1, postId: 100, text: 'Comment 1' },
            ];

            const result = getRelatedItems(item, relationship, targetCollection);

            expect(result).toHaveLength(0);
        });
    });

    describe('getRelatedItem', () => {
        it('should return single item for one-to-one relationship', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'posts',
                targetCollection: 'authors',
                sourceField: 'authorId',
                targetField: 'id',
                type: 'one-to-one',
            };

            const item = { id: 100, title: 'Post 1', authorId: 1 };
            const targetCollection = [
                { id: 1, name: 'Author 1' },
            ];

            const result = getRelatedItem(item, relationship, targetCollection);

            expect(result).toBeDefined();
            expect(result?.name).toBe('Author 1');
        });

        it('should return first item for one-to-many relationship', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'posts',
                targetCollection: 'comments',
                sourceField: 'id',
                targetField: 'postId',
                type: 'one-to-many',
            };

            const item = { id: 100, title: 'Post 1' };
            const targetCollection = [
                { id: 1, postId: 100, text: 'Comment 1' },
                { id: 2, postId: 100, text: 'Comment 2' },
            ];

            const result = getRelatedItem(item, relationship, targetCollection);

            expect(result).toBeDefined();
            expect(result?.text).toBe('Comment 1');
        });

        it('should return undefined when no related item found', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'posts',
                targetCollection: 'authors',
                sourceField: 'authorId',
                targetField: 'id',
                type: 'one-to-one',
            };

            const item = { id: 100, title: 'Post 1', authorId: 999 };
            const targetCollection = [
                { id: 1, name: 'Author 1' },
            ];

            const result = getRelatedItem(item, relationship, targetCollection);

            expect(result).toBeUndefined();
        });

        it('should return undefined when source field is null', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'posts',
                targetCollection: 'authors',
                sourceField: 'authorId',
                targetField: 'id',
                type: 'one-to-one',
            };

            const item = { id: 100, title: 'Post 1', authorId: null };
            const targetCollection = [
                { id: 1, name: 'Author 1' },
            ];

            const result = getRelatedItem(item, relationship, targetCollection);

            expect(result).toBeUndefined();
        });
    });

    describe('getOneToManyRelations', () => {
        it('should return map of related collections', () => {
            const relationships: DataRelationship[] = [
                {
                    sourceCollection: 'posts',
                    targetCollection: 'comments',
                    sourceField: 'id',
                    targetField: 'postId',
                    type: 'one-to-many',
                },
                {
                    sourceCollection: 'posts',
                    targetCollection: 'tags',
                    sourceField: 'id',
                    targetField: 'postId',
                    type: 'one-to-many',
                },
            ];

            const item = { id: 100, title: 'Post 1' };
            const collections: Record<string, Record<string, unknown>[]> = {
                comments: [
                    { id: 1, postId: 100, text: 'Comment 1' },
                ],
                tags: [
                    { id: 1, postId: 100, name: 'Tag 1' },
                ],
            };

            const result = getOneToManyRelations(item, relationships, collections);

            expect(result.size).toBe(2);
            expect(result.get('comments')).toHaveLength(1);
            expect(result.get('tags')).toHaveLength(1);
        });

        it('should skip collections not found in map', () => {
            const relationships: DataRelationship[] = [
                {
                    sourceCollection: 'posts',
                    targetCollection: 'comments',
                    sourceField: 'id',
                    targetField: 'postId',
                    type: 'one-to-many',
                },
                {
                    sourceCollection: 'posts',
                    targetCollection: 'tags',
                    sourceField: 'id',
                    targetField: 'postId',
                    type: 'one-to-many',
                },
            ];

            const item = { id: 100, title: 'Post 1' };
            const collections: Record<string, Record<string, unknown>[]> = {
                comments: [
                    { id: 1, postId: 100, text: 'Comment 1' },
                ],
            };

            const result = getOneToManyRelations(item, relationships, collections);

            expect(result.size).toBe(1);
            expect(result.get('comments')).toHaveLength(1);
            expect(result.get('tags')).toBeUndefined();
        });

        it('should return empty map when no relationships', () => {
            const relationships: DataRelationship[] = [];
            const item = { id: 100, title: 'Post 1' };
            const collections: Record<string, Record<string, unknown>[]> = {};

            const result = getOneToManyRelations(item, relationships, collections);

            expect(result.size).toBe(0);
        });
    });

    describe('checkCircularDependencies', () => {
        it('should detect circular dependencies', () => {
            const relationships: DataRelationship[] = [
                {
                    sourceCollection: 'A',
                    targetCollection: 'B',
                    sourceField: 'id',
                    targetField: 'aId',
                    type: 'one-to-many',
                },
                {
                    sourceCollection: 'B',
                    targetCollection: 'C',
                    sourceField: 'id',
                    targetField: 'bId',
                    type: 'one-to-many',
                },
                {
                    sourceCollection: 'C',
                    targetCollection: 'A',
                    sourceField: 'id',
                    targetField: 'cId',
                    type: 'one-to-many',
                },
            ];

            const cycles = checkCircularDependencies(relationships);

            expect(cycles.length).toBeGreaterThan(0);
        });

        it('should return empty array when no circular dependencies', () => {
            const relationships: DataRelationship[] = [
                {
                    sourceCollection: 'A',
                    targetCollection: 'B',
                    sourceField: 'id',
                    targetField: 'aId',
                    type: 'one-to-many',
                },
                {
                    sourceCollection: 'B',
                    targetCollection: 'C',
                    sourceField: 'id',
                    targetField: 'bId',
                    type: 'one-to-many',
                },
            ];

            const cycles = checkCircularDependencies(relationships);

            expect(cycles).toHaveLength(0);
        });

        it('should detect self-referencing relationship', () => {
            const relationships: DataRelationship[] = [
                {
                    sourceCollection: 'users',
                    targetCollection: 'users',
                    sourceField: 'managerId',
                    targetField: 'id',
                    type: 'many-to-one',
                },
            ];

            const cycles = checkCircularDependencies(relationships);

            expect(cycles.length).toBeGreaterThan(0);
        });

        it('should handle empty relationships array', () => {
            const relationships: DataRelationship[] = [];

            const cycles = checkCircularDependencies(relationships);

            expect(cycles).toHaveLength(0);
        });
    });

    describe('getRelationshipGraph', () => {
        it('should build relationship graph', () => {
            const relationships: DataRelationship[] = [
                {
                    sourceCollection: 'posts',
                    targetCollection: 'comments',
                    sourceField: 'id',
                    targetField: 'postId',
                    type: 'one-to-many',
                },
                {
                    sourceCollection: 'posts',
                    targetCollection: 'tags',
                    sourceField: 'id',
                    targetField: 'postId',
                    type: 'one-to-many',
                },
            ];

            const graph = getRelationshipGraph(relationships);

            expect(graph.size).toBe(1);
            expect(graph.has('posts')).toBe(true);
            expect(graph.get('posts')).toHaveLength(2);
        });

        it('should handle multiple source collections', () => {
            const relationships: DataRelationship[] = [
                {
                    sourceCollection: 'posts',
                    targetCollection: 'comments',
                    sourceField: 'id',
                    targetField: 'postId',
                    type: 'one-to-many',
                },
                {
                    sourceCollection: 'users',
                    targetCollection: 'posts',
                    sourceField: 'id',
                    targetField: 'authorId',
                    type: 'one-to-many',
                },
            ];

            const graph = getRelationshipGraph(relationships);

            expect(graph.size).toBe(2);
            expect(graph.has('posts')).toBe(true);
            expect(graph.has('users')).toBe(true);
        });

        it('should return empty map for empty relationships', () => {
            const relationships: DataRelationship[] = [];

            const graph = getRelationshipGraph(relationships);

            expect(graph.size).toBe(0);
        });
    });

    describe('findRelationshipsByCollection', () => {
        const relationships: DataRelationship[] = [
            {
                sourceCollection: 'posts',
                targetCollection: 'comments',
                sourceField: 'id',
                targetField: 'postId',
                type: 'one-to-many',
            },
            {
                sourceCollection: 'users',
                targetCollection: 'posts',
                sourceField: 'id',
                targetField: 'authorId',
                type: 'one-to-many',
            },
            {
                sourceCollection: 'comments',
                targetCollection: 'users',
                sourceField: 'authorId',
                targetField: 'id',
                type: 'many-to-one',
            },
        ];

        it('should find relationships by source collection', () => {
            const result = findRelationshipsByCollection(relationships, 'posts', 'source');

            expect(result).toHaveLength(1);
            expect(result[0].sourceCollection).toBe('posts');
        });

        it('should find relationships by target collection', () => {
            const result = findRelationshipsByCollection(relationships, 'posts', 'target');

            expect(result).toHaveLength(1);
            expect(result[0].targetCollection).toBe('posts');
        });

        it('should find relationships by both directions', () => {
            const result = findRelationshipsByCollection(relationships, 'posts', 'both');

            expect(result).toHaveLength(2);
        });

        it('should use "both" as default direction', () => {
            const result = findRelationshipsByCollection(relationships, 'posts');

            expect(result).toHaveLength(2);
        });

        it('should return empty array when no relationships found', () => {
            const result = findRelationshipsByCollection(relationships, 'nonexistent', 'both');

            expect(result).toHaveLength(0);
        });
    });

    describe('cascadeDelete', () => {
        it('should identify items to delete on cascade', () => {
            const relationships: DataRelationship[] = [
                {
                    sourceCollection: 'posts',
                    targetCollection: 'comments',
                    sourceField: 'id',
                    targetField: 'postId',
                    type: 'one-to-many',
                },
                {
                    sourceCollection: 'posts',
                    targetCollection: 'tags',
                    sourceField: 'id',
                    targetField: 'postId',
                    type: 'one-to-many',
                },
            ];

            const item = { id: 100, title: 'Post 1' };
            const collections: Record<string, Record<string, unknown>[]> = {
                comments: [
                    { id: 1, postId: 100, text: 'Comment 1' },
                    { id: 2, postId: 100, text: 'Comment 2' },
                ],
                tags: [
                    { id: 1, postId: 100, name: 'Tag 1' },
                ],
            };

            const result = cascadeDelete(item, relationships, collections);

            expect(result.deletedItems.size).toBe(2);
            expect(result.deletedItems.get('comments')).toHaveLength(2);
            expect(result.deletedItems.get('tags')).toHaveLength(1);
            expect(result.errors).toHaveLength(0);
        });

        it('should skip relationships that do not match item', () => {
            const relationships: DataRelationship[] = [
                {
                    sourceCollection: 'posts',
                    targetCollection: 'comments',
                    sourceField: 'id',
                    targetField: 'postId',
                    type: 'one-to-many',
                },
                {
                    sourceCollection: 'posts',
                    targetCollection: 'tags',
                    sourceField: 'id',
                    targetField: 'postId',
                    type: 'one-to-many',
                },
            ];

            const item = { id: 200, title: 'Post 200' };
            const collections: Record<string, Record<string, unknown>[]> = {
                comments: [
                    { id: 1, postId: 100, text: 'Comment 1' },
                ],
                tags: [
                    { id: 1, postId: 100, name: 'Tag 1' },
                ],
            };

            const result = cascadeDelete(item, relationships, collections);

            expect(result.deletedItems.size).toBe(0);
            expect(result.errors).toHaveLength(0);
        });

        it('should return errors for missing collections', () => {
            const relationships: DataRelationship[] = [
                {
                    sourceCollection: 'posts',
                    targetCollection: 'comments',
                    sourceField: 'id',
                    targetField: 'postId',
                    type: 'one-to-many',
                },
            ];

            const item = { id: 100, title: 'Post 1' };
            const collections: Record<string, Record<string, unknown>[]> = {};

            const result = cascadeDelete(item, relationships, collections);

            expect(result.deletedItems.size).toBe(0);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toContain('not found');
        });

        it('should handle item with no related items', () => {
            const relationships: DataRelationship[] = [
                {
                    sourceCollection: 'posts',
                    targetCollection: 'comments',
                    sourceField: 'id',
                    targetField: 'postId',
                    type: 'one-to-many',
                },
            ];

            const item = { id: 999, title: 'Post 999' };
            const collections: Record<string, Record<string, unknown>[]> = {
                comments: [
                    { id: 1, postId: 100, text: 'Comment 1' },
                ],
            };

            const result = cascadeDelete(item, relationships, collections);

            expect(result.deletedItems.size).toBe(0);
            expect(result.errors).toHaveLength(0);
        });
    });

    describe('validateForeignKey', () => {
        it('should validate valid foreign key', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'comments',
                targetCollection: 'posts',
                sourceField: 'postId',
                targetField: 'id',
                type: 'many-to-one',
            };

            const item = { id: 1, postId: 100 };
            const targetCollection = [
                { id: 100, title: 'Post 1' },
            ];

            const result = validateForeignKey(item, relationship, targetCollection);

            expect(result.isValid).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it('should return error for missing foreign key when required', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'comments',
                targetCollection: 'posts',
                sourceField: 'postId',
                targetField: 'id',
                type: 'many-to-one',
                optional: false,
            };

            const item = { id: 1, postId: null };
            const targetCollection = [
                { id: 100, title: 'Post 1' },
            ];

            const result = validateForeignKey(item, relationship, targetCollection);

            expect(result.isValid).toBe(false);
            expect(result.error).toContain('missing');
        });

        it('should pass for null foreign key when optional', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'comments',
                targetCollection: 'posts',
                sourceField: 'postId',
                targetField: 'id',
                type: 'many-to-one',
                optional: true,
            };

            const item = { id: 1, postId: null };
            const targetCollection = [
                { id: 100, title: 'Post 1' },
            ];

            const result = validateForeignKey(item, relationship, targetCollection);

            expect(result.isValid).toBe(true);
        });

        it('should return error for foreign key not found in target', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'comments',
                targetCollection: 'posts',
                sourceField: 'postId',
                targetField: 'id',
                type: 'many-to-one',
            };

            const item = { id: 1, postId: 999 };
            const targetCollection = [
                { id: 100, title: 'Post 1' },
            ];

            const result = validateForeignKey(item, relationship, targetCollection);

            expect(result.isValid).toBe(false);
            expect(result.error).toContain('not found');
        });

        it('should handle string to number comparison', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'comments',
                targetCollection: 'posts',
                sourceField: 'postId',
                targetField: 'id',
                type: 'many-to-one',
            };

            const item = { id: 1, postId: '100' };
            const targetCollection = [
                { id: 100, title: 'Post 1' },
            ];

            const result = validateForeignKey(item, relationship, targetCollection);

            expect(result.isValid).toBe(true);
        });
    });

    describe('checkSelfReferentialCircularDependencies', () => {
        it('should detect circular dependency in self-referential relationship', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'comments',
                targetCollection: 'comments',
                sourceField: 'parentId',
                targetField: 'id',
                type: 'many-to-one',
                optional: true,
            };

            const collection = [
                { id: 1, parentId: 2 },
                { id: 2, parentId: 1 },
                { id: 3, parentId: null },
            ];

            const result = checkSelfReferentialCircularDependencies(relationship, collection);

            expect(result.hasCycles).toBe(true);
            expect(result.cycles.length).toBeGreaterThan(0);
            expect(result.cycles[0].length).toBe(3);
            expect(result.cycles[0][0]).toEqual(result.cycles[0][2]);
        });

        it('should detect multiple circular dependencies', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'comments',
                targetCollection: 'comments',
                sourceField: 'parentId',
                targetField: 'id',
                type: 'many-to-one',
            };

            const collection = [
                { id: 1, parentId: 2 },
                { id: 2, parentId: 1 },
                { id: 3, parentId: 4 },
                { id: 4, parentId: 3 },
            ];

            const result = checkSelfReferentialCircularDependencies(relationship, collection);

            expect(result.hasCycles).toBe(true);
            expect(result.cycles.length).toBeGreaterThan(0);
        });

        it('should return no cycles when no circular dependencies exist', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'comments',
                targetCollection: 'comments',
                sourceField: 'parentId',
                targetField: 'id',
                type: 'many-to-one',
            };

            const collection = [
                { id: 1, parentId: null },
                { id: 2, parentId: 1 },
                { id: 3, parentId: 1 },
                { id: 4, parentId: 2 },
            ];

            const result = checkSelfReferentialCircularDependencies(relationship, collection);

            expect(result.hasCycles).toBe(false);
            expect(result.cycles).toHaveLength(0);
        });

        it('should handle null parent values', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'comments',
                targetCollection: 'comments',
                sourceField: 'parentId',
                targetField: 'id',
                type: 'many-to-one',
            };

            const collection = [
                { id: 1, parentId: null },
                { id: 2, parentId: null },
                { id: 3, parentId: null },
            ];

            const result = checkSelfReferentialCircularDependencies(relationship, collection);

            expect(result.hasCycles).toBe(false);
            expect(result.cycles).toHaveLength(0);
        });

        it('should handle undefined parent values', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'comments',
                targetCollection: 'comments',
                sourceField: 'parentId',
                targetField: 'id',
                type: 'many-to-one',
            };

            const collection = [
                { id: 1, parentId: undefined },
                { id: 2, parentId: undefined },
            ];

            const result = checkSelfReferentialCircularDependencies(relationship, collection);

            expect(result.hasCycles).toBe(false);
            expect(result.cycles).toHaveLength(0);
        });

        it('should return empty cycles for non-self-referential relationship', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'comments',
                targetCollection: 'posts',
                sourceField: 'postId',
                targetField: 'id',
                type: 'many-to-one',
            };

            const collection = [
                { id: 1, postId: 100 },
                { id: 2, postId: 100 },
            ];

            const result = checkSelfReferentialCircularDependencies(relationship, collection);

            expect(result.hasCycles).toBe(false);
            expect(result.cycles).toHaveLength(0);
        });

        it('should handle deep nesting without cycles', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'comments',
                targetCollection: 'comments',
                sourceField: 'parentId',
                targetField: 'id',
                type: 'many-to-one',
            };

            const collection = [
                { id: 1, parentId: null },
                { id: 2, parentId: 1 },
                { id: 3, parentId: 2 },
                { id: 4, parentId: 3 },
                { id: 5, parentId: 4 },
            ];

            const result = checkSelfReferentialCircularDependencies(relationship, collection);

            expect(result.hasCycles).toBe(false);
            expect(result.cycles).toHaveLength(0);
        });

        it('should detect complex cycle', () => {
            const relationship: DataRelationship = {
                sourceCollection: 'comments',
                targetCollection: 'comments',
                sourceField: 'parentId',
                targetField: 'id',
                type: 'many-to-one',
            };

            const collection = [
                { id: 1, parentId: 4 },
                { id: 2, parentId: 1 },
                { id: 3, parentId: 2 },
                { id: 4, parentId: 3 },
            ];

            const result = checkSelfReferentialCircularDependencies(relationship, collection);

            expect(result.hasCycles).toBe(true);
            expect(result.cycles.length).toBeGreaterThan(0);
            expect(result.cycles[0].length).toBeGreaterThan(0);
        });
    });

    describe('validateRelationships with self-referential circular dependencies', () => {
        it('should detect circular dependency in self-referential relationship', () => {
            const relationships: DataRelationship[] = [
                {
                    sourceCollection: 'comments',
                    targetCollection: 'comments',
                    sourceField: 'parentId',
                    targetField: 'id',
                    type: 'many-to-one',
                    optional: true,
                },
            ];

            const collections: Record<string, unknown[]> = {
                comments: [
                    { id: 1, parentId: 2 },
                    { id: 2, parentId: 1 },
                ],
            };

            const result = validateRelationships(relationships, collections);

            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].error).toContain('Circular dependency');
        });

        it('should pass validation with no circular dependencies', () => {
            const relationships: DataRelationship[] = [
                {
                    sourceCollection: 'comments',
                    targetCollection: 'comments',
                    sourceField: 'parentId',
                    targetField: 'id',
                    type: 'many-to-one',
                    optional: true,
                },
            ];

            const collections: Record<string, unknown[]> = {
                comments: [
                    { id: 1, parentId: null },
                    { id: 2, parentId: 1 },
                    { id: 3, parentId: 1 },
                ],
            };

            const result = validateRelationships(relationships, collections);

            if (!result.isValid) {
                console.log('Errors:', JSON.stringify(result.errors, null, 2));
            }
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
    });
});
