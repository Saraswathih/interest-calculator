import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Portfolio.css";
import BottomNav from "../components/BottomNav";

import { fetchTransactions } from "../api/transactions";
import { fetchInvestors } from "../api/investors";

export default function Portfolio() {
  const navigate = useNavigate();

  const [txns, setTxns] = useState([]);
  const [investors, setInvestors] = useState([]);

  const [loadingTx, setLoadingTx] = useState(true);
  const [loadingInv, setLoadingInv] = useState(true);

  const [q, setQ] = useState("");

  const money = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(Number(n || 0));

  // ✅ Load transactions
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchTransactions();
        setTxns(Array.isArray(data) ? data : []);
      } catch (e) {
        setTxns([]);
      } finally {
        setLoadingTx(false);
      }
    };
    load();
  }, []);

  // ✅ Load investors
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchInvestors();
        setInvestors(Array.isArray(data) ? data : []);
      } catch (e) {
        setInvestors([]);
      } finally {
        setLoadingInv(false);
      }
    };
    load();
  }, []);

  // ✅ Helpers
  const isCustomerTxn = (t) => !!t.customerId;
  const isInvestorTxn = (t) => !!t.investorId;

  const safeNum = (x) => Number(x || 0);

  // ✅ Portfolio summary (REAL formulas)
  const summary = useMemo(() => {
    const all = txns || [];

    // CUSTOMER flows
    let customerGiven = 0; // (loan out) includes interest using totalAmount
    let customerTaken = 0; // (repayment in)

    // INVESTOR flows
    let investorGiven = 0; // (money investor gave you)
    let investorTaken = 0; // (money you paid back to investor)

    let totalInterest = 0;

    for (const t of all) {
      const type = String(t.type || "").trim();
      const amt = safeNum(t.amount);
      const total = safeNum(t.totalAmount || t.amount);
      const interest = safeNum(t.interestAmount);

      totalInterest += interest;

      if (isCustomerTxn(t)) {
        if (type === "Given") customerGiven += total; // include interest
        if (type === "Taken") customerTaken += amt;
      }

      if (isInvestorTxn(t)) {
        if (type === "Given") investorGiven += amt;
        if (type === "Taken") investorTaken += amt;
      }
    }

    // ✅ Outstanding to receive from customers
    const receivableOutstanding = Math.max(0, customerGiven - customerTaken);

    // ✅ Cash available in hand
    const cashAvailable = investorGiven + customerTaken - (customerGiven + investorTaken);

    // Extra totals for cards
    const totalGiven = customerGiven + investorTaken; // outflow (customer loans + paid back to investors)
    const totalTaken = customerTaken + investorGiven; // inflow (customer repayments + investor money)

    return {
      cashAvailable,
      receivableOutstanding,
      totalGiven,
      totalTaken,
      totalInterest
    };
  }, [txns]);

  // ✅ Months calc (for investor performance)
  const monthsBetween = (start) => {
    const d = new Date(start);
    if (Number.isNaN(d.getTime())) return 1;
    const now = new Date();
    const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
    const m = Math.floor(days / 30);
    return Math.max(1, m);
  };

  // ✅ Investor performance dynamic
  const investorPerformance = useMemo(() => {
    const redeemedByInvestorId = new Map();

    for (const t of txns || []) {
      if (!t.investorId) continue;

      const id = typeof t.investorId === "object" ? t.investorId._id : t.investorId;
      if (!id) continue;

      if (t.type === "Taken") {
        redeemedByInvestorId.set(
          String(id),
          (redeemedByInvestorId.get(String(id)) || 0) + safeNum(t.amount)
        );
      }
    }

    const rows = (investors || []).map((inv) => {
      const principal = safeNum(inv.investedAmount);
      const rate = safeNum(inv.monthlyReturnRate);
      const months = monthsBetween(inv.startDate);

      const expectedReturn = (principal * rate * months) / 100; // till now
      const redeemed = safeNum(redeemedByInvestorId.get(String(inv._id)) || 0);
      const payable = Math.max(0, expectedReturn - redeemed);

      return {
        _id: inv._id,
        name: inv.name,
        principal,
        rate,
        months,
        payable
      };
    });

    // highest payable first
    return rows.sort((a, b) => b.payable - a.payable);
  }, [investors, txns]);

  // ✅ Search filter + suggestions
  const searchText = (q || "").trim().toLowerCase();

  const investorSuggestions = useMemo(() => {
    if (!searchText) return [];
    return (investors || [])
      .filter((i) => (i.name || "").toLowerCase().includes(searchText))
      .slice(0, 6);
  }, [investors, searchText]);

  const filteredInvestorPerf = useMemo(() => {
    if (!searchText) return investorPerformance;
    return (investorPerformance || []).filter((x) =>
      (x.name || "").toLowerCase().includes(searchText)
    );
  }, [investorPerformance, searchText]);

  const loading = loadingTx || loadingInv;

  const openInvestorsPage = (name = "") => {
    // ✅ opens Investors tab page (you can adjust route if your app uses different one)
    navigate("/investments", { state: { tab: "investors", search: name } });
  };

  const onPickSuggestion = (inv) => {
    setQ(inv.name);
    openInvestorsPage(inv.name);
  };

  return (
    <div className="portfolio-wrapper">
      <div className="portfolio-page">
        {/* HEADER */}
        <div className="portfolio-header">
          <h2>Portfolio Overview</h2>
          <p className="subtitle">Your investments & performance summary</p>
        </div>

        {/* SEARCH */}
        <div className="portfolio-search" style={{ position: "relative" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search investor or keyword..."
          />
          <button className="filter-btn" type="button" onClick={() => openInvestorsPage(q)}>
            ⎚
          </button>

          {/* ✅ Suggestions dropdown */}
          {investorSuggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "100%",
                marginTop: 8,
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 14,
                boxShadow: "0 18px 50px rgba(0,0,0,0.12)",
                overflow: "hidden",
                zIndex: 50
              }}
            >
              {investorSuggestions.map((inv) => (
                <button
                  key={inv._id}
                  type="button"
                  onClick={() => onPickSuggestion(inv)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 14px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer"
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{inv.name}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    ₹{new Intl.NumberFormat("en-IN").format(safeNum(inv.investedAmount))} • {inv.monthlyReturnRate}% / month
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SUMMARY CARDS */}
        <div className="top-cards">
          <div className="small-card highlight">
            <p className="label">Cash Available</p>
            <p className="value">
              {loading ? "Loading..." : money(summary.cashAvailable)}
            </p>

            {/* ✅ If negative, show warning label */}
            {summary.cashAvailable < 0 ? (
              <span className="chip red">Low Cash</span>
            ) : (
              <span className="chip green">Live</span>
            )}
          </div>

          <div className="small-card">
            <p className="label">Outstanding (To Receive)</p>
            <p className="value red">
              {loading ? "Loading..." : money(summary.receivableOutstanding)}
            </p>
            <span className="chip red">Receivable</span>
          </div>
        </div>

        {/* EXTRA SUMMARY */}
        <div className="top-cards">
          <div className="small-card">
            <p className="label">Total Given</p>
            <p className="value">
              {loading ? "Loading..." : money(summary.totalGiven)}
            </p>
            <span className="chip">Outflow</span>
          </div>

          <div className="small-card">
            <p className="label">Total Taken</p>
            <p className="value blue">
              {loading ? "Loading..." : money(summary.totalTaken)}
            </p>
            <span className="chip">Inflow</span>
          </div>
        </div>

        {/* INTEREST SUMMARY */}
        <div className="section-card">
          <div className="section-title-row">
            <h3>Interest Summary</h3>
            <button className="pill-btn" type="button">
              View
            </button>
          </div>

          <p className="label">Total Interest Generated</p>
          <p className="value blue">
            {loading ? "Loading..." : money(summary.totalInterest)}
          </p>

          <div style={{ marginTop: 10, opacity: 0.75, fontSize: 13 }}>
            Tip: Add some <b>Customer Taken</b> repayments to increase Cash Available.
          </div>
        </div>

        {/* ✅ INVESTOR PERFORMANCE (DYNAMIC) */}
        <div className="section-card">
          <div className="section-title-row">
            <h3>Investor Performance</h3>
            <button className="link-btn" type="button" onClick={() => openInvestorsPage(q)}>
              View all
            </button>
          </div>

          {loading ? (
            <p style={{ opacity: 0.75 }}>Loading investors...</p>
          ) : filteredInvestorPerf.length === 0 ? (
            <p style={{ opacity: 0.75 }}>No investors found.</p>
          ) : (
            <div className="list">
              {filteredInvestorPerf.slice(0, 5).map((inv) => (
                <div
                  className="list-item"
                  key={inv._id}
                  style={{ cursor: "pointer" }}
                  onClick={() => openInvestorsPage(inv.name)}
                >
                  <div className="avatar">{(inv.name || "I")[0]}</div>

                  <div className="info">
                    <div className="name">{inv.name}</div>
                    <div className="date">
                      {inv.months} months • {inv.rate}% / month
                    </div>
                  </div>

                  <div className="right">
                    <div className="amt">{money(inv.payable)}</div>
                    <div className="pct">payable</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
