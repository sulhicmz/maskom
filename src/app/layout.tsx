import "../styles/index.scss";
import { Spline_Sans } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import SkipToMainContent from "@/components/common/SkipToMainContent";

export const runtime = 'edge';

const splineSans = Spline_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="keywords" content="Maskom, layanan internet dedicated, fiber optic, managed service, maskom network" />
        <meta name="description" content="Maskom menyediakan layanan konektivitas, managed service, dan solusi infrastruktur digital untuk bisnis di seluruh Indonesia." />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
        {/* For IE  */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="icon" href="/favicon.png" sizes="any" />
        {/* Resource hints for critical CDN resources */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        <link rel="preconnect" href="https://cdn.emailjs.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
        <link rel="dns-prefetch" href="https://cdn.emailjs.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      </head>
      <body className={splineSans.className} suppressHydrationWarning>
        <SkipToMainContent />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
