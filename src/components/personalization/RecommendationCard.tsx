import React from 'react';
import Image from 'next/image';
import type { Recommendation } from '@/types/recommendation';
import { useTheme } from '@/contexts/ThemeContext';
import RecommendationExplanation from './RecommendationExplanation';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onClick?: (contentId: number) => void;
  showFeedback?: boolean;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onClick,
  showFeedback = true
}) => {
  const { theme } = useTheme();
  const { content } = recommendation;

  const handleClick = () => {
    if (onClick) {
      onClick(content.id);
    }
  };

  return (
    <div className={`recommendation-card ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      <div className="card-header">
        {content.thumb && (
          <Image
            src={content.thumb.src}
            alt={content.title}
            fill
            className="card-thumb"
          />
        )}
        <div className="card-meta">
          {content.category && (
            <span className="category-badge">{content.category}</span>
          )}
          <span className="score-badge">
            {(recommendation.score * 100).toFixed(0)}% match
          </span>
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-title">{content.title}</h3>
        <p className="card-description">{content.desc}</p>

        <div className="card-footer">
          <span className="date-badge">{content.date}</span>
          <span className="views-badge">
            {content.viewCount || 0} tampilan
          </span>
          <span className="engagement-badge">
            {content.engagementScore || 0} keterlibatan
          </span>
        </div>
      </div>

      <div className="card-actions">
        <button
          className="view-btn"
          onClick={handleClick}
          aria-label={`Lihat artikel: ${content.title}`}
        >
          Baca Selengkapnya
        </button>
      </div>

      {showFeedback && (
        <RecommendationExplanation
          recommendation={recommendation}
          onFeedback={(contentId) => {
            if (onClick) {
              onClick(contentId);
            }
          }}
        />
      )}

      <style jsx>{`
        .recommendation-card {
          background: ${theme === 'dark' ? '#1e1e1e' : '#ffffff'};
          border: 1px solid ${theme === 'dark' ? '#333333' : '#e0e0e0'};
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          margin-bottom: 16px;
        }

        .recommendation-card:hover {
          box-shadow: ${theme === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.1)'};
          transform: translateY(-2px);
        }

        .card-header {
          position: relative;
          width: 100%;
          height: 160px;
          overflow: hidden;
        }

        .card-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .card-meta {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .category-badge {
          background: ${theme === 'dark' ? 'rgba(66, 153, 225, 0.9)' : 'rgba(49, 130, 206, 0.9)'};
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .score-badge {
          background: ${theme === 'dark' ? 'rgba(72, 187, 120, 0.9)' : 'rgba(72, 187, 120, 0.9)'};
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .card-body {
          padding: 16px;
        }

        .card-title {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          line-height: 1.4;
          color: ${theme === 'dark' ? '#e0e0e0' : '#333333'};
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-description {
          margin: 0 0 12px 0;
          font-size: 14px;
          line-height: 1.6;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-footer {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .date-badge,
        .views-badge,
        .engagement-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 4px;
          background: ${theme === 'dark' ? '#2d3748' : '#e2e8f0'};
          color: ${theme === 'dark' ? '#e2e8f0' : '#2d3748'};
        }

        .card-actions {
          padding: 12px 16px;
          border-top: 1px solid ${theme === 'dark' ? '#333333' : '#e0e0e0'};
        }

        .view-btn {
          width: 100%;
          padding: 10px 16px;
          background: ${theme === 'dark' ? '#4299e1' : '#3182ce'};
          color: #ffffff;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-btn:hover {
          background: ${theme === 'dark' ? '#3182ce' : '#2b6cb0'};
          transform: translateY(-1px);
        }

        .view-btn:active {
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .card-header {
            height: 140px;
          }

          .card-title {
            font-size: 16px;
          }

          .card-description {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default RecommendationCard;
