// pages/index.js

import React from 'react';

const Home = () => {
  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <h1 style={styles.heroTitle}>Selamat Datang di Layanan Kami</h1>
        <p style={styles.heroDescription}>
          Solusi inovatif untuk kebutuhan bisnis Anda. Kami membantu Anda mencapai tujuan dengan teknologi terdepan.
        </p>
      </section>

      {/* Layanan Section */}
      <section style={styles.servicesSection}>
        <h2 style={styles.sectionTitle}>Layanan Kami</h2>
        <div style={styles.servicesGrid}>
          <div style={styles.serviceCard}>
            <h3 style={styles.serviceTitle}>Pengembangan Web</h3>
            <p style={styles.serviceDescription}>
              Membangun situs web responsif dan berkinerja tinggi yang disesuaikan dengan kebutuhan Anda.
            </p>
          </div>
          <div style={styles.serviceCard}>
            <h3 style={styles.serviceTitle}>Aplikasi Mobile</h3>
            <p style={styles.serviceDescription}>
              Menciptakan aplikasi mobile intuitif untuk iOS dan Android yang memukau pengguna Anda.
            </p>
          </div>
          <div style={styles.serviceCard}>
            <h3 style={styles.serviceTitle}>Konsultasi IT</h3>
            <p style={styles.serviceDescription}>
              Memberikan saran ahli dan strategi teknologi untuk mengoptimalkan operasi bisnis Anda.
            </p>
          </div>
          <div style={styles.serviceCard}>
            <h3 style={styles.serviceTitle}>Cloud Solutions</h3>
            <p style={styles.serviceDescription}>
              Implementasi dan manajemen solusi cloud yang aman dan skalabel untuk infrastruktur Anda.
            </p>
          </div>
        </div>
      </section>

      {/* CTA (Call to Action) Section */}
      <section style={styles.ctaSection}>
        <h2 style={styles.sectionTitle}>Siap Memulai?</h2>
        <p style={styles.ctaDescription}>
          Jangan ragu untuk menghubungi kami dan diskusikan proyek Anda.
        </p>
        <button style={styles.ctaButton} onClick={() => alert('Tombol CTA diklik!')}>
          Hubungi Kami Sekarang
        </button>
      </section>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
    color: '#333',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  heroSection: {
    textAlign: 'center',
    padding: '100px 20px',
    backgroundColor: '#f4f4f4',
    marginBottom: '40px',
    borderRadius: '8px',
  },
  heroTitle: {
    fontSize: '3.5em',
    marginBottom: '20px',
    color: '#2c3e50',
  },
  heroDescription: {
    fontSize: '1.2em',
    maxWidth: '700px',
    margin: '0 auto',
    color: '#555',
  },
  servicesSection: {
    padding: '60px 20px',
    marginBottom: '40px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: '2.5em',
    marginBottom: '50px',
    color: '#2c3e50',
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px',
  },
  serviceCard: {
    backgroundColor: '#f9f9f9',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    textAlign: 'center',
    transition: 'transform 0.2s ease-in-out',
  },
  serviceCardHover: { // Contoh untuk hover, bisa diimplementasikan dengan state atau CSS eksternal
    transform: 'translateY(-5px)',
  },
  serviceTitle: {
    fontSize: '1.8em',
    marginBottom: '15px',
    color: '#34495e',
  },
  serviceDescription: {
    fontSize: '1em',
    color: '#666',
  },
  ctaSection: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: '#3498db',
    color: '#fff',
    borderRadius: '8px',
  },
  ctaDescription: {
    fontSize: '1.3em',
    marginBottom: '30px',
    maxWidth: '800px',
    margin: '0 auto 30px auto',
  },
  ctaButton: {
    backgroundColor: '#2ecc71',
    color: '#fff',
    border: 'none',
    padding: '15px 30px',
    fontSize: '1.2em',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  ctaButtonHover: { // Contoh untuk hover
    backgroundColor: '#27ae60',
  },\
};

export default Home;