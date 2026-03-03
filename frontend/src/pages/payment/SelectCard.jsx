import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/Payment.css";

export default function SelectCard() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const person = state?.person;

  const [selectedId, setSelectedId] = useState("c1");
  const [play, setPlay] = useState(false);

  // ✅ toast message
  const [toast, setToast] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setPlay(true), 50);
    return () => clearTimeout(t);
  }, []);

  // ✅ base cards
  const baseCards = useMemo(
    () => [
      { id: "c1", bank: "HDFC Bank", type: "Debit Card", last4: "4589", brand: "VISA" },
      { id: "c2", bank: "SBI Bank", type: "Debit Card", last4: "9021", brand: "RuPay" }
    ],
    []
  );

  // ✅ NOW cards are state (can change)
  const [cards, setCards] = useState(baseCards);

  // ✅ When AddCard returns with state.newCard, add it to list
  useEffect(() => {
    if (!state?.newCard) return;

    const newCard = state.newCard;

    setCards((prev) => {
      const exists = prev.some((c) => c.id === newCard.id);
      if (exists) return prev;
      return [newCard, ...prev];
    });

    setSelectedId(newCard.id);

    setToast("Card saved successfully ✅");
    const t = setTimeout(() => setToast(""), 2000);

    // ✅ clear state so it won't re-add on refresh
    navigate("/payment/select-card", { replace: true, state: { person } });

    return () => clearTimeout(t);
  }, [state, navigate, person]);

  const goNext = () => {
    const selected = cards.find((c) => c.id === selectedId);
    navigate("/payment/pin", { state: { person, card: selected } });
  };

  return (
    <div className={`ps-select-page ${play ? "play" : ""}`}>
      {/* ✅ toast */}
      {toast && <div className="toast">{toast}</div>}

      <div className="ps-top">
        <button className="ps-back" onClick={() => navigate(-1)} aria-label="Back">
          ←
        </button>
        <h3>Select Card</h3>
        <div className="ps-ghost" />
      </div>

      <div className="sc-wrap">
        <div className="sc-card">
          <div className="sc-head">
            <div>
              <h4>Choose a card</h4>
              <p>Select one card to continue payment.</p>
            </div>
            <span className="sc-pill">Secure</span>
          </div>

          <div className="sc-list">
            {cards.map((c) => {
              const active = c.id === selectedId;
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`sc-item ${active ? "active" : ""}`}
                  onClick={() => setSelectedId(c.id)}
                >
                  <div className="sc-left">
                    <div className="sc-icon" aria-hidden="true">💳</div>

                    <div className="sc-info">
                      <div className="sc-title">
                        <span className="sc-bank">{c.bank}</span>
                        <span className="sc-brand">{c.brand}</span>
                      </div>
                      <div className="sc-sub">
                        {c.type} • •••• {c.last4}
                      </div>
                    </div>
                  </div>

                  <div className="sc-right">
                    <span className={`sc-radio ${active ? "on" : ""}`} />
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="sc-add"
            onClick={() => navigate("/payment/add-card", { state: { person } })}
          >
            + Add New Card
          </button>

          <div className="sc-actions">
            <button className="ps-btn ghost" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button className="ps-btn primary" onClick={goNext}>
              Continue
            </button>
          </div>
        </div>

        <div className="sc-note">Tip: You can add multiple cards and switch anytime.</div>
      </div>
    </div>
  );
}
