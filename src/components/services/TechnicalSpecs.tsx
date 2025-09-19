import React from 'react';

interface TechnicalSpecsProps {
  specs: string[];
}

const TechnicalSpecs: React.FC<TechnicalSpecsProps> = ({ specs }) => {
  return (
    <div className="technical-specs">
      <h2>Spesifikasi Teknis</h2>
      <div className="specs-grid">
        {specs.map((spec, index) => (
          <div key={index} className="spec-item">
            <div className="spec-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="spec-content">
              <p>{spec}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnicalSpecs;