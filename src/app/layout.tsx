/* eslint-disable @next/next/no-page-custom-font */
import "../styles/index.scss";

export const runtime = 'edge';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const isDev = process.env.NODE_ENV === 'development'

  return (
    <html lang="id" suppressHydrationWarning={isDev}>
      <head>
        <meta name="keywords" content="Maskom, layanan internet dedicated, fiber optic, managed service, maskom network, konektivitas bisnis, NOC 24/7, indonesia" />
        <meta name="description" content="Maskom menyediakan layanan konektivitas, managed service, dan solusi infrastruktur digital untuk bisnis di seluruh Indonesia." />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
        {/* For IE  */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="author" content="Maskom Network" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@400;500;600;700&display=swap"
        />
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link rel="canonical" href="https://maskom.co.id" />
        <link rel="alternate" type="application/rss+xml" title="Maskom Network Updates" href="https://maskom.co.id/rss.xml" />
      </head>
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}
