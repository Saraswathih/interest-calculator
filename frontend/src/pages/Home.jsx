import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import ReadyToRedeem from "../components/ReadyToRedeem";
import PaymentsDue from "../components/PaymentsDue";
import InvestorPerformance from "../components/InvestorPerformance";
import BottomNav from "../components/BottomNav";

import { fetchTransactions } from "../api/transactions";
import "../styles/Home.css";
import { fetchInvestors } from "../api/investors";

function Home() {
  const navigate = useNavigate();

  const [customerName] = useState("Saraswathi");
  const [searchTerm, setSearchTerm] = useState("");

  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [txError, setTxError] = useState("");
  const [investors, setInvestors] = useState([]);
  const [loadingInv, setLoadingInv] = useState(true);


  // ✅ Format money nicely
  const money = (n) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(
      Number(n || 0)
    );

  // ✅ Format date
  const fmtDate = (d) => {
    if (!d) return "-";
    const s = String(d);
    return s.length >= 10 ? s.slice(0, 10) : s;
  };

  // ✅ Always return a safe string for customer display
  const getCustomerLabel = (customerId) => {
    if (!customerId) return "-";

    // populated customer object: { _id, name, ... }
    if (typeof customerId === "object") {
      return customerId?.name || customerId?._id || "-";
    }

    // plain id string
    return String(customerId);
  };

  // ✅ Load transactions from backend
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchTransactions();
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setTxError(err.message || "Failed to load transactions");
      } finally {
        setLoadingTx(false);
      }
    };

    load();
  }, []);
  useEffect(() => {
  const loadInv = async () => {
    try {
      setLoadingInv(true);
      const data = await fetchInvestors();
      setInvestors(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setInvestors([]);
    } finally {
      setLoadingInv(false);
    }
  };

  loadInv();
}, []);


  // ✅ Filter transactions by search
  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;

    const s = searchTerm.toLowerCase();

    return transactions.filter((t) => {
      const customerText = getCustomerLabel(t.customerId).toLowerCase();
      const type = String(t.type || "").toLowerCase();
      const amount = String(t.amount || "").toLowerCase();

      return customerText.includes(s) || type.includes(s) || amount.includes(s);
    });
  }, [transactions, searchTerm]);

  // ✅ Summary totals (based on filtered list)
  const summary = useMemo(() => {
    let totalGiven = 0;
    let totalTaken = 0;
    let totalInterest = 0;

    for (const t of filteredTransactions) {
      const amount = Number(t.amount || 0);
      const interest = Number(t.interestAmount || 0);

      if (t.type === "Given") totalGiven += amount;
      else totalTaken += amount;

      totalInterest += interest;
    }

    return {
      count: filteredTransactions.length,
      totalGiven,
      totalTaken,
      totalInterest
    };
  }, [filteredTransactions]);

  // ✅ NEW: Dashboard money for "Available Amount" + "Total invested"
  // Uses ALL transactions (not filtered), so dashboard stays correct.
  // const dashboardMoney = useMemo(() => {
  //   const txns = transactions || [];

  //   const sum = (filterFn) =>
  //     txns.filter(filterFn).reduce((s, t) => s + (Number(t.amount) || 0), 0);

  //   // Investor cash flow
  //   const investorGiven = sum((t) => t.investorId && t.type === "Given");
  //   const investorTaken = sum((t) => t.investorId && t.type === "Taken");

  //   // Customer cash flow
  //   const customerGiven = sum((t) => t.customerId && t.type === "Given");
  //   const customerTaken = sum((t) => t.customerId && t.type === "Taken");

  //   // Cash in/out
  //   const inflow = investorGiven + customerTaken;  // money coming to you
  //   const outflow = customerGiven + investorTaken; // money going out

  //   const available = inflow - outflow;
  //   const totalInvested = investorGiven - investorTaken;

  //   return {
  //     available: available < 0 ? 0 : available,         // optional clamp
  //     totalInvested: totalInvested < 0 ? 0 : totalInvested
  //   };
  // }, [transac tions]);
     // ✅ Available Amount = Outstanding amount to receive from customers
const dashboardMoney = useMemo(() => {
  const txns = transactions || [];

  let given = 0;
  let taken = 0;

  for (const t of txns) {
    if (!t.customerId) continue;

    if (t.type === "Given") {
      // totalAmount includes interest if present
      given += Number(t.totalAmount || t.amount || 0);
    }

    if (t.type === "Taken") {
      taken += Number(t.amount || 0);
    }
  }

  const available = given - taken;

  return {
    available,
    totalInvested: given // optional, we can rename later
  };
}, [transactions]);

  // ✅ NEW: Payments Due (dynamic)
  const paymentsDue = useMemo(() => {
  const txns = transactions || [];

  const map = new Map();
  const now = new Date();

  const getKeyName = (customerId) => {
    if (!customerId) return { key: null, name: "-" };

    if (typeof customerId === "object") {
      return {
        key: String(customerId._id || ""),
        name: customerId.name || String(customerId._id || "-")
      };
    }

    return { key: String(customerId), name: String(customerId) };
  };

  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  const daysBetween = (d1, d2) =>
    Math.floor((d2.getTime() - d1.getTime()) / 86400000);

  for (const t of txns) {
    if (!t.customerId) continue;

    const { key, name } = getKeyName(t.customerId);
    if (!key) continue;

    if (!map.has(key)) {
      map.set(key, { id: key, name, outstanding: 0, nextDueDate: null });
    }

    const row = map.get(key);

    // ✅ Given = loan, Taken = repayment
    if (t.type === "Given") {
      row.outstanding += Number(t.totalAmount || t.amount || 0);

      // ✅ calculate due date using durationMonths
      const start = new Date(t.startDate);
      const months = Number(t.durationMonths || 0);

      if (!Number.isNaN(start.getTime()) && months > 0) {
        const due = addDays(start, months * 30);

        // keep earliest upcoming due date
        if (!row.nextDueDate || due < row.nextDueDate) row.nextDueDate = due;
      }
    } else if (t.type === "Taken") {
      row.outstanding -= Number(t.amount || 0);
    }
  }

  const items = Array.from(map.values())
    .filter((r) => r.outstanding > 0 && r.nextDueDate) // ✅ must have due date
    .map((r) => {
      const dueInDays = daysBetween(now, r.nextDueDate);

      // ✅ remove overdue completely
      if (dueInDays < 0) return null;

      let status = "Upcoming";

      if (dueInDays === 0) status = "Today";
      else if (dueInDays <= 7) status = "Due Soon";

      return {
        id: r.id,
        name: r.name,
        outstanding: r.outstanding,
        status,
        days: dueInDays
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.days - b.days); // ✅ show nearest first

  return { items };
}, [transactions]);


   const investorPerformance = useMemo(() => {
  const safeDate = (s) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  };

  // ✅ better months calc (works perfectly for demo)
  const monthsBetween = (start) => {
    const d = safeDate(start);
    if (!d) return 1; // fallback demo
    const now = new Date();
    const days = Math.floor((now.getTime() - d.getTime()) / 86400000);
    const m = Math.floor(days / 30);
    return Math.max(1, m); // ✅ always at least 1 month for demo
  };

  // ✅ redeemed = investor transactions type "Taken"
  const redeemedByInvestorId = new Map();
  for (const t of transactions || []) {
    if (!t.investorId) continue;

    const id =
      typeof t.investorId === "object" ? t.investorId._id : t.investorId;

    if (!id) continue;

    if (t.type === "Taken") {
      redeemedByInvestorId.set(
        String(id),
        (redeemedByInvestorId.get(String(id)) || 0) + (Number(t.amount) || 0)
      );
    }
  }

  const rows = (investors || []).map((inv) => {
    const principal = Number(inv.investedAmount || 0);
    const rate = Number(inv.monthlyReturnRate || 0);
    const months = monthsBetween(inv.startDate);

    // expected return till now
    const expectedReturn = (principal * rate * months) / 100;

    const redeemed = Number(redeemedByInvestorId.get(String(inv._id)) || 0);

    const payable = Math.max(0, expectedReturn - redeemed);

    return {
      _id: inv._id,
      name: inv.name,
      months,
      rate,

      // ✅ IMPORTANT: add payable field (your UI needs this)
      payable: Math.round(payable),

      // (optional debug fields)
      principal,
      expectedReturn: Math.round(expectedReturn),
      redeemed: Math.round(redeemed)
    };
  });

  // highest payable first
  return rows.sort((a, b) => b.payable - a.payable);
}, [investors, transactions]);


  return (
    <div className="home-container">
      <div className="dashboard-wrapper">
        <Header customerName={customerName} onSearchChange={setSearchTerm} />

        <div className="dashboard-grid">
          {/* LEFT COLUMN */}
          <div>
            {/* ✅ UPDATED: pass dynamic values */}
            <ReadyToRedeem
              availableAmount={dashboardMoney.available}
              totalInvested={dashboardMoney.totalInvested}
              loading={loadingTx}
            />

            <PaymentsDue loading={loadingTx} items={paymentsDue.items} />


            {/* ✅ Add Customer + Add Transaction buttons */}
            <div className="quick-actions-row">
              <button
                className="addCustomerBtn"
                onClick={() => navigate("/add-customer")}
              >
                <span className="plusCircle">+</span>
                <span className="btnText">
                  <b>Add Customer</b>
                  <small>Create customer & lend</small>
                </span>
              </button>

              <button
                className="addTxBtn"
                onClick={() => navigate("/add-transaction")}
              >
                + Add Transactions
              </button>
            </div>

            {/* ✅ Transactions Summary */}
            <div className="tx-card">
              <div className="tx-card-header">
                <div>
                  <h3 className="tx-title">Transactions Summary</h3>
                  <p className="tx-subtitle">
                    Showing <b>{summary.count}</b> transaction(s)
                  </p>
                </div>
              </div>

              {loadingTx ? (
                <p className="tx-muted">Loading transactions...</p>
              ) : txError ? (
                <p className="tx-error">{txError}</p>
              ) : (
                <div className="tx-summary-grid">
                  <div className="tx-summary-item">
                    <span className="tx-label">Total Given</span>
                    <span className="tx-value">₹{money(summary.totalGiven)}</span>
                  </div>

                  <div className="tx-summary-item">
                    <span className="tx-label">Total Taken</span>
                    <span className="tx-value">₹{money(summary.totalTaken)}</span>
                  </div>

                  <div className="tx-summary-item">
                    <span className="tx-label">Total Interest</span>
                    <span className="tx-value">₹{money(summary.totalInterest)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div>
           <InvestorPerformance
  loading={loadingInv || loadingTx}
  items={investorPerformance}
  searchTerm={searchTerm}
/>


            {/* ✅ All Transactions */}
            <div className="tx-card">
              <div className="tx-card-header">
                <div>
                  <h3 className="tx-title">All Transactions</h3>
                  <p className="tx-subtitle">Use the top search bar to filter</p>
                </div>
              </div>

              {loadingTx ? (
                <p className="tx-muted">Loading transactions...</p>
              ) : txError ? (
                <p className="tx-error">{txError}</p>
              ) : filteredTransactions.length === 0 ? (
                <p className="tx-muted">No transactions found.</p>
              ) : (
                <div className="tx-list">
                  {filteredTransactions
                    .slice()
                    .reverse()
                    .map((t) => (
                      <div className="tx-row" key={t._id}>
                        <div className="tx-row-head">
                          <span
                            className={`tx-badge ${
                              t.type === "Given" ? "given" : "taken"
                            }`}
                          >
                            {t.type}
                          </span>

                          <span className="tx-date">{fmtDate(t.startDate)}</span>
                        </div>

                        <div className="tx-row-grid">
                          <div className="tx-kv">
                            <span className="tx-k">Customer</span>
                            <span className="tx-v">
                              {getCustomerLabel(t.customerId)}
                            </span>
                          </div>

                          <div className="tx-kv">
                            <span className="tx-k">Amount</span>
                            <span className="tx-v">₹{money(t.amount)}</span>
                          </div>

                          <div className="tx-kv">
                            <span className="tx-k">Interest</span>
                            <span className="tx-v">₹{money(t.interestAmount)}</span>
                          </div>

                          <div className="tx-kv">
                            <span className="tx-k">Total</span>
                            <span className="tx-v">₹{money(t.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    </div>
  );
}

export default Home;
