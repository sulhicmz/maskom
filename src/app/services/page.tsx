import React from 'react';
import { ServiceCard } from '@/components/services';
import Breadcrumb from '@/components/common/Breadcrumb';
import serviceData from '@/data/ServiceData';

const ServicesPage = () => {
  return (
    <>
      <Breadcrumb title="Layanan Kami" sub_title="Layanan" />
      <div className="services-grid">
        {serviceData.map((service) => (
          <ServiceCard 
            key={service.id}
            title={service.title}
            description={service.description}
            icon={service.icon}
            link={service.link}
          />
        ))}
      </div>
    </>
  );
};

export default ServicesPage;