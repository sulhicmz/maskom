"use client";

import { useState } from "react";

const steps = [
  {
    id: 1,
    title: "Persiapan",
    content: "Verifikasi notifikasi kepada cabang dan siapkan backup konfigurasi perangkat.",
    checklist: [
      "Konfirmasi jadwal dengan penanggung jawab cabang",
      "Unduh konfigurasi terakhir dari portal",
      "Siapkan perangkat cadangan jika diperlukan",
    ],
  },
  {
    id: 2,
    title: "Pelaksanaan",
    content: "Lakukan pemeliharaan sesuai SOP Maskom dan pantau status link selama proses berlangsung.",
    checklist: [
      "Aktifkan mode maintenance di monitoring",
      "Lakukan upgrade firmware dan reboot terjadwal",
      "Catat hasil pengujian latency dan throughput",
    ],
  },
  {
    id: 3,
    title: "Serah Terima",
    content: "Dokumentasikan hasil kegiatan dan aktifkan kembali pemantauan otomatis.",
    checklist: [
      "Kembalikan mode monitoring ke normal",
      "Unggah laporan pemeliharaan ke portal",
      "Kirim ringkasan ke stakeholder melalui email",
    ],
  },
];

const jadwalPemeliharaan = [
  { tanggal: "14 Mar 2024", layanan: "Review kapasitas jaringan kantor pusat", waktu: "20.00 - 22.00 WIB", status: "Terjadwal" },
  { tanggal: "17 Mar 2024", layanan: "Upgrade firmware firewall cabang Bandung", waktu: "21.00 - 23.00 WIB", status: "Perlu konfirmasi" },
  { tanggal: "23 Mar 2024", layanan: "Simulasi pemulihan bencana data center", waktu: "09.00 - 12.00 WIB", status: "Direncanakan" },
];

const AIAutomation = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="ai-automation">
      <h2 className="mb-3">Jadwal Pemeliharaan</h2>
      <p className="text-muted mb-4">Kelola kegiatan pemeliharaan terencana Maskom agar layanan tetap stabil tanpa mengganggu operasional bisnis.</p>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">Agenda Terdekat</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {jadwalPemeliharaan.map((agenda) => (
              <div key={`${agenda.tanggal}-${agenda.layanan}`} className="col-md-4">
                <div className="border rounded-3 h-100 p-3">
                  <p className="text-uppercase text-muted small mb-1">{agenda.tanggal}</p>
                  <h6 className="mb-2">{agenda.layanan}</h6>
                  <p className="mb-2 text-muted small">{agenda.waktu}</p>
                  <span className={`badge ${agenda.status === "Terjadwal" ? "bg-success" : agenda.status === "Perlu konfirmasi" ? "bg-warning text-dark" : "bg-info text-dark"}`}>
                    {agenda.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h5 className="mb-3">Checklist Pelaksanaan</h5>
      <div className="progress mb-4" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={currentStep}>
        <div
          className="progress-bar"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        ></div>
      </div>
      <div className="step-content">
        <h4>{steps[currentStep - 1].title}</h4>
        <p>{steps[currentStep - 1].content}</p>
        <ul className="list-unstyled">
          {steps[currentStep - 1].checklist.map((item) => (
            <li key={item} className="d-flex align-items-start mb-2">
              <i className="fas fa-check-circle text-success me-2 mt-1"></i>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="step-navigation">
        <button
          className="btn btn-secondary"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Sebelumnya
        </button>
        <button className="btn btn-primary ms-2" onClick={nextStep}>
          {currentStep === steps.length ? "Selesai" : "Selanjutnya"}
        </button>
      </div>
    </div>
  );
};

export default AIAutomation;