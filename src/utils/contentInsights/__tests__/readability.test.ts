import {
    calculateFleschReadingEase,
    calculateGunningFogIndex,
    getReadabilityLevel,
    getReadabilityScore,
    estimateReadingTime
} from '../readability';

describe('Readability Analysis', () => {
    describe('calculateFleschReadingEase', () => {
        it('should calculate high score for simple text', () => {
            const simpleText = 'The cat sat on the mat. The dog ran fast. The bird flew high.';
            const score = calculateFleschReadingEase(simpleText);
            expect(score).toBeGreaterThan(80);
        });

        it('should calculate lower score for complex text', () => {
            const complexText = 'The comprehensive investigation demonstrated that the implementation of sophisticated methodologies facilitated significant enhancements in operational efficiency.';
            const score = calculateFleschReadingEase(complexText);
            expect(score).toBeLessThan(50);
        });

        it('should return 0 for empty text', () => {
            const score = calculateFleschReadingEase('');
            expect(score).toBe(0);
        });

        it('should return 0 for whitespace only', () => {
            const score = calculateFleschReadingEase('   \n\t  ');
            expect(score).toBe(0);
        });

        it('should handle single sentence', () => {
            const text = 'This is a simple test.';
            const score = calculateFleschReadingEase(text);
            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThanOrEqual(100);
        });

        it('should handle multiple sentences', () => {
            const text = 'This is the first sentence. This is the second sentence. This is the third sentence.';
            const score = calculateFleschReadingEase(text);
            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThanOrEqual(100);
        });

        it('should handle text with punctuation', () => {
            const text = 'Hello! How are you? I am fine. Thanks for asking.';
            const score = calculateFleschReadingEase(text);
            expect(score).toBeGreaterThan(0);
            expect(score).toBeLessThanOrEqual(100);
        });

        it('should cap score at maximum 100', () => {
            const verySimpleText = 'The cat sat. The dog ran.';
            const score = calculateFleschReadingEase(verySimpleText);
            expect(score).toBeLessThanOrEqual(100);
        });

        it('should not return negative score', () => {
            const extremelyComplexText = 'Implementation comprehensive investigation demonstrated sophisticated methodologies operational efficiency significant enhancements.';
            const score = calculateFleschReadingEase(extremelyComplexText);
            expect(score).toBeGreaterThanOrEqual(0);
        });
    });

    describe('calculateGunningFogIndex', () => {
        it('should calculate low index for simple text', () => {
            const simpleText = 'The cat sat on the mat. The dog ran fast.';
            const index = calculateGunningFogIndex(simpleText);
            expect(index).toBeLessThan(10);
        });

        it('should calculate higher index for complex text', () => {
            const complexText = 'The comprehensive investigation demonstrated that the implementation of sophisticated methodologies facilitated significant enhancements in operational efficiency.';
            const index = calculateGunningFogIndex(complexText);
            expect(index).toBeGreaterThan(15);
        });

        it('should return 0 for empty text', () => {
            const index = calculateGunningFogIndex('');
            expect(index).toBe(0);
        });

        it('should handle single sentence', () => {
            const text = 'This is a test sentence.';
            const index = calculateGunningFogIndex(text);
            expect(index).toBeGreaterThanOrEqual(0);
        });

        it('should identify complex words (3+ syllables)', () => {
            const textWithComplexWords = 'The implementation demonstrated significant enhancements.';
            const index = calculateGunningFogIndex(textWithComplexWords);
            expect(index).toBeGreaterThan(0);
        });
    });

    describe('getReadabilityLevel', () => {
        it('should return Easy for score >= 90', () => {
            expect(getReadabilityLevel(95)).toBe('Easy');
            expect(getReadabilityLevel(90)).toBe('Easy');
        });

        it('should return Medium for score >= 60 and < 90', () => {
            expect(getReadabilityLevel(75)).toBe('Medium');
            expect(getReadabilityLevel(60)).toBe('Medium');
        });

        it('should return Hard for score >= 30 and < 60', () => {
            expect(getReadabilityLevel(45)).toBe('Hard');
            expect(getReadabilityLevel(30)).toBe('Hard');
        });

        it('should return Very Hard for score < 30', () => {
            expect(getReadabilityLevel(25)).toBe('Very Hard');
            expect(getReadabilityLevel(0)).toBe('Very Hard');
        });
    });

    describe('getReadabilityScore', () => {
        it('should return complete score object', () => {
            const score = getReadabilityScore(85);
            expect(score).toHaveProperty('score');
            expect(score).toHaveProperty('level');
            expect(score).toHaveProperty('interpretation');
        });

        it('should provide interpretation for Easy level', () => {
            const score = getReadabilityScore(95);
            expect(score.level).toBe('Easy');
            expect(score.interpretation).toContain('Very easy to read');
        });

        it('should provide interpretation for Medium level', () => {
            const score = getReadabilityScore(75);
            expect(score.level).toBe('Medium');
            expect(score.interpretation).toContain('Plain English');
        });

        it('should provide interpretation for Hard level', () => {
            const score = getReadabilityScore(45);
            expect(score.level).toBe('Hard');
            expect(score.interpretation).toContain('Fairly difficult');
        });

        it('should provide interpretation for Very Hard level', () => {
            const score = getReadabilityScore(25);
            expect(score.level).toBe('Very Hard');
            expect(score.interpretation).toContain('Difficult to read');
        });
    });

    describe('estimateReadingTime', () => {
        it('should calculate reading time for short text', () => {
            const shortText = 'Hello world.';
            const time = estimateReadingTime(shortText);
            expect(time.minutes).toBe(0);
            expect(time.seconds).toBeGreaterThan(0);
        });

        it('should calculate reading time for medium text', () => {
            const mediumText = 'Hello '.repeat(100);
            const time = estimateReadingTime(mediumText);
            expect(time.minutes).toBe(0);
            expect(time.seconds).toBe(30);
        });

        it('should calculate reading time for long text', () => {
            const longText = 'Hello '.repeat(500);
            const time = estimateReadingTime(longText);
            expect(time.minutes).toBeGreaterThan(1);
        });

        it('should return 0 for empty text', () => {
            const time = estimateReadingTime('');
            expect(time.minutes).toBe(0);
            expect(time.seconds).toBe(0);
            expect(time.display).toBe('0 min read');
        });

        it('should format display string correctly for seconds', () => {
            const shortText = 'Hello world.';
            const time = estimateReadingTime(shortText);
            expect(time.display).toContain('sec');
        });

        it('should format display string correctly for minutes', () => {
            const mediumText = 'Hello '.repeat(400);
            const time = estimateReadingTime(mediumText);
            expect(time.display).toContain('min');
        });

        it('should format display string correctly for minutes and seconds', () => {
            const text = 'Hello '.repeat(300);
            const time = estimateReadingTime(text);
            expect(time.display).toMatch(/min.*sec/);
        });

        it('should use custom WPM when provided', () => {
            const text = 'Hello '.repeat(200);
            const defaultTime = estimateReadingTime(text, 200);
            const fasterTime = estimateReadingTime(text, 400);
            expect(fasterTime.minutes).toBe(0);
            expect(fasterTime.seconds).toBe(30);
            expect(defaultTime.minutes).toBe(1);
            expect(defaultTime.seconds).toBe(0);
        });
    });
});
