export interface KeywordDensity {
    keyword: string;
    count: number;
    density: number;
}

export interface SEOSuggestions {
    title: {
        isValid: boolean;
        currentLength: number;
        optimalMin: number;
        optimalMax: number;
        message: string;
    };
    description: {
        isValid: boolean;
        currentLength: number;
        optimalMin: number;
        optimalMax: number;
        message: string;
    };
    keywords: KeywordDensity[];
    headings: {
        h1: number;
        h2: number;
        h3: number;
        hasMultipleH1: boolean;
        message: string;
    };
}

const WORD_REGEX = /\b\w+\b/g;

export function analyzeKeywordDensity(text: string, primaryKeyword?: string, topN: number = 5): KeywordDensity[] {
    if (!text || text.trim().length === 0) {
        return [];
    }

    const words = text.toLowerCase().match(WORD_REGEX) || [];
    const stopWords = new Set([
        'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
        'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
        'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
        'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'there', 'here'
    ]);

    const wordFrequency = new Map<string, number>();

    for (const word of words) {
        if (word.length > 2 && !stopWords.has(word)) {
            wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
        }
    }

    const totalWords = words.length;
    const keywordDensities: KeywordDensity[] = [];

    for (const [keyword, count] of wordFrequency) {
        const density = (count / totalWords) * 100;
        keywordDensities.push({ keyword, count, density });
    }

    keywordDensities.sort((a, b) => b.density - a.density);

    if (primaryKeyword) {
        const primaryDensity = keywordDensities.find(k => k.keyword.toLowerCase() === primaryKeyword.toLowerCase());
        if (primaryDensity) {
            return [primaryDensity, ...keywordDensities.filter(k => k !== primaryDensity).slice(0, topN - 1)];
        }
    }

    return keywordDensities.slice(0, topN);
}

export function checkTitleLength(title: string, optimalMin: number = 50, optimalMax: number = 60): {
    isValid: boolean;
    currentLength: number;
    optimalMin: number;
    optimalMax: number;
    message: string;
} {
    const length = title.length;
    const isValid = length >= optimalMin && length <= optimalMax;

    let message: string;
    if (isValid) {
        message = `Title length (${length} chars) is optimal for SEO.`;
    } else if (length < optimalMin) {
        message = `Title is too short (${length} chars). Consider adding 1-2 more words.`;
    } else {
        message = `Title is too long (${length} chars). Consider shortening to ${optimalMax} chars.`;
    }

    return {
        isValid,
        currentLength: length,
        optimalMin,
        optimalMax,
        message
    };
}

export function checkMetaDescriptionLength(description: string, optimalMin: number = 150, optimalMax: number = 160): {
    isValid: boolean;
    currentLength: number;
    optimalMin: number;
    optimalMax: number;
    message: string;
} {
    const length = description.length;
    const isValid = length >= optimalMin && length <= optimalMax;

    let message: string;
    if (isValid) {
        message = `Meta description length (${length} chars) is optimal for SEO.`;
    } else if (length < optimalMin) {
        message = `Meta description is too short (${length} chars). Consider adding more detail.`;
    } else {
        message = `Meta description is too long (${length} chars). Consider shortening to ${optimalMax} chars.`;
    }

    return {
        isValid,
        currentLength: length,
        optimalMin,
        optimalMax,
        message
    };
}

export function detectHeadings(text: string): {
    h1: number;
    h2: number;
    h3: number;
    hasMultipleH1: boolean;
    message: string;
} {
    const h1Regex = /<h1[^>]*>/gi;
    const h2Regex = /<h2[^>]*>/gi;
    const h3Regex = /<h3[^>]*>/gi;

    const h1Count = (text.match(h1Regex) || []).length;
    const h2Count = (text.match(h2Regex) || []).length;
    const h3Count = (text.match(h3Regex) || []).length;

    const hasMultipleH1 = h1Count > 1;

    let message: string;
    if (h1Count === 0) {
        message = 'Missing H1 heading. Add one H1 to improve SEO.';
    } else if (hasMultipleH1) {
        message = 'Multiple H1 headings found. Use only one H1 per page.';
    } else {
        message = `Heading structure is good: ${h1Count} H1, ${h2Count} H2, ${h3Count} H3.`;
    }

    return {
        h1: h1Count,
        h2: h2Count,
        h3: h3Count,
        hasMultipleH1,
        message
    };
}

export function generateSEOSuggestions(
    title: string,
    description: string,
    content: string,
    primaryKeyword?: string
): SEOSuggestions {
    return {
        title: checkTitleLength(title),
        description: checkMetaDescriptionLength(description),
        keywords: analyzeKeywordDensity(content, primaryKeyword),
        headings: detectHeadings(content)
    };
}
