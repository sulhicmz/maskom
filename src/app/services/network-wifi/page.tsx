import React from 'react';
import Head from 'next/head';
import { ServiceDetails } from '@/components/services';
import Breadcrumb from '@/components/common/Breadcrumb';
import serviceData from '@/data/ServiceData';

const NetworkWifiPage = () => {
  // Find the service data for Network/WiFi
  const service = serviceData.find(s => s.id === 1);
  
  if (!service) {
    return <div>Service not found</div>;
  }

  // SEO meta tags
  const metaTitle = `${service.title} | Maskom - Solusi TI Terbaik`;
  const metaDescription = service.description;
  const metaKeywords = "solusi jaringan, wifi hotspot, keamanan jaringan, pemantauan jaringan, vpn, solusi wifi bisnis, infrastruktur jaringan";

  return (
    <>
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={metaKeywords} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://maskom.co.id/services/network-wifi" />
        <meta property="og:image" content={`https://maskom.co.id${service.image}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={`https://maskom.co.id${service.image}`} />
        <link rel="canonical" href="https://maskom.co.id/services/network-wifi" />
        
        {/* JSON-LD Structured Data for Service */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": service.title,
            "provider": {
              "@type": "Organization",
              "name": "Maskom",
              "url": "https://maskom.co.id"
            },
            "description": service.description,
            "offers": {
              "@type": "Offer",
              "category": "Service",
              "priceSpecification": {
                "@type": "PriceSpecification",
                "priceCurrency": "IDR"
              }
            }
          })
        }} />
      </Head>
      <Breadcrumb title={service.title} sub_title="Layanan" />
      <ServiceDetails
        title={service.title}
        description={service.description}
        features={service.features}
        image={service.image}
        detailedDescription={service.detailedDescription}
        technicalSpecs={service.technicalSpecs}
        useCases={service.useCases}
      />
    </>
  );
};

export default NetworkWifiPage;