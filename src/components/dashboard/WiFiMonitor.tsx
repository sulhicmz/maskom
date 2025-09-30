const koneksiCabang = [
  { id: 1, lokasi: "Kantor Pusat", status: "Aktif", bandwidth: "200 Mbps", latency: "8 ms", availability: "99,92%" },
  { id: 2, lokasi: "Cabang Bandung", status: "Degradasi", bandwidth: "120 Mbps", latency: "18 ms", availability: "99,40%" },
  { id: 3, lokasi: "Gudang Surabaya", status: "Aktif", bandwidth: "80 Mbps", latency: "12 ms", availability: "99,80%" },
];

const incidentAktif = [
  { id: "INC-2403", judul: "Penurunan bandwidth Cabang Bandung", tingkat: "Sedang", pembaruan: "Terakhir 45 menit lalu" },
  { id: "INC-2404", judul: "Monitoring suhu rak perangkat", tingkat: "Rendah", pembaruan: "Terakhir 2 jam lalu" },
];

const metrikSla = [
  { label: "Ketersediaan 7 hari", nilai: "99,76%" },
  { label: "Incident kritikal bulan ini", nilai: "1 kasus" },
  { label: "Rata-rata respon", nilai: "11 menit" },
  { label: "Perangkat termonitor", nilai: "128 perangkat" },
];

const WiFiMonitor = () => {
  return (
    <div className="wifi-monitor">
      <h2 className="mb-3">Monitoring Koneksi</h2>
      <p className="text-muted mb-4">Ringkasan performa konektivitas seluruh lokasi Maskom. Data diperbarui otomatis dari Network Operation Center setiap 5 menit.</p>

      <div className="row g-3 mb-4">
        {metrikSla.map((item) => (
          <div key={item.label} className="col-sm-6 col-xl-3">
            <div className="card h-100 shadow-sm border-0">
              <div className="card-body">
                <p className="mb-1 text-uppercase text-muted small">{item.label}</p>
                <h4 className="mb-0 fw-semibold">{item.nilai}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mb-4 shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Status Koneksi Lokasi</h5>
          <span className="badge bg-success">Pemantauan 24/7</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Lokasi</th>
                  <th>Status</th>
                  <th>Bandwidth</th>
                  <th>Latency</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody>
                {koneksiCabang.map((cabang) => (
                  <tr key={cabang.id}>
                    <td className="fw-semibold">{cabang.lokasi}</td>
                    <td>
                      <span
                        className={`badge ${cabang.status === "Aktif" ? "bg-success" : cabang.status === "Degradasi" ? "bg-warning text-dark" : "bg-secondary"}`}
                      >
                        {cabang.status}
                      </span>
                    </td>
                    <td>{cabang.bandwidth}</td>
                    <td>{cabang.latency}</td>
                    <td>{cabang.availability}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white">
              <h5 className="mb-0">Incident Berjalan</h5>
            </div>
            <div className="card-body">
              {incidentAktif.map((incident) => (
                <div key={incident.id} className="border rounded-3 p-3 mb-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-primary">{incident.id}</span>
                    <span className="badge text-bg-light text-muted border">{incident.tingkat}</span>
                  </div>
                  <h6 className="mb-2">{incident.judul}</h6>
                  <p className="mb-0 text-muted small">{incident.pembaruan}</p>
                </div>
              ))}
              <p className="mb-0 text-muted small">Detail lengkap tersedia di portal tiket Maskom.</p>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-header bg-white">
              <h5 className="mb-0">Catatan Operasional</h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-3">
                  <h6 className="mb-1">Pemeriksaan failover mingguan</h6>
                  <p className="text-muted small mb-0">Simulasi failover otomatis berhasil pada 13 Maret 2024. Tidak ditemukan anomali.</p>
                </li>
                <li className="mb-3">
                  <h6 className="mb-1">Pembaruan firmware perangkat CPE</h6>
                  <p className="text-muted small mb-0">Proses pembaruan untuk 18 perangkat selesai. 2 perangkat dijadwalkan ulang karena jadwal cabang.</p>
                </li>
                <li>
                  <h6 className="mb-1">Rencana peningkatan kapasitas</h6>
                  <p className="text-muted small mb-0">Bandwidth Cabang Makassar akan ditingkatkan ke 150 Mbps pada 21 Maret 2024.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WiFiMonitor;