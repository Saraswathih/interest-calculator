import { useNavigate, useParams, useLocation } from "react-router-dom";
import "../../styles/Payment.css";

export default function Payment() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();

  const due = state?.person?.due || "₹ 3,000";

  return (
    <div className="payment-page">
      <div className="payment-top">
        <button className="back-mini" onClick={() => navigate(-1)}>←</button>
        <h3>My Loan</h3>
        <div className="ghost" />
      </div>

      <div className="payment-card">
        <div className="pay-user">
          <div className="pay-avatar">{(state?.person?.name || "S")[0]}</div>
          <div>
            <div className="pay-name">{state?.person?.name || "Customer"}</div>
            <div className="muted">Reference Number</div>
          </div>
          <div className="ref">#7588900{id}</div>
        </div>

        <div className="pay-grid">
          <div className="pay-item">
            <div className="muted">Next Due Date</div>
            <strong>25 Aug, 2025</strong>
          </div>
          <div className="pay-item">
            <div className="muted">Loan Tenure</div>
            <strong>18 months</strong>
          </div>
          <div className="pay-item">
            <div className="muted">Interest Rate</div>
            <strong>0.5%</strong>
          </div>
          <div className="pay-item">
            <div className="muted">Monthly Installment</div>
            <strong className="red">{due}</strong>
          </div>
        </div>

        <button
  className="primary-btn"
  onClick={() =>
    navigate("/payment/select-card", {
      state: { person: state?.person }
    })
  }
>
  Pay Now
</button>

      </div>
    </div>
  );
}
