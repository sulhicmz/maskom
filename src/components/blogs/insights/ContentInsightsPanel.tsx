"use client"

import React, { useState, useCallback } from 'react';
import {
    getReadabilityScore,
    estimateReadingTime,
    generateSEOSuggestions,
    generateQualityScore,
    type ReadabilityScore,
    type ReadingTime,
    type SEOSuggestions,
    type QualityRecommendations
} from '@/utils/contentInsights';

interface ContentInsightsPanelProps {
    title: string;
    description: string;
    content: string;
    isVisible: boolean;
    onClose: () => void;
}

const ContentInsightsPanel: React.FC<ContentInsightsPanelProps> = ({
    title,
    description,
    content,
    isVisible,
    onClose
}) => {
    const [activeTab, setActiveTab] = useState<'readability' | 'seo' | 'quality'>('readability');

    const insights = React.useMemo(() => {
        const fleschScore = generateQualityScore(content);
        const readingTime = estimateReadingTime(content);
        const readabilityScore = getReadabilityScore(
            calculateFleschReadingEaseFromText(content)
        );
        const seoSuggestions = generateSEOSuggestions(title, description, content);
        const qualityScore = generateQualityScore(content);

        return {
            readabilityScore,
            readingTime,
            seoSuggestions,
            qualityScore
        };
    }, [title, description, content]);

    function calculateFleschReadingEaseFromText(text: string): number {
        const words = (text.match(/\b\w+\b/g) || []).length;
        const sentences = (text.match(/[.!?]+/g) || []).length;
        
        if (words === 0 || sentences === 0) return 0;
        
        const syllableRegex = /[^aeiouy]*[aeiouy]+(?:e?|le)?[^aeiouy]*/gi;
        const totalSyllables = text.match(syllableRegex)?.length || words;
        
        const avgSentenceLength = words / sentences;
        const avgSyllablesPerWord = totalSyllables / words;
        
        const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
        
        return Math.max(0, Math.min(100, fleschScore));
    }

    if (!isVisible) return null;

    return (
        <div className="content-insights-overlay">
            <div className="content-insights-panel">
                <div className="content-insights-header">
                    <h3>Wawasan Konten</h3>
                    <button
                        onClick={onClose}
                        className="close-btn"
                        aria-label="Tutup"
                    >
                        ✕
                    </button>
                </div>

                <div className="content-insights-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'readability' ? 'active' : ''}`}
                        onClick={() => setActiveTab('readability')}
                    >
                        📖 Keterbacaan
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'seo' ? 'active' : ''}`}
                        onClick={() => setActiveTab('seo')}
                    >
                        🔍 SEO
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'quality' ? 'active' : ''}`}
                        onClick={() => setActiveTab('quality')}
                    >
                        ⭐ Kualitas
                    </button>
                </div>

                <div className="content-insights-content">
                    {activeTab === 'readability' && (
                        <div className="insights-section">
                            <ReadabilityView
                                score={insights.readabilityScore}
                                readingTime={insights.readingTime}
                            />
                        </div>
                    )}

                    {activeTab === 'seo' && (
                        <div className="insights-section">
                            <SEOView suggestions={insights.seoSuggestions} />
                        </div>
                    )}

                    {activeTab === 'quality' && (
                        <div className="insights-section">
                            <QualityView quality={insights.qualityScore} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface ReadabilityViewProps {
    score: ReadabilityScore;
    readingTime: ReadingTime;
}

const ReadabilityView: React.FC<ReadabilityViewProps> = ({ score, readingTime }) => {
    const getScoreColor = (level: string): string => {
        switch (level) {
            case 'Easy': return 'success';
            case 'Medium': return 'info';
            case 'Hard': return 'warning';
            case 'Very Hard': return 'danger';
            default: return 'secondary';
        }
    };

    return (
        <div className="readability-view">
            <div className="readability-score-card">
                <div className={`score-badge ${getScoreColor(score.level)}`}>
                    {score.score.toFixed(1)}
                </div>
                <div className="score-level">{score.level}</div>
                <div className="score-interpretation">{score.interpretation}</div>
            </div>

            <div className="reading-time-card">
                <div className="reading-time-icon">⏱️</div>
                <div className="reading-time-value">{readingTime.display}</div>
                <div className="reading-time-label">Perkiraan waktu baca</div>
            </div>
        </div>
    );
};

interface SEOViewProps {
    suggestions: SEOSuggestions;
}

const SEOView: React.FC<SEOViewProps> = ({ suggestions }) => {
    const getStatusIcon = (isValid: boolean): string => {
        return isValid ? '✅' : '⚠️';
    };

    return (
        <div className="seo-view">
            <div className="seo-section">
                <h4>Judul SEO</h4>
                <div className={`seo-item ${suggestions.title.isValid ? 'valid' : 'invalid'}`}>
                    <span className="seo-status">{getStatusIcon(suggestions.title.isValid)}</span>
                    <span className="seo-message">{suggestions.title.message}</span>
                    <span className="seo-length">
                        {suggestions.title.currentLength} / {suggestions.title.optimalMax} karakter
                    </span>
                </div>
            </div>

            <div className="seo-section">
                <h4>Deskripsi Meta</h4>
                <div className={`seo-item ${suggestions.description.isValid ? 'valid' : 'invalid'}`}>
                    <span className="seo-status">{getStatusIcon(suggestions.description.isValid)}</span>
                    <span className="seo-message">{suggestions.description.message}</span>
                    <span className="seo-length">
                        {suggestions.description.currentLength} / {suggestions.description.optimalMax} karakter
                    </span>
                </div>
            </div>

            <div className="seo-section">
                <h4>Struktur Heading</h4>
                <div className={`seo-item ${suggestions.headings.hasMultipleH1 ? 'invalid' : 'valid'}`}>
                    <span className="seo-status">{getStatusIcon(!suggestions.headings.hasMultipleH1)}</span>
                    <span className="seo-message">{suggestions.headings.message}</span>
                </div>
            </div>

            <div className="seo-section">
                <h4>Kata Kunci Teratas</h4>
                <div className="keyword-list">
                    {suggestions.keywords.length === 0 ? (
                        <p className="no-keywords">Tidak ada kata kunci yang ditemukan</p>
                    ) : (
                        suggestions.keywords.map((keyword, index) => (
                            <div key={index} className="keyword-item">
                                <span className="keyword-text">{keyword.keyword}</span>
                                <span className="keyword-count">{keyword.count}x</span>
                                <span className="keyword-density">({keyword.density.toFixed(2)}%)</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

interface QualityViewProps {
    quality: QualityRecommendations;
}

const QualityView: React.FC<QualityViewProps> = ({ quality }) => {
    const getScoreColor = (score: number): string => {
        if (score >= 85) return 'success';
        if (score >= 70) return 'info';
        if (score >= 50) return 'warning';
        return 'danger';
    };

    return (
        <div className="quality-view">
            <div className="quality-overall-card">
                <div className={`overall-score-badge ${getScoreColor(quality.score.overall)}`}>
                    {quality.score.overall}
                </div>
                <div className="overall-grade">{quality.score.grade}</div>
                <div className="overall-label">Skor Kualitas Keseluruhan</div>
            </div>

            <div className="quality-metrics">
                <div className="quality-metric">
                    <div className="metric-label">Struktur</div>
                    <div className={`metric-value ${getScoreColor(quality.score.structure)}`}>
                        {quality.score.structure}
                    </div>
                </div>
                <div className="quality-metric">
                    <div className="metric-label">Kejelasan</div>
                    <div className={`metric-value ${getScoreColor(quality.score.clarity)}`}>
                        {quality.score.clarity}
                    </div>
                </div>
                <div className="quality-metric">
                    <div className="metric-label">Keterlibatan</div>
                    <div className={`metric-value ${getScoreColor(quality.score.engagement)}`}>
                        {quality.score.engagement}
                    </div>
                </div>
            </div>

            <div className="quality-structure">
                <h4>Statistik Konten</h4>
                <div className="structure-stats">
                    <div className="stat-item">
                        <span className="stat-label">Total Kata:</span>
                        <span className="stat-value">{quality.structure.totalWords}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Total Kalimat:</span>
                        <span className="stat-value">{quality.structure.totalSentences}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Total Paragraf:</span>
                        <span className="stat-value">{quality.structure.totalParagraphs}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Rata-rata Kata per Kalimat:</span>
                        <span className="stat-value">{quality.structure.avgWordsPerSentence}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Rata-rata Kata per Paragraf:</span>
                        <span className="stat-value">{quality.structure.avgWordsPerParagraph}</span>
                    </div>
                </div>
            </div>

            {quality.recommendations.length > 0 && (
                <div className="quality-recommendations">
                    <h4>Rekomendasi Perbaikan</h4>
                    <ul className="recommendations-list">
                        {quality.recommendations.map((recommendation, index) => (
                            <li key={index} className="recommendation-item">
                                💡 {recommendation}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {quality.issues.length > 0 && (
                <div className="quality-issues">
                    <h4>Isu yang Ditemukan</h4>
                    {quality.issues.slice(0, 5).map((issue, index) => (
                        <div key={index} className="issue-item">
                            <span className="issue-type">{issue.type}</span>
                            <span className="issue-text">{issue.text.substring(0, 50)}...</span>
                            <span className="issue-suggestion">{issue.suggestion}</span>
                        </div>
                    ))}
                    {quality.issues.length > 5 && (
                        <p className="more-issues">
                            +{quality.issues.length - 5} isu lainnya
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

ContentInsightsPanel.displayName = 'ContentInsightsPanel';

export default React.memo(ContentInsightsPanel);
