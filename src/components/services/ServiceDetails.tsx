import React from 'react';

interface ServiceDetailsProps {
  title: string;
  description: string;
  features: string[];
  image: string; // Path to the service image
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({ title, description, features, image }) => {
  // Remove the @/ prefix for public assets
  const publicImagePath = image.replace("@/", "/");

  return (
    <div className="service-details">
      <h1>{title}</h1>
      <img src={publicImagePath} alt={title} className="service-image" />
      <p>{description}</p>
      
      <h2>Fitur Utama</h2>
      <ul>
        {features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceDetails;