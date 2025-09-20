/* eslint-disable @next/next/no-page-custom-font */
import "../styles/index.scss";
import Footer from "../components/Footer"; // Import the Footer component

export const metadata = {
  title: 'Maskom Network - Solusi Jaringan Terbaik',
  description: 'Maskom Network menyediakan solusi jaringan yang inovatif dan andal untuk bisnis Anda. Tingkatkan konektivitas dan keamanan dengan layanan kami.',
  openGraph: {
    title: 'Maskom Network - Solusi Jaringan Terbaik',
    description: 'Maskom Network menyediakan solusi jaringan yang inovatif dan andal untuk bisnis Anda. Tingkatkan konektivitas dan keamanan dengan layanan kami.',
    url: 'https://www.maskom.com', // Replace with your actual domain
    siteName: 'Maskom Network',
    images: [
      {
        url: 'https://www.maskom.com/og-image.jpg', // Replace with your actual OG image
        width: 1200,
        height: 630,
        alt: 'Maskom Network',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maskom Network - Solusi Jaringan Terbaik',
    description: 'Maskom Network menyediakan solusi jaringan yang inovatif dan andal untuk bisnis Anda. Tingkatkan konektivitas dan keamanan dengan layanan kami.',
    creator: '@maskomnetwork', // Replace with your Twitter handle
    images: ['https://www.maskom.com/og-image.jpg'], // Replace with your actual OG image
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const isDev = process.env.NODE_ENV === 'development'

  return (
    <html lang="en" suppressHydrationWarning={isDev}>
      <head>
        {/* Meta tags are now handled by Next.js metadata export */}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
        {/* For IE  */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@400;500;600;700&display=swap"
        />
        <link rel="icon" href="/favicon.png" sizes="any" />
      </head>
      <body suppressHydrationWarning={true}>
        {children}
        <Footer /> {/* Render the Footer component */}
      </body>
    </html>
  )
}
