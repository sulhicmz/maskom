const trustedClients = [
  "Bank Nusantara",
  "Prima Logistics",
  "Mega Retail Group",
  "Medika Sejahtera",
  "TransHub Teknologi",
  "Energi Mandiri"
];

const TrustedBy = () => {
  return (
    <section className="trusted-by-section">
      <div className="container">
        <div className="trusted-by-wrapper">
          <p className="label">Dipercaya oleh</p>
          <ul className="trusted-by-list">
            {trustedClients.map((client) => (
              <li key={client} className="trusted-by-item">
                {client}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
