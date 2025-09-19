import React from 'react';
import TechnicalSpecs from './TechnicalSpecs';
import UseCases from './UseCases';
import PricingPlans from './PricingPlans';
import Image from 'next/image';

interface ServiceDetailsProps {
  title: string;
  description: string;
  features: string[];
  image: string; // Path to the service image
  detailedDescription?: string;
  technicalSpecs?: string[];
  useCases?: string[];
  pricing?: {
    title: string;
    price: number;
    features: string[];
  }[];
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({
  title,
  description,
  features,
  image,
  detailedDescription,
  technicalSpecs,
  useCases,
  pricing
}) => {
  // Remove the @/ prefix for public assets
  const publicImagePath = image.replace("@/", "/");

  return (
    <div className="service-details">
      <h1>{title}</h1>
      {/* Optimize image loading with next/image */}
      <Image 
        src={publicImagePath} 
        alt={title} 
        className="service-image" 
        width={800} 
        height={400} 
        loading="lazy"
      />
      <p>{description}</p>
      
      {detailedDescription && (
        <div className="detailed-description" dangerouslySetInnerHTML={{ __html: detailedDescription }} />
      )}
      
      <h2>Fitur Utama</h2>
      <ul>
        {features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
      
      {technicalSpecs && technicalSpecs.length > 0 && (
        <TechnicalSpecs specs={technicalSpecs} />
      )}
      
      {useCases && useCases.length > 0 && (
        <UseCases cases={useCases} />
      )}
      
      {pricing && pricing.length > 0 && (
        <PricingPlans plans={pricing} />
      )}
    </div>
  );
};

export default ServiceDetails;