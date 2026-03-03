import { useMemo, useState } from "react";
import BottomNav from "./components/BottomNav";
import "./InterestCalculator.css";

function InterestCalculator() {
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("3");

  // New features
  const [frequency, setFrequency] = useState("Monthly");
  const [interestType, setInterestType] = useState("Simple Interest");
  const [periodMonths, setPeriodMonths] = useState("10");
  const [startDate, setStartDate] = useState("");

  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const inr = (n) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(
      Number(n || 0)
    );

  const calc = useMemo(() => {
    const P = toNum(principal);
    const r = toNum(rate);
    const m = toNum(periodMonths);

    // Simple Interest monthly calculation
    const interest = (P * r * m) / 1200;

    const totalPayable = P + interest;

    // Rough per month estimate
    const perMonth = m > 0 ? totalPayable / m : 0;

    return { interest, totalPayable, perMonth, P, m, r };
  }, [principal, rate, periodMonths]);

  return (
    <div className="ic-page">
      <div className="ic-wrap">
        {/* Top Summary Card */}
        <div className="ic-summary">
          <div className="ic-summary-top">
            <div>
              <p className="ic-muted">Net interest</p>
              <h2 className="ic-green">₹ {inr(calc.interest)}</h2>
            </div>

            <div className="ic-right">
              <div className="ic-miniRow">
                <span className="ic-muted">Loan amount</span>
                <b>₹ {inr(calc.P)}</b>
              </div>
              <div className="ic-miniRow">
                <span className="ic-muted">Total payable</span>
                <b className="ic-green">₹ {inr(calc.totalPayable)}</b>
              </div>
            </div>
          </div>

          <div className="ic-divider" />

          <div className="ic-period">
            <span>
              Total period: <b className="ic-green">{calc.m} months</b>
            </span>
            <span className="ic-muted">
              ( ₹ {inr(calc.perMonth)} / month )
            </span>
          </div>
        </div>

        {/* Inputs */}
        <div className="ic-form">
          <div className="ic-row">
            <label>Primary amount</label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="Enter amount"
            />
          </div>

          <div className="ic-row ic-split">
            <label>Interest</label>
            <div className="ic-inputRightIcon">
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="Rate"
              />
              <span className="ic-icon">%</span>
            </div>
          </div>

          <div className="ic-row">
            <label>Interest frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Yearly</option>
            </select>
          </div>

          <div className="ic-row">
            <label>Interest type</label>
            <select
              value={interestType}
              onChange={(e) => setInterestType(e.target.value)}
            >
              <option>Simple Interest</option>
              <option>Compound Interest</option>
            </select>
          </div>

          <div className="ic-row">
            <label>Interest period (Months)</label>
            <div className="ic-inputRightIcon">
              <input
                type="number"
                value={periodMonths}
                onChange={(e) => setPeriodMonths(e.target.value)}
                placeholder="Months"
              />
              <span className="ic-icon">📅</span>
            </div>
          </div>

          {/* Optional start date (nice feature) */}
          <div className="ic-row">
            <label>Start date (optional)</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ✅ Bottom Navigation always visible */}
      <BottomNav />
    </div>
  );
}

export default InterestCalculator;
