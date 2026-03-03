import "../styles/InvestorPerformance.css";

export default function InvestorPerformance({
  loading = false,
  items = [],
  searchTerm = ""
}) {
  const money = (n) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(
      Number(n || 0)
    );

  const q = (searchTerm || "").trim().toLowerCase();
  const filtered = !q
    ? items
    : items.filter((x) => (x.name || "").toLowerCase().includes(q));

  return (
    <div className="inv-card card">
      <div className="card-title">
        <h3>Investor Performance</h3>
        <span className="pill">{loading ? "..." : filtered.length}</span>
      </div>

      {loading ? (
        <p className="muted">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="muted">No investor data yet.</p>
      ) : (
        <div className="inv-list">
          {filtered.slice(0, 5).map((inv) => {
            // ✅ pick the correct payable field (supports all names)
            const payable =
              inv.remaining ??
              inv.payable ??
              inv.amount ??
              inv.due ??
              0;

            // ✅ if months/rate missing, keep safe
            const months = Number(inv.months || 0);
            const rate = Number(inv.rate || 0);

            return (
              <div className="inv-row" key={inv._id}>
                <div className="inv-left">
                  <div className="inv-name">{inv.name}</div>
                  <div className="inv-sub muted">
                    {months} months • {rate}% / month
                  </div>
                </div>

                <div className="inv-right">
                  <div className="inv-main">₹ {money(payable)}</div>
                  <div className="inv-sub muted">Payable</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
