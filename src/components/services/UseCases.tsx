import React from 'react';

interface UseCasesProps {
  cases: string[];
}

const UseCases: React.FC<UseCasesProps> = ({ cases }) => {
  return (
    <div className="use-cases">
      <h2>Studi Kasus dan Penggunaan</h2>
      <div className="cases-grid">
        {cases.map((caseItem, index) => (
          <div key={index} className="case-item">
            <div className="case-icon">
              <i className="fas fa-building"></i>
            </div>
            <div className="case-content">
              <p>{caseItem}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UseCases;