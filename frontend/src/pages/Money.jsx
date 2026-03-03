import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Money.css";

export default function Money() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [tab, setTab] = useState(state?.tab || "upcoming"); // upcoming | outstanding | transactions

  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  const money = (n) =>
    "₹ " +
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
      Number(n || 0)
    );

  const fmtDate = (d) => {
    if (!d) return "-";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d).slice(0, 10);
    return dt.toISOString().slice(0, 10);
  };

  const getName = (objOrId) => {
    if (!objOrId) return "Unknown";
    if (typeof objOrId === "object") return objOrId.name || "Unknown";
    return String(objOrId);
  };

  const getId = (objOrId) => {
    if (!objOrId) return null;
    if (typeof objOrId === "object") return String(objOrId._id || "");
    return String(objOrId);
  };

  // ✅ load real transactions
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/transactions");
        const data = await res.json();
        setTxns(Array.isArray(data) ? data : []);
      } catch (e) {
        console.log("money txns load failed", e);
        setTxns([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ✅ build customer outstanding map from transactions
  const customerDueList = useMemo(() => {
    const map = new Map(); // customerId -> { id, name, outstanding, lastDate }

    for (const t of txns) {
      if (!t.customerId) continue;

      const cid = getId(t.customerId);
      if (!cid) continue;

      if (!map.has(cid)) {
        map.set(cid, {
          id: cid,
          name: getName(t.customerId),
          outstanding: 0,
          lastDate: null
        });
      }

      const row = map.get(cid);

      if (t.type === "Given") {
        row.outstanding += Number(t.totalAmount || t.amount || 0);
      } else if (t.type === "Taken") {
        row.outstanding -= Number(t.amount || 0);
      }

      const sd = new Date(t.startDate);
      if (!Number.isNaN(sd.getTime())) {
        if (!row.lastDate || sd > row.lastDate) row.lastDate = sd;
      }
    }

    // keep only still due > 0
    return Array.from(map.values()).filter((x) => x.outstanding > 0);
  }, [txns]);

  // ✅ upcoming vs outstanding split (based on 30 days)
  const { upcoming, outstanding } = useMemo(() => {
    const now = new Date();
    const daysBetween = (d1, d2) =>
      Math.floor((d2.getTime() - d1.getTime()) / 86400000);

    const up = [];
    const out = [];

    for (const c of customerDueList) {
      const days = c.lastDate ? daysBetween(c.lastDate, now) : 0;

      const item = {
        id: c.id,
        name: c.name,
        note: c.lastDate ? fmtDate(c.lastDate) : "-",
        due: money(c.outstanding),
        late: `${days} days late`,
        days
      };

      if (days > 30) out.push(item);
      else up.push(item);
    }

    // sort (most due first)
    up.sort((a, b) => b.days - a.days);
    out.sort((a, b) => b.days - a.days);

    return { upcoming: up, outstanding: out };
  }, [customerDueList]);

  // ✅ transactions list (show latest 20, include investor + customer)
  const txList = useMemo(() => {
    return (txns || [])
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20)
      .map((t) => {
        const isCustomer = !!t.customerId;
        const who = isCustomer ? getName(t.customerId) : getName(t.investorId);

        return {
          id: t._id,
          name: who,
          whoType: isCustomer ? "Customer" : "Investor",
          type: t.type === "Taken" ? "Received from" : "Paid to",
          amount: money(t.amount || 0),
          date: fmtDate(t.startDate)
        };
      });
  }, [txns]);

  const downloadStatement = () => {
    const rows = txList
      .map((t) => `${t.date},${t.type} ${t.name} (${t.whoType}),${t.amount}`)
      .join("\n");

    const csv = `Date,Transaction,Amount\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "statement.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const goToPayment = (person) => {
    navigate(`/payment/${person.id}`, {
      state: { person: { ...person, due: person.due } }
    });
  };

  return (
    <div className="money-page">
      <div className="money-header">
        <h3>Money</h3>
      </div>

      {/* Tabs */}
      <div className="money-tabs">
        <button
          className={`tab ${tab === "upcoming" ? "active" : ""}`}
          onClick={() => setTab("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={`tab ${tab === "outstanding" ? "active" : ""}`}
          onClick={() => setTab("outstanding")}
        >
          Outstanding
        </button>
        <button
          className={`tab ${tab === "transactions" ? "active" : ""}`}
          onClick={() => setTab("transactions")}
        >
          Transactions
        </button>
      </div>

      <div className="money-card">
        <div className="money-card-top">
          <h4>Accounts</h4>

          {tab === "transactions" && (
            <button className="link-btn" onClick={downloadStatement}>
              Download statement
            </button>
          )}
        </div>

        {loading ? (
          <p className="muted">Loading money data...</p>
        ) : tab === "upcoming" ? (
          <div className="money-list">
            {upcoming.length === 0 ? (
              <p className="muted">No upcoming payments.</p>
            ) : (
              upcoming.map((item) => (
                <div className="money-row" key={item.id}>
                  <div className="row-left">
                    <div className="mini-avatar">{item.name[0]}</div>
                    <div>
                      <div className="row-name">{item.name}</div>
                      <div className="row-sub">
                        {item.note} (Due Soon)
                      </div>
                    </div>
                  </div>

                  <div className="row-right">
                    <button
                      className="row-due red to-pay-btn"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPayment(item);
                      }}
                    >
                      To Pay
                    </button>
                    <div className="row-amt red">{item.due}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : tab === "outstanding" ? (
          <div className="money-list">
            {outstanding.length === 0 ? (
              <p className="muted">No outstanding overdue payments.</p>
            ) : (
              outstanding.map((item) => (
                <div className="money-row" key={item.id}>
                  <div className="row-left">
                    <div className="mini-avatar">{item.name[0]}</div>
                    <div>
                      <div className="row-name">{item.name}</div>
                      <div className="row-sub red">{item.late}</div>
                    </div>
                  </div>

                  <div className="row-right">
                    <button
                      className="row-due red to-pay-btn"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPayment(item);
                      }}
                    >
                      To Pay
                    </button>
                    <div className="row-amt red">{item.due}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="money-list">
            {txList.length === 0 ? (
              <p className="muted">No transactions yet.</p>
            ) : (
              txList.map((t) => (
                <div className="money-row" key={t.id}>
                  <div className="row-left">
                    <div className="mini-avatar">{t.name[0]}</div>
                    <div>
                      <div className="row-name">
                        <span className="red">{t.type}</span> {t.name}
                      </div>
                      <div className="row-sub">{t.whoType}</div>
                    </div>
                  </div>

                  <div className="row-right">
                    <div className="row-sub">{t.date}</div>
                    <div className="row-amt">{t.amount}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
