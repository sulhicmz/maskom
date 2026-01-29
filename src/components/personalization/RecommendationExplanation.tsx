import React from 'react';
import type { Recommendation, RecommendationFeedback } from '@/types/recommendation';
import { recommendationEngine } from '@/utils/personalization/recommendationEngine';
import { useTheme } from '@/contexts/ThemeContext';

interface RecommendationExplanationProps {
  recommendation: Recommendation;
  onFeedback?: (contentId: number, helpful: boolean) => void;
}

const RecommendationExplanation: React.FC<RecommendationExplanationProps> = ({
  recommendation,
  onFeedback
}) => {
  const { theme } = useTheme();
  const [feedback, setFeedback] = useState<boolean | null>(null);

  const handleHelpful = (helpful: boolean) => {
    setFeedback(helpful);
    recommendationEngine.submitFeedback(recommendation.contentId, helpful);
    if (onFeedback) {
      onFeedback(recommendation.contentId, helpful);
    }
  };

  return (
    <div className={`recommendation-explanation ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      <div className="explanation-header">
        <span className="explanation-icon">💡</span>
        <span className="explanation-title">Rekomendasi untuk Anda</span>
      </div>

      <div className="explanation-content">
        <p className="explanation-reason">{recommendation.explanation.reason}</p>

        <div className="explanation-details">
          {recommendation.explanation.categoryMatch && (
            <span className="detail-badge category-badge">📂 Kategori Sama</span>
          )}
          {recommendation.explanation.tagMatch && (
            <span className="detail-badge tag-badge">🏷️ Tag Sama</span>
          )}
          {recommendation.explanation.engagementScore && recommendation.explanation.engagementScore > 70 && (
            <span className="detail-badge engagement-badge">⭐ Konten Menarik</span>
          )}
        </div>

        <div className="algorithm-info">
          <small>Algoritma: {recommendation.algorithm}</small>
          <small>Skor: {(recommendation.score * 100).toFixed(1)}%</small>
        </div>
      </div>

      <div className="feedback-section">
        <p className="feedback-question">Apakah rekomendasi ini membantu?</p>
        <div className="feedback-buttons">
          <button
            className={`feedback-btn ${feedback === true ? 'selected' : ''}`}
            onClick={() => handleHelpful(true)}
            disabled={feedback !== null}
            aria-label="Rekomendasi ini membantu"
          >
            👍 Ya, membantu
          </button>
          <button
            className={`feedback-btn ${feedback === false ? 'selected' : ''}`}
            onClick={() => handleHelpful(false)}
            disabled={feedback !== null}
            aria-label="Rekomendasi ini tidak membantu"
          >
            👎 Tidak, tidak membantu
          </button>
        </div>
      </div>

      <style jsx>{`
        .recommendation-explanation {
          background: ${theme === 'dark' ? '#1e1e1e' : '#ffffff'};
          border: 1px solid ${theme === 'dark' ? '#333333' : '#e0e0e0'};
          border-radius: 8px;
          padding: 16px;
          margin: 12px 0;
          transition: all 0.3s ease;
        }

        .explanation-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .explanation-icon {
          font-size: 24px;
        }

        .explanation-title {
          font-weight: 600;
          font-size: 16px;
          color: ${theme === 'dark' ? '#e0e0e0' : '#333333'};
        }

        .explanation-content {
          margin-bottom: 16px;
        }

        .explanation-reason {
          margin: 0 0 12px 0;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          font-size: 14px;
        }

        .explanation-details {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .detail-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .category-badge {
          background: ${theme === 'dark' ? '#2d3748' : '#e2e8f0'};
          color: ${theme === 'dark' ? '#e2e8f0' : '#2d3748'};
        }

        .tag-badge {
          background: ${theme === 'dark' ? '#2d3748' : '#e2e8f0'};
          color: ${theme === 'dark' ? '#e2e8f0' : '#2d3748'};
        }

        .engagement-badge {
          background: ${theme === 'dark' ? '#2f855a' : '#48bb78'};
          color: #ffffff;
        }

        .algorithm-info {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          font-size: 12px;
          color: ${theme === 'dark' ? '#999999' : '#888888'};
        }

        .feedback-section {
          border-top: 1px solid ${theme === 'dark' ? '#333333' : '#e0e0e0'};
          padding-top: 12px;
        }

        .feedback-question {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 500;
          color: ${theme === 'dark' ? '#e0e0e0' : '#333333'};
        }

        .feedback-buttons {
          display: flex;
          gap: 8px;
        }

        .feedback-btn {
          flex: 1;
          padding: 8px 16px;
          border: 1px solid ${theme === 'dark' ? '#4a5568' : '#cbd5e0'};
          border-radius: 6px;
          background: ${theme === 'dark' ? '#2d3748' : '#ffffff'};
          color: ${theme === 'dark' ? '#e2e8f0' : '#2d3748'};
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .feedback-btn:hover:not(:disabled) {
          background: ${theme === 'dark' ? '#4a5568' : '#e2e8f0'};
          border-color: ${theme === 'dark' ? '#718096' : '#a0aec0'};
        }

        .feedback-btn:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .feedback-btn.selected {
          background: ${theme === 'dark' ? '#4a5568' : '#e2e8f0'};
          border-color: ${theme === 'dark' ? '#4299e1' : '#3182ce'};
          color: ${theme === 'dark' ? '#4299e1' : '#3182ce'};
        }

        @media (max-width: 768px) {
          .explanation-details {
            flex-direction: column;
          }

          .feedback-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default RecommendationExplanation;
