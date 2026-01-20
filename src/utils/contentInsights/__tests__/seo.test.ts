import {
    analyzeKeywordDensity,
    checkTitleLength,
    checkMetaDescriptionLength,
    detectHeadings,
    generateSEOSuggestions
} from '../seo';

describe('SEO Analysis', () => {
    describe('analyzeKeywordDensity', () => {
        it('should return empty array for empty text', () => {
            const result = analyzeKeywordDensity('');
            expect(result).toEqual([]);
        });

        it('should calculate keyword density correctly', () => {
            const text = 'The quick brown fox jumps over the lazy dog. The dog is sleeping.';
            const result = analyzeKeywordDensity(text);
            expect(result.length).toBeGreaterThan(0);
            
            const dogKeyword = result.find(k => k.keyword === 'dog');
            expect(dogKeyword).toBeDefined();
            expect(dogKeyword!.count).toBe(2);
            expect(dogKeyword!.density).toBeGreaterThan(0);
        });

        it('should filter out stop words', () => {
            const text = 'The cat and the dog are on the mat with the dog.';
            const result = analyzeKeywordDensity(text);
            const theKeyword = result.find(k => k.keyword === 'the');
            expect(theKeyword).toBeUndefined();
        });

        it('should filter short words (<= 2 chars)', () => {
            const text = 'The cat is on the mat.';
            const result = analyzeKeywordDensity(text);
            const shortWord = result.find(k => k.keyword === 'is' || k.keyword === 'on');
            expect(shortWord).toBeUndefined();
        });

        it('should return top N keywords by default', () => {
            const text = 'apple banana cherry apple banana apple cherry banana apple cherry apple banana.';
            const result = analyzeKeywordDensity(text, undefined, 3);
            expect(result.length).toBeLessThanOrEqual(3);
        });

        it('should prioritize primary keyword if provided', () => {
            const text = 'React is awesome. React has components. React is fast. Vue is also good.';
            const result = analyzeKeywordDensity(text, 'react', 3);
            expect(result[0].keyword).toBe('react');
        });

        it('should calculate density as percentage', () => {
            const text = 'cat dog cat dog cat dog cat dog cat dog';
            const result = analyzeKeywordDensity(text);
            const catKeyword = result.find(k => k.keyword === 'cat');
            const dogKeyword = result.find(k => k.keyword === 'dog');
            
            expect(catKeyword!.density).toBeGreaterThan(0);
            expect(dogKeyword!.density).toBeGreaterThan(0);
        });

        it('should handle case insensitivity', () => {
            const text = 'React REACT react ReAcT';
            const result = analyzeKeywordDensity(text);
            const reactKeyword = result.find(k => k.keyword.toLowerCase() === 'react');
            expect(reactKeyword!.count).toBe(4);
        });
    });

    describe('checkTitleLength', () => {
        it('should return valid for optimal length', () => {
            const title = 'A Good Title with Exactly Fifty-Five Characters Here';
            const result = checkTitleLength(title);
            expect(result.isValid).toBe(true);
            expect(result.currentLength).toBeGreaterThan(49);
            expect(result.currentLength).toBeLessThan(61);
            expect(result.message).toContain('optimal');
        });

        it('should return invalid for short title', () => {
            const title = 'Short';
            const result = checkTitleLength(title);
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('too short');
        });

        it('should return invalid for long title', () => {
            const title = 'This is a very long title that exceeds the recommended sixty character limit for optimal SEO performance';
            const result = checkTitleLength(title);
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('too long');
        });

        it('should use custom optimal lengths', () => {
            const title = 'Good Title';
            const result = checkTitleLength(title, 10, 20);
            expect(result.optimalMin).toBe(10);
            expect(result.optimalMax).toBe(20);
        });

        it('should handle empty title', () => {
            const result = checkTitleLength('');
            expect(result.isValid).toBe(false);
            expect(result.currentLength).toBe(0);
            expect(result.message).toContain('too short');
        });
    });

    describe('checkMetaDescriptionLength', () => {
        it('should return valid for optimal length', () => {
            const description = 'A'.repeat(155);
            const result = checkMetaDescriptionLength(description);
            expect(result.isValid).toBe(true);
            expect(result.currentLength).toBe(155);
            expect(result.message).toContain('optimal');
        });

        it('should return invalid for short description', () => {
            const description = 'Short';
            const result = checkMetaDescriptionLength(description);
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('too short');
        });

        it('should return invalid for long description', () => {
            const description = 'This is a very long meta description that exceeds the recommended one hundred and sixty character limit for optimal SEO performance on search engines and social media platforms.';
            const result = checkMetaDescriptionLength(description);
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('too long');
        });

        it('should use custom optimal lengths', () => {
            const description = 'Good description length';
            const result = checkMetaDescriptionLength(description, 20, 30);
            expect(result.optimalMin).toBe(20);
            expect(result.optimalMax).toBe(30);
        });

        it('should handle empty description', () => {
            const result = checkMetaDescriptionLength('');
            expect(result.isValid).toBe(false);
            expect(result.currentLength).toBe(0);
            expect(result.message).toContain('too short');
        });
    });

    describe('detectHeadings', () => {
        it('should count H1 headings correctly', () => {
            const content = '<h1>First H1</h1><h1>Second H1</h1>';
            const result = detectHeadings(content);
            expect(result.h1).toBe(2);
            expect(result.hasMultipleH1).toBe(true);
            expect(result.message).toContain('Multiple H1');
        });

        it('should count H2 headings correctly', () => {
            const content = '<h2>First H2</h2><h2>Second H2</h2><h2>Third H2</h2>';
            const result = detectHeadings(content);
            expect(result.h2).toBe(3);
        });

        it('should count H3 headings correctly', () => {
            const content = '<h3>First H3</h3><h3>Second H3</h3>';
            const result = detectHeadings(content);
            expect(result.h3).toBe(2);
        });

        it('should detect missing H1', () => {
            const content = '<h2>Section</h2><p>Content</p>';
            const result = detectHeadings(content);
            expect(result.h1).toBe(0);
            expect(result.hasMultipleH1).toBe(false);
            expect(result.message).toContain('Missing H1');
        });

        it('should detect multiple H1 as issue', () => {
            const content = '<h1>Title</h1><h1>Subtitle</h1>';
            const result = detectHeadings(content);
            expect(result.h1).toBe(2);
            expect(result.hasMultipleH1).toBe(true);
            expect(result.message).toContain('Multiple H1');
        });

        it('should return good message for valid structure', () => {
            const content = '<h1>Main Title</h1><h2>Section 1</h2><h2>Section 2</h2><h3>Subsection</h3>';
            const result = detectHeadings(content);
            expect(result.h1).toBe(1);
            expect(result.hasMultipleH1).toBe(false);
            expect(result.message).toContain('good');
        });

        it('should handle content without headings', () => {
            const content = '<p>Just paragraph content.</p>';
            const result = detectHeadings(content);
            expect(result.h1).toBe(0);
            expect(result.h2).toBe(0);
            expect(result.h3).toBe(0);
            expect(result.message).toContain('Missing H1');
        });

        it('should be case insensitive for heading tags', () => {
            const content = '<H1>Title</H1>';
            const result = detectHeadings(content);
            expect(result.h1).toBe(1);
        });
    });

    describe('generateSEOSuggestions', () => {
        it('should return complete SEO suggestions object', () => {
            const result = generateSEOSuggestions(
                'Title',
                'Description',
                'Content text goes here.'
            );
            
            expect(result).toHaveProperty('title');
            expect(result).toHaveProperty('description');
            expect(result).toHaveProperty('keywords');
            expect(result).toHaveProperty('headings');
        });

        it('should analyze title length', () => {
            const title = 'Test Title';
            const result = generateSEOSuggestions(title, 'Description', 'Content');
            expect(result.title.currentLength).toBe(title.length);
            expect(result.title.message).toBeDefined();
        });

        it('should analyze description length', () => {
            const description = 'Test Description';
            const result = generateSEOSuggestions('Title', description, 'Content');
            expect(result.description.currentLength).toBe(description.length);
            expect(result.description.message).toBeDefined();
        });

        it('should analyze keyword density', () => {
            const content = 'React is awesome. React has components.';
            const result = generateSEOSuggestions('Title', 'Description', content);
            expect(result.keywords.length).toBeGreaterThan(0);
        });

        it('should use primary keyword if provided', () => {
            const content = 'React is awesome. Vue is also good.';
            const result = generateSEOSuggestions('Title', 'Description', content, 'react');
            expect(result.keywords[0].keyword).toBe('react');
        });

        it('should detect headings in content', () => {
            const content = '<h1>Main</h1><h2>Section</h2>';
            const result = generateSEOSuggestions('Title', 'Description', content);
            expect(result.headings.h1).toBe(1);
            expect(result.headings.h2).toBe(1);
        });

        it('should handle empty content', () => {
            const result = generateSEOSuggestions('', '', '');
            expect(result.keywords).toEqual([]);
            expect(result.headings.h1).toBe(0);
            expect(result.headings.h2).toBe(0);
            expect(result.headings.h3).toBe(0);
        });
    });
});
