const WORD_REGEX = /\b\w+\b/g;
const SENTENCE_REGEX = /[.!?]+/g;
const PARAGRAPH_REGEX = /\n\n+/g;
const PASSIVE_VOICE_REGEX = /\b(?:was|were|is|are|been|being)\s+\w*ed?\b/gi;
const LONG_SENTENCE_THRESHOLD = 20;

export interface ContentStructure {
    totalWords: number;
    totalSentences: number;
    totalParagraphs: number;
    avgWordsPerSentence: number;
    avgWordsPerParagraph: number;
    sentenceVariety: 'Good' | 'Poor';
    paragraphVariety: 'Good' | 'Poor';
}

export interface ContentIssue {
    type: 'long_sentence' | 'passive_voice' | 'short_paragraph' | 'long_paragraph';
    text: string;
    index: number;
    suggestion: string;
}

export interface QualityScore {
    overall: number;
    structure: number;
    clarity: number;
    engagement: number;
    grade: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

export interface QualityRecommendations {
    score: QualityScore;
    structure: ContentStructure;
    issues: ContentIssue[];
    recommendations: string[];
}

export function analyzeContentStructure(text: string): ContentStructure {
    if (!text || text.trim().length === 0) {
        return {
            totalWords: 0,
            totalSentences: 0,
            totalParagraphs: 0,
            avgWordsPerSentence: 0,
            avgWordsPerParagraph: 0,
            sentenceVariety: 'Poor',
            paragraphVariety: 'Poor'
        };
    }

    const words = (text.match(WORD_REGEX) || []).length;
    const sentences = (text.match(SENTENCE_REGEX) || []).length;
    const paragraphs = (text.split(PARAGRAPH_REGEX) || []).length;

    const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;
    const avgWordsPerParagraph = paragraphs > 0 ? words / paragraphs : 0;

    const sentenceLengths = text.split(SENTENCE_REGEX).map(s =>
        (s.match(WORD_REGEX) || []).length
    ).filter(l => l > 0);

    const sentenceVariety = sentenceLengths.length > 2
        ? (Math.max(...sentenceLengths) - Math.min(...sentenceLengths)) > 5 ? 'Good' : 'Poor'
        : 'Poor';

    const paragraphLengths = text.split(PARAGRAPH_REGEX).map(p =>
        (p.match(WORD_REGEX) || []).length
    ).filter(l => l > 0);

    const paragraphVariety = paragraphLengths.length > 2
        ? (Math.max(...paragraphLengths) - Math.min(...paragraphLengths)) > 5 ? 'Good' : 'Poor'
        : 'Poor';

    return {
        totalWords: words,
        totalSentences: sentences,
        totalParagraphs: paragraphs,
        avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
        avgWordsPerParagraph: Math.round(avgWordsPerParagraph * 10) / 10,
        sentenceVariety,
        paragraphVariety
    };
}

export function detectLongSentences(text: string, threshold: number = LONG_SENTENCE_THRESHOLD): ContentIssue[] {
    if (!text || text.trim().length === 0) {
        return [];
    }

    const sentences = text.split(SENTENCE_REGEX);
    const longSentences: ContentIssue[] = [];

    sentences.forEach((sentence, index) => {
        const wordCount = (sentence.match(WORD_REGEX) || []).length;
        if (wordCount > threshold) {
            longSentences.push({
                type: 'long_sentence',
                text: sentence.trim(),
                index,
                suggestion: `Consider breaking this ${wordCount}-word sentence into multiple shorter sentences.`
            });
        }
    });

    return longSentences;
}

export function detectPassiveVoice(text: string): ContentIssue[] {
    if (!text || text.trim().length === 0) {
        return [];
    }

    const passiveIssues: ContentIssue[] = [];
    let match;
    let index = 0;

    while ((match = PASSIVE_VOICE_REGEX.exec(text)) !== null) {
        passiveIssues.push({
            type: 'passive_voice',
            text: match[0],
            index,
            suggestion: 'Consider rewriting in active voice for more direct communication.'
        });
        index++;
    }

    return passiveIssues;
}

export function generateQualityScore(
    structure: ContentStructure,
    longSentences: ContentIssue[],
    passiveVoice: ContentIssue[]
): QualityScore {
    let structureScore = 0;
    let clarityScore = 0;
    let engagementScore = 0;

    if (structure.totalWords > 300) structureScore += 25;
    if (structure.totalWords > 600) structureScore += 25;
    if (structure.avgWordsPerSentence >= 10 && structure.avgWordsPerSentence <= 20) structureScore += 25;
    if (structure.avgWordsPerParagraph >= 50 && structure.avgWordsPerParagraph <= 150) structureScore += 25;

    if (longSentences.length === 0) clarityScore += 40;
    else if (longSentences.length <= 2) clarityScore += 30;
    else if (longSentences.length <= 4) clarityScore += 20;

    if (passiveVoice.length === 0) clarityScore += 30;
    else if (passiveVoice.length <= 2) clarityScore += 20;
    else if (passiveVoice.length <= 4) clarityScore += 10;

    if (structure.totalWords > 500) engagementScore += 30;
    if (structure.totalSentences > 20) engagementScore += 20;
    if (structure.totalParagraphs > 5) engagementScore += 20;
    if (structure.sentenceVariety === 'Good') engagementScore += 15;
    if (structure.paragraphVariety === 'Good') engagementScore += 15;

    const overall = Math.round((structureScore + clarityScore + engagementScore) / 3);

    let grade: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    if (overall >= 85) grade = 'Excellent';
    else if (overall >= 70) grade = 'Good';
    else if (overall >= 50) grade = 'Fair';
    else grade = 'Poor';

    return {
        overall,
        structure: structureScore,
        clarity: clarityScore,
        engagement: engagementScore,
        grade
    };
}

export function generateRecommendations(
    structure: ContentStructure,
    longSentences: ContentIssue[],
    passiveVoice: ContentIssue[]
): string[] {
    const recommendations: string[] = [];

    if (structure.totalWords < 300) {
        recommendations.push('Consider expanding your content to provide more depth and detail.');
    }

    if (structure.avgWordsPerSentence > 25) {
        recommendations.push('Your sentences are quite long. Try breaking them up for better readability.');
    }

    if (structure.avgWordsPerSentence < 8) {
        recommendations.push('Your sentences are very short. Try combining related ideas for better flow.');
    }

    if (structure.avgWordsPerParagraph < 40) {
        recommendations.push('Your paragraphs are very short. Consider grouping related sentences together.');
    }

    if (structure.avgWordsPerParagraph >= 200) {
        recommendations.push('Your paragraphs are very long. Consider breaking them up for easier reading.');
    }

    if (structure.sentenceVariety === 'Poor') {
        recommendations.push('Vary your sentence length to improve reading rhythm and engagement.');
    }

    if (structure.paragraphVariety === 'Poor') {
        recommendations.push('Vary your paragraph length to create visual interest and improve readability.');
    }

    if (longSentences.length > 5) {
        recommendations.push(`You have ${longSentences.length} long sentences. Break them into shorter ones.`);
    }

    if (passiveVoice.length > 5) {
        recommendations.push(`You have ${passiveVoice.length} instances of passive voice. Rewrite in active voice.`);
    }

    return recommendations;
}

export function analyzeContentQuality(text: string): QualityRecommendations {
    const structure = analyzeContentStructure(text);
    const longSentences = detectLongSentences(text);
    const passiveVoice = detectPassiveVoice(text);
    const score = generateQualityScore(structure, longSentences, passiveVoice);
    const recommendations = generateRecommendations(structure, longSentences, passiveVoice);

    const issues: ContentIssue[] = [
        ...longSentences,
        ...passiveVoice
    ];

    return {
        score,
        structure,
        issues,
        recommendations
    };
}
