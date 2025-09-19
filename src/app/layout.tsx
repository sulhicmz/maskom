import "../styles/index.scss";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const isDev = process.env.NODE_ENV === 'development'

  return (
    <html lang="en" suppressHydrationWarning={isDev}>
      <head>
        <meta name="keywords" content="Maskom - Solusi TI Terbaik untuk Bisnis Anda" />
        <meta name="description" content="Maskom menyediakan solusi TI terbaik untuk bisnis Anda, termasuk jaringan/WiFi, pengembangan website, dan otomatisasi AI." />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
        {/* For IE  */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="icon" href="/favicon.png" sizes="any" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700&display=swap" />
      </head>
      <body className="home-one-dark" suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  )
}
