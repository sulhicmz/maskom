import HomeOneDark from "@/components/homes/home-one-dark";
import Wrapper from "@/layouts/Wrapper";
import Head from 'next/head';

export const metadata = {
  title: "Maskom - Solusi TI Terbaik untuk Bisnis Anda",
};

const page = () => {
  return (
    <>
      <Head>
        <title>Maskom - Solusi TI Terbaik untuk Bisnis Anda</title>
        <meta name="description" content="Maskom menyediakan solusi TI terbaik untuk bisnis Anda, termasuk jaringan/WiFi, pengembangan website, dan otomatisasi AI." />
        <meta name="keywords" content="Maskom, solusi TI, jaringan WiFi, pengembangan website, otomatisasi AI, teknologi informasi, bisnis digital" />
        <meta property="og:title" content="Maskom - Solusi TI Terbaik untuk Bisnis Anda" />
        <meta property="og:description" content="Maskom menyediakan solusi TI terbaik untuk bisnis Anda, termasuk jaringan/WiFi, pengembangan website, dan otomatisasi AI." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://maskom.co.id" />
        <meta property="og:image" content="https://maskom.co.id/assets/images/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Maskom - Solusi TI Terbaik untuk Bisnis Anda" />
        <meta name="twitter:description" content="Maskom menyediakan solusi TI terbaik untuk bisnis Anda, termasuk jaringan/WiFi, pengembangan website, dan otomatisasi AI." />
        <meta name="twitter:image" content="https://maskom.co.id/assets/images/og-image.jpg" />
        <link rel="canonical" href="https://maskom.co.id" />
      </Head>
      <Wrapper>
        <HomeOneDark />
      </Wrapper>
    </>
  )
}

export default page