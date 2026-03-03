import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/Payment.css";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation(); // ✅ get person from previous page
  const person = state?.person;    // ✅ person data passed from Payment page

  const [play, setPlay] = useState(false);

  const dots = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        id: i,
        left: Math.floor(Math.random() * 90) + 5,
        top: Math.floor(Math.random() * 70) + 5,
        delay: (Math.random() * 0.9).toFixed(2),
        size: Math.floor(Math.random() * 8) + 6
      })),
    []
  );

  useEffect(() => {
    const t = setTimeout(() => setPlay(true), 60);
    return () => clearTimeout(t);
  }, []);

  // ✅ helper: "₹ 4,000" -> 4000
  const parseRupee = (s = "") =>
    Number(String(s).replace(/[^\d.]/g, "")) || 0;

  // ✅ helper: date like "08.02.26"
  const formatDateDDMMYY = (d = new Date()) => {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}.${mm}.${yy}`;
  };

  const goMoneyTransactions = () => {
    // if person missing, still go safely
    if (!person) {
      navigate("/money", { state: { tab: "transactions" } });
      return;
    }

    const amount = parseRupee(person.due); // from your Money list (due)
    navigate("/money", {
      state: {
        tab: "transactions",
        paidPerson: person,
        paidAmount: amount,
        paidDate: formatDateDDMMYY(new Date())
      }
    });
  };

  const goUpcoming = () => {
    navigate("/money", { state: { tab: "upcoming" } });
  };

  return (
    <div className={`pay-success-page ${play ? "play" : ""}`}>
      <div className="ps-dots" aria-hidden="true">
        {dots.map((d) => (
          <span
            key={d.id}
            className="ps-dot"
            style={{
              left: `${d.left}%`,
              top: `${d.top}%`,
              width: `${d.size}px`,
              height: `${d.size}px`,
              animationDelay: `${d.delay}s`
            }}
          />
        ))}
      </div>

      <div className="ps-top">
        <button className="ps-back" onClick={() => navigate(-1)} aria-label="Back">
          ←
        </button>
        <h3>Payment</h3>
        <div className="ps-ghost" />
      </div>

      <div className="ps-card">
        <div className="ps-badge">
          <div className="ps-badge-inner">
            <svg className="ps-check" width="54" height="54" viewBox="0 0 52 52" fill="none">
              <path
                d="M14 27.2L22.2 35.4L39 18.6"
                stroke="white"
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="ps-ring" />
          <div className="ps-ring ps-ring2" />
        </div>

        <div className="ps-text">
          <h2>Payment Successful</h2>
          <p>Your payment has been completed safely.</p>

          {/* ✅ optional: show who paid */}
          {person?.name && (
            <p style={{ marginTop: 10, opacity: 0.85 }}>
              Paid to <b>{person.name}</b>
            </p>
          )}
        </div>

        <div className="ps-actions">
          <button className="ps-btn primary" onClick={goMoneyTransactions}>
            Back to Money
          </button>

          <button className="ps-btn ghost" onClick={goUpcoming}>
            View Upcoming
          </button>
        </div>
      </div>

      <div className="ps-footer">
        <span className="ps-chip">✓ Secured</span>
        <span className="ps-chip">Instant</span>
        <span className="ps-chip">Receipt ready</span>
      </div>
    </div>
  );
}
