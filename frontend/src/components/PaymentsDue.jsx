import "../styles/PaymentsDue.css";

export default function PaymentsDue({ loading = false, items = [] }) {
  const money = (n) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number(n || 0));

  return (
    <div className="payments-card card">
      <div className="card-title">
        <h3>Payments Due</h3>
        <span className="pill">{loading ? "..." : items.length}</span>
      </div>

      {loading ? (
        <p className="muted">Loading...</p>
      ) : items.length === 0 ? (
        <p className="muted">No pending payments 🎉</p>
      ) : (
        <div className="payments-list">
          {items.slice(0, 5).map((p) => (
            <div className="pay-row" key={p.id}>
              <div className="pay-left">
                <div className="pay-name">{p.name}</div>
                <div className={`pay-status ${p.status === "Overdue" ? "overdue" : "dueSoon"}`}>
                  {p.status === "Overdue" ? `Overdue (${p.days} days)` : "Due soon"}
                </div>
              </div>

              <div className="pay-right">
                <div className="pay-amt">₹ {money(p.outstanding)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
