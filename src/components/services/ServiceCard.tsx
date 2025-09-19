import React from 'react';
import Link from 'next/link';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: string; // Path to the icon image
  link: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, icon, link }) => {
  // Remove the @/ prefix for public assets
  const publicIconPath = icon.replace("@/", "/");

  return (
    <div className="service-card">
      <div className="service-icon">
        <img src={publicIconPath} alt={title} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <Link href={link} className="read-more">
        Selengkapnya
      </Link>
    </div>
  );
};

export default ServiceCard;