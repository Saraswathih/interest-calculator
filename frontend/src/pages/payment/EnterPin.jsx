import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/Payment.css";

export default function EnterPin() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const person = state?.person; // ✅ received from SelectCard
  const card = state?.card;     // ✅ optional (if you want later)

  const [pin, setPin] = useState("");

  const press = (n) => {
    if (pin.length >= 4) return;
    setPin((p) => p + n);
  };

  const backspace = () => setPin((p) => p.slice(0, -1));

  const verify = () => {
    if (pin.length !== 4) return alert("Enter 4-digit PIN");

    // ✅ go success WITH person (important)
    navigate("/payment/success", { state: { person, card } });
  };

  return (
    <div className="payment-page">
      <div className="payment-top">
        <button className="back-mini" onClick={() => navigate(-1)}>←</button>
        <h3>Enter your PIN</h3>
        <div className="ghost" />
      </div>

      <div className="payment-card">
        <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "14px 0 18px" }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.12)",
                display: "grid",
                placeItems: "center",
                fontSize: 20,
                background: "rgba(255,255,255,0.9)"
              }}
            >
              {pin[i] ? "•" : ""}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[1,2,3,4,5,6,7,8,9].map((n) => (
            <button
              key={n}
              className="primary-btn"
              style={{ height: 48 }}
              onClick={() => press(String(n))}
              type="button"
            >
              {n}
            </button>
          ))}

          <button className="primary-btn" style={{ height: 48 }} onClick={backspace} type="button">
            ⌫
          </button>
          <button className="primary-btn" style={{ height: 48 }} onClick={() => press("0")} type="button">
            0
          </button>
          <button className="primary-btn" style={{ height: 48 }} onClick={verify} type="button">
            Verify
          </button>
        </div>
      </div>
    </div>
  );
}
