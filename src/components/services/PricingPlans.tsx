import React from 'react';

interface PricingPlan {
  title: string;
  price: number;
  features: string[];
}

interface PricingPlansProps {
  plans: PricingPlan[];
}

const PricingPlans: React.FC<PricingPlansProps> = ({ plans }) => {
  return (
    <div className="pricing-plans">
      <h2>Paket Harga</h2>
      <div className="plans-grid">
        {plans.map((plan, index) => (
          <div key={index} className="plan-item">
            <div className="plan-header">
              <h3>{plan.title}</h3>
              <div className="plan-price">
                <span className="currency">Rp</span>
                <span className="amount">{plan.price.toLocaleString('id-ID')}</span>
                <span className="period">/bulan</span>
              </div>
            </div>
            <div className="plan-features">
              <ul>
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex}>
                    <i className="fas fa-check-circle"></i>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="plan-action">
              <a href="#contact" className="theme-btn style-one">
                Pilih Paket
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingPlans;