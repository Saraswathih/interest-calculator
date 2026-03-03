import { useNavigate } from "react-router-dom";
import "../../styles/Payment.css";

export default function AddCard() {
  const navigate = useNavigate();
  const saveCard = () => {
  const newCard = {
    id: "c" + Date.now(),
    bank,
    type,
    last4: cardNumber.slice(-4),
    brand
  };

  navigate("/payment/select-card", {
    state: { person, newCard }
  });
};


  return (
    <div className="payment-page">
      <div className="payment-top">
        <button className="back-mini" onClick={() => navigate(-1)}>←</button>
        <h3>Card Attach</h3>
        <div className="ghost" />
      </div>

      <div className="payment-card">
        <div className="muted" style={{ marginBottom: 12 }}>
          Add card details to quickly pay.
        </div>

        <label className="field">
          <span>Cardholder Name</span>
          <input placeholder="Enter name" />
        </label>

        <label className="field">
          <span>Card Number</span>
          <input placeholder="Enter number" />
        </label>

        <div className="two">
          <label className="field">
            <span>Expiry</span>
            <input placeholder="MM/YY" />
          </label>

          <label className="field">
            <span>CVV</span>
            <input placeholder="CVV" />
          </label>
        </div>

        <button className="primary-btn" onClick={() => navigate("/payment/pin")}>
          Save
        </button>
      </div>
    </div>
  );
}
