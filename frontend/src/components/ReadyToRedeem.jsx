import { useNavigate } from "react-router-dom";
import "../styles/ReadyToRedeem.css";

function ReadyToRedeem({
  availableAmount = 0,
  totalInvested = 0,
  loading = false
}) {
  const navigate = useNavigate();

  // format money safely
  const money = (n) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(
      Number(n || 0)
    );

  return (
    <div className="redeem-card card">
      <div className="card-title">
        <h3>Available Amount</h3>
        <span className="pill">Active</span>
      </div>

      <div className="amount-section">
        <h2>
          {loading ? "Loading..." : `₹ ${money(availableAmount)}`}
        </h2>
        <p className="muted">Ready to redeem</p>
      </div>

      <button
        className="redeem-btn"
        type="button"
        onClick={() => navigate("/investments")}
      >
        Redeem Now
      </button>

      <div className="invested-row">
        <span className="muted">Total invested</span>
        <strong>
          {loading ? "—" : `₹ ${money(totalInvested)}`}
        </strong>
      </div>

      {/* future calculations can come here */}
      <div className="future-space"></div>
    </div>
  );
}

export default ReadyToRedeem;
