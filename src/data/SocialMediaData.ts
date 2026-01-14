import { SocialLink, NavigationSection } from "@/types/data";

export const socialLinks: SocialLink[] = [
  {
    url: 'https://www.instagram.com',
    iconClass: 'fab fa-instagram',
    ariaLabel: 'Instagram Maskom',
    target: '_blank'
  },
  {
    url: 'https://www.linkedin.com',
    iconClass: 'fab fa-linkedin-in',
    ariaLabel: 'LinkedIn Maskom',
    target: '_blank'
  },
  {
    url: 'mailto:sales@maskom.co.id',
    iconClass: 'far fa-envelope',
    ariaLabel: 'Email Maskom'
  },
  {
    url: 'tel:+628170006625',
    iconClass: 'fas fa-phone-alt',
    ariaLabel: 'Telepon Maskom'
  }
];

export const navigationSections: NavigationSection[] = [
  {
    title: 'Navigasi',
    items: [
      { url: '/#solusi', label: 'Solusi' },
      { url: '/#pendekatan', label: 'Pendekatan' },
      { url: '/#paket', label: 'Harga' },
      { url: '/#testimoni', label: 'Testimoni' },
      { url: '/contact', label: 'Hubungi Kami' }
    ]
  },
  {
    title: 'Perusahaan',
    items: [
      { url: '/about', label: 'Tentang Maskom' },
      { url: '/faq', label: 'FAQ' },
      { url: '/login', label: 'Portal Pelanggan' },
      { url: '/sign-up', label: 'Daftar Layanan' },
      { url: 'https://maskom.co.id/privacy-policy/', label: 'Kebijakan Privasi', target: '_blank' }
    ]
  }
];
