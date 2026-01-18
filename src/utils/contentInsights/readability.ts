const WORD_REGEX = /\b\w+\b/g;
const SENTENCE_REGEX = /[.!?]+/g;
const SYLLABLE_REGEX = /[^aeiouy]*[aeiouy]+(?:e?|le)?[^aeiouy]*/gi;

export interface ReadabilityScore {
    score: number;
    level: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
    interpretation: string;
}

export interface ReadingTime {
    minutes: number;
    seconds: number;
    display: string;
}

export function calculateFleschReadingEase(text: string): number {
    if (!text || text.trim().length === 0) {
        return 0;
    }

    const words = (text.match(WORD_REGEX) || []).length;
    const sentences = (text.match(SENTENCE_REGEX) || []).length;

    if (words === 0 || sentences === 0) {
        return 0;
    }

    const totalSyllables = text.match(SYLLABLE_REGEX)?.reduce((acc, word) => {
        return acc + Math.max(1, countSyllables(word));
    }, 0) || words;

    const avgSentenceLength = words / sentences;
    const avgSyllablesPerWord = totalSyllables / words;

    const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);

    return Math.max(0, Math.min(100, fleschScore));
}

export function calculateGunningFogIndex(text: string): number {
    if (!text || text.trim().length === 0) {
        return 0;
    }

    const words = (text.match(WORD_REGEX) || []).length;
    const sentences = (text.match(SENTENCE_REGEX) || []).length;

    if (words === 0 || sentences === 0) {
        return 0;
    }

    const complexWords = text.split(/\s+/).filter(word => {
        const syllableCount = countSyllables(word);
        return syllableCount >= 3;
    }).length;

    const avgSentenceLength = words / sentences;
    const complexWordPercentage = (complexWords / words) * 100;

    const fogIndex = 0.4 * (avgSentenceLength + complexWordPercentage);

    return Math.max(0, fogIndex);
}

export function getReadabilityLevel(score: number): 'Easy' | 'Medium' | 'Hard' | 'Very Hard' {
    if (score >= 90) {
        return 'Easy';
    } else if (score >= 60) {
        return 'Medium';
    } else if (score >= 30) {
        return 'Hard';
    } else {
        return 'Very Hard';
    }
}

export function getReadabilityScore(score: number): ReadabilityScore {
    const level = getReadabilityLevel(score);
    
    let interpretation: string;
    switch (level) {
        case 'Easy':
            interpretation = 'Very easy to read. Easily understood by an average 11-year-old student.';
            break;
        case 'Medium':
            interpretation = 'Plain English. Easily understood by 13-15 year olds.';
            break;
        case 'Hard':
            interpretation = 'Fairly difficult to read. Best understood by college graduates.';
            break;
        case 'Very Hard':
            interpretation = 'Difficult to read. Best understood by university graduates.';
            break;
    }

    return {
        score,
        level,
        interpretation
    };
}

export function estimateReadingTime(text: string, wpm: number = 200): ReadingTime {
    if (!text || text.trim().length === 0) {
        return {
            minutes: 0,
            seconds: 0,
            display: '0 min read'
        };
    }

    const words = (text.match(WORD_REGEX) || []).length;
    const totalSeconds = Math.ceil((words / wpm) * 60);

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const display = minutes > 0
        ? seconds > 0
            ? `${minutes} min ${seconds} sec read`
            : `${minutes} min read`
        : `${seconds} sec read`;

    return {
        minutes,
        seconds,
        display
    };
}

function countSyllables(word: string): number {
    if (word.length <= 3) {
        return 1;
    }

    const cleanedWord = word.toLowerCase()
        .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
        .replace(/^y/, '');

    const syllableCount = cleanedWord.match(/[aeiouy]{1,2}/g)?.length || 0;

    return Math.max(1, syllableCount);
}
