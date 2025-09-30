const tiketAktif = [
  { id: "REQ-1098", topik: "Penambahan VLAN gudang Surabaya", status: "Dalam proses", penanggungJawab: "Tim Network", pembaruan: "1 jam lalu" },
  { id: "REQ-1102", topik: "Penjadwalan upgrade firewall pusat", status: "Menunggu konfirmasi", penanggungJawab: "Service Delivery", pembaruan: "3 jam lalu" },
  { id: "REQ-1104", topik: "Permintaan akses portal untuk cabang baru", status: "Selesai", penanggungJawab: "Support Maskom", pembaruan: "Kemarin" },
];

const kunjunganLapangan = [
  { tanggal: "15 Mar 2024", lokasi: "Cabang Bandung", aktivitas: "Optimasi access point lantai 3", engineer: "Andi - Field Engineer" },
  { tanggal: "18 Mar 2024", lokasi: "Gudang Surabaya", aktivitas: "Penggantian router cadangan", engineer: "Rina - Resident Engineer" },
  { tanggal: "22 Mar 2024", lokasi: "Kantor Makassar", aktivitas: "Instalasi link backup VSAT", engineer: "Hasan - Project Team" },
];

const WebsiteBuilder = () => {
  return (
    <div className="website-builder">
      <h2 className="mb-3">Tiket Dukungan</h2>
      <p className="text-muted mb-4">Kelola permintaan layanan, pantau progres, dan jadwalkan kunjungan engineer Maskom langsung dari portal.</p>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Ringkasan Tiket</h5>
          <span className="badge bg-primary">3 tiket aktif</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID Tiket</th>
                  <th>Topik</th>
                  <th>Status</th>
                  <th>Penanggung Jawab</th>
                  <th>Pembaruan Terakhir</th>
                </tr>
              </thead>
              <tbody>
                {tiketAktif.map((tiket) => (
                  <tr key={tiket.id}>
                    <td className="fw-semibold">{tiket.id}</td>
                    <td>{tiket.topik}</td>
                    <td>
                      <span className={`badge ${tiket.status === "Selesai" ? "bg-success" : tiket.status === "Dalam proses" ? "bg-warning text-dark" : "bg-info text-dark"}`}>
                        {tiket.status}
                      </span>
                    </td>
                    <td>{tiket.penanggungJawab}</td>
                    <td>{tiket.pembaruan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Jadwal Kunjungan Engineer</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                {kunjunganLapangan.map((kegiatan) => (
                  <li key={`${kegiatan.tanggal}-${kegiatan.lokasi}`} className="list-group-item px-0">
                    <h6 className="mb-1">{kegiatan.tanggal} • {kegiatan.lokasi}</h6>
                    <p className="mb-1 text-muted small">{kegiatan.aktivitas}</p>
                    <span className="badge text-bg-light border">{kegiatan.engineer}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white">
              <h5 className="mb-0">Buat Permintaan Baru</h5>
            </div>
            <div className="card-body">
              <form onSubmit={(event) => event.preventDefault()}>
                <div className="mb-3">
                  <label htmlFor="kategori" className="form-label">Kategori layanan</label>
                  <select id="kategori" className="form-select">
                    <option>Insiden layanan</option>
                    <option>Permintaan perubahan</option>
                    <option>Penjadwalan kunjungan</option>
                    <option>Permintaan laporan</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="judul" className="form-label">Judul permintaan</label>
                  <input id="judul" type="text" className="form-control" placeholder="Contoh: Aktivasi VLAN baru untuk lantai 5" />
                </div>
                <div className="mb-3">
                  <label htmlFor="deskripsi" className="form-label">Deskripsi</label>
                  <textarea id="deskripsi" className="form-control" rows={4} placeholder="Tuliskan kronologi singkat, lokasi, dan kontak onsite."></textarea>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">Tim support akan merespons maksimal 15 menit untuk tiket prioritas.</small>
                  <button type="submit" className="btn btn-primary">Kirim Permintaan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteBuilder;