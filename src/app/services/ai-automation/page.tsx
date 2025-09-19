import React from 'react';
import { ServiceDetails } from '@/components/services';
import Breadcrumb from '@/components/common/Breadcrumb';
import serviceData from '@/data/ServiceData';

const AIAutomationPage = () => {
  // Find the service data for AI Automation
  const service = serviceData.find(s => s.id === 3);
  
  if (!service) {
    return <div>Service not found</div>;
  }

  return (
    <>
      <Breadcrumb title={service.title} sub_title="Layanan" />
      <ServiceDetails 
        title={service.title}
        description={service.description}
        features={service.features}
        image={service.image}
      />
    </>
  );
};

export default AIAutomationPage;