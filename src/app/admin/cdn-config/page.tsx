import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import CDNConfigForm from '@/components/admin/CDNConfigForm';
import CDNHealthIndicator from '@/components/admin/CDNHealthIndicator';

export const metadata: Metadata = {
  title: 'Konfigurasi CDN - Admin',
  description: 'Kelola konfigurasi CDN dan optimisasi aset'
};

export default function CDNConfigPage() {
  const isAuthenticated = false;

  if (!isAuthenticated) {
    redirect('/login');
  }

  const handleSave = () => {
  };

  return (
    <div className="admin-cdn-config-page">
      <h1>Konfigurasi CDN</h1>

      <div className="cdn-config-container">
        <div className="cdn-health-section">
          <h2>Status CDN</h2>
          <CDNHealthIndicator />
        </div>

        <div className="cdn-form-section">
          <h2>Pengaturan CDN</h2>
          <CDNConfigForm onSave={handleSave} />
        </div>
      </div>

      <div className="cdn-info-section">
        <h2>Informasi CDN</h2>
        <div className="info-cards">
          <div className="info-card">
            <h3>Mengapa CDN?</h3>
            <p>
              CDN (Content Delivery Network) mendistribusikan aset statis secara global,
              mengurangi latensi dan mempercepat waktu muat untuk pengguna di seluruh dunia.
            </p>
          </div>

          <div className="info-card">
            <h3>Manfaat Optimasi</h3>
            <ul>
              <li>Pengurangan latensi 50-70%</li>
              <li>Konversi otomatis WebP (25-35% pengurangan ukuran)</li>
              <li>Peningkatan Core Web Vitals</li>
              <li>Pengurangan beban server</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>Provider yang Didukung</h3>
            <ul>
              <li><strong>Cloudflare:</strong> Gratis, konfigurasi otomatis dengan Vercel/Netlify</li>
              <li><strong>Vercel:</strong> Terintegrasi langsung dengan Next.js</li>
              <li><strong>Netlify:</strong> Terintegrasi langsung dengan Next.js</li>
              <li><strong>Custom:</strong> Gunakan CDN lain dengan API</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
