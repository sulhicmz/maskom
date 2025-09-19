import "../styles/index.scss";
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const isDev = process.env.NODE_ENV === 'development'

  return (
    <html lang="id" suppressHydrationWarning={isDev}>
      <head>
        <meta name="keywords" content="Maskom, solusi TI, jaringan WiFi, pengembangan website, otomatisasi AI, teknologi informasi, bisnis digital" />
        <meta name="description" content="Maskom menyediakan solusi TI terbaik untuk bisnis Anda, termasuk jaringan/WiFi, pengembangan website, dan otomatisasi AI." />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
        {/* For IE  */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="icon" href="/favicon.png" sizes="any" />
        
        {/* Preconnect and preload for Google Fonts optimization */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700&display=swap" media="print" />
        <noscript>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700&display=swap" />
        </noscript>
        
        {/* JSON-LD Structured Data for Organization */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Maskom",
            "url": "https://maskom.co.id",
            "logo": "https://maskom.co.id/favicon.png",
            "sameAs": [
              "https://www.facebook.com/maskom",
              "https://www.instagram.com/maskom",
              "https://www.linkedin.com/company/maskom",
              "https://twitter.com/maskom"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+62-21-1234-5678",
              "contactType": "Customer Service",
              "areaServed": "ID",
              "availableLanguage": "id"
            }
          })
        }} />
        
        {/* Google Search Console verification */}
        <meta name="google-site-verification" content="YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE" />
      </head>
      <body className="home-one-dark" suppressHydrationWarning={true}>
        {children}
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
        
        {/* Performance monitoring with Web Vitals */}
        <Script
          src="https://unpkg.com/web-vitals@2.1.0/dist/web-vitals.umd.js"
          strategy="afterInteractive"
        />
        <Script id="web-vitals" strategy="afterInteractive">
          {`
            // Measure Core Web Vitals and send to Google Analytics
            if ('webVitals' in window) {
              webVitals.getCLS(sendToGoogleAnalytics);
              webVitals.getFID(sendToGoogleAnalytics);
              webVitals.getFCP(sendToGoogleAnalytics);
              webVitals.getLCP(sendToGoogleAnalytics);
              webVitals.getTTFB(sendToGoogleAnalytics);
            }
            
            function sendToGoogleAnalytics({ name, delta, id }) {
              gtag('event', name, {
                event_category: 'Web Vitals',
                event_label: id,
                value: Math.round(name === 'CLS' ? delta * 1000 : delta),
                non_interaction: true,
              });
            }
          `}
        </Script>
      </body>
    </html>
  )
}