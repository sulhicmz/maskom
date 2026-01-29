import React, { useState, useEffect } from 'react';
import type { Recommendation, RecommendationAlgorithm } from '@/types/recommendation';
import { recommendationEngine } from '@/utils/personalization/recommendationEngine';
import RecommendationCard from './RecommendationCard';
import { useTheme } from '@/contexts/ThemeContext';

interface RecommendationListProps {
  algorithm?: RecommendationAlgorithm;
  count?: number;
  excludeContentIds?: number[];
  onContentClick?: (contentId: number) => void;
  showFeedback?: boolean;
}

const RecommendationList: React.FC<RecommendationListProps> = ({
  algorithm = 'hybrid',
  count = 10,
  excludeContentIds = [],
  onContentClick,
  showFeedback = true
}) => {
  const { theme } = useTheme();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<RecommendationAlgorithm>(algorithm);

  useEffect(() => {
    loadRecommendations();
  }, [selectedAlgorithm, count, excludeContentIds]);

  const loadRecommendations = () => {
    setLoading(true);
    try {
      const recs = recommendationEngine.getRecommendations(
        selectedAlgorithm,
        count,
        excludeContentIds
      );
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadRecommendations();
  };

  const handleContentClick = (contentId: number) => {
    recommendationEngine.trackRecommendationClick(contentId);
    if (onContentClick) {
      onContentClick(contentId);
    }
  };

  const algorithmOptions: Array<{ value: RecommendationAlgorithm; label: string; icon: string }> = [
    { value: 'hybrid', label: 'Hibrida', icon: '🎯' },
    { value: 'content_based', label: 'Konten', icon: '📄' },
    { value: 'collaborative', label: 'Kolaboratif', icon: '👥' },
    { value: 'popular', label: 'Populer', icon: '🔥' },
    { value: 'trending', label: 'Trending', icon: '📈' }
  ];

  if (loading) {
    return (
      <div className={`recommendation-list ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Memuat rekomendasi...</p>
        </div>

        <style jsx>{`
          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            gap: 16px;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid ${theme === 'dark' ? '#4299e1' : '#3182ce'};
            border-top: 3px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .loading-state p {
            margin: 0;
            color: ${theme === 'dark' ? '#cccccc' : '#666666'};
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={`recommendation-list ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>Tidak ada rekomendasi</h3>
          <p>Mulai membaca konten untuk mendapatkan rekomendasi yang dipersonalisasi.</p>
          <button className="refresh-btn" onClick={handleRefresh}>
            Segarkan Rekomendasi
          </button>
        </div>

        <style jsx>{`
          .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            text-align: center;
            gap: 16px;
          }

          .empty-icon {
            font-size: 48px;
          }

          .empty-state h3 {
            margin: 0;
            font-size: 18px;
            color: ${theme === 'dark' ? '#e0e0e0' : '#333333'};
          }

          .empty-state p {
            margin: 0;
            font-size: 14px;
            color: ${theme === 'dark' ? '#cccccc' : '#666666'};
            max-width: 400px;
          }

          .refresh-btn {
            padding: 10px 20px;
            background: ${theme === 'dark' ? '#4299e1' : '#3182ce'};
            color: #ffffff;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .refresh-btn:hover {
            background: ${theme === 'dark' ? '#3182ce' : '#2b6cb0'};
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`recommendation-list ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`}>
      <div className="list-header">
        <h2 className="list-title">Rekomendasi untuk Anda</h2>
        <button className="refresh-icon-btn" onClick={handleRefresh} aria-label="Segarkan rekomendasi">
          🔄
        </button>
      </div>

      <div className="algorithm-selector">
        <span className="selector-label">Algoritma:</span>
        <div className="selector-options">
          {algorithmOptions.map((option) => (
            <button
              key={option.value}
              className={`algorithm-btn ${selectedAlgorithm === option.value ? 'active' : ''}`}
              onClick={() => setSelectedAlgorithm(option.value)}
              aria-label={`Pilih algoritma ${option.label}`}
            >
              <span className="algorithm-icon">{option.icon}</span>
              <span className="algorithm-label">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="recommendations-grid">
        {recommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.contentId}
            recommendation={recommendation}
            onClick={handleContentClick}
            showFeedback={showFeedback}
          />
        ))}
      </div>

      <div className="list-footer">
        <p className="footer-text">
          {recommendations.length} rekomendasi berdasarkan algoritma {selectedAlgorithm}
        </p>
        <button className="view-all-btn" onClick={() => window.location.reload()}>
          Lihat Semua Artikel
        </button>
      </div>

      <style jsx>{`
        .recommendation-list {
          width: 100%;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .list-title {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: ${theme === 'dark' ? '#e0e0e0' : '#333333'};
        }

        .refresh-icon-btn {
          background: ${theme === 'dark' ? '#2d3748' : '#e2e8f0'};
          border: 1px solid ${theme === 'dark' ? '#4a5568' : '#cbd5e0'};
          border-radius: 6px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 18px;
          transition: all 0.2s ease;
        }

        .refresh-icon-btn:hover {
          background: ${theme === 'dark' ? '#4a5568' : '#cbd5e0'};
          transform: rotate(180deg);
        }

        .algorithm-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding: 12px;
          background: ${theme === 'dark' ? '#2d3748' : '#f7fafc'};
          border-radius: 8px;
          border: 1px solid ${theme === 'dark' ? '#4a5568' : '#e2e8f0'};
        }

        .selector-label {
          font-size: 14px;
          font-weight: 500;
          color: ${theme === 'dark' ? '#e0e0e0' : '#333333'};
          white-space: nowrap;
        }

        .selector-options {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .algorithm-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: ${theme === 'dark' ? '#1e1e1e' : '#ffffff'};
          border: 1px solid ${theme === 'dark' ? '#4a5568' : '#cbd5e0'};
          border-radius: 6px;
          color: ${theme === 'dark' ? '#e2e8f0' : '#2d3748'};
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .algorithm-btn:hover {
          background: ${theme === 'dark' ? '#4a5568' : '#cbd5e0'};
          border-color: ${theme === 'dark' ? '#718096' : '#a0aec0'};
        }

        .algorithm-btn.active {
          background: ${theme === 'dark' ? '#4299e1' : '#3182ce'};
          color: #ffffff;
          border-color: ${theme === 'dark' ? '#4299e1' : '#3182ce'};
        }

        .algorithm-icon {
          font-size: 16px;
        }

        .algorithm-label {
          font-weight: 500;
        }

        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .list-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: ${theme === 'dark' ? '#2d3748' : '#f7fafc'};
          border-radius: 8px;
          border: 1px solid ${theme === 'dark' ? '#4a5568' : '#e2e8f0'};
        }

        .footer-text {
          margin: 0;
          font-size: 14px;
          color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .view-all-btn {
          padding: 8px 16px;
          background: transparent;
          color: ${theme === 'dark' ? '#4299e1' : '#3182ce'};
          border: 1px solid ${theme === 'dark' ? '#4299e1' : '#3182ce'};
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .view-all-btn:hover {
          background: ${theme === 'dark' ? 'rgba(66, 153, 225, 0.1)' : 'rgba(49, 130, 206, 0.1)'};
        }

        @media (max-width: 768px) {
          .recommendations-grid {
            grid-template-columns: 1fr;
          }

          .algorithm-selector {
            flex-direction: column;
            align-items: flex-start;
          }

          .list-footer {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default RecommendationList;
