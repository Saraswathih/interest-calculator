import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/AddCustomer.css";
import { fetchInvestorById, deleteInvestor } from "../api/investors";
import { fetchTransactionsByInvestor } from "../api/transactions";

function safeDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function monthsBetween(startDateStr) {
  const start = safeDate(startDateStr);
  if (!start) return 0;

  const now = new Date();

  let months =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());

  if (now.getDate() < start.getDate()) months -= 1;

  return Math.max(0, months);
}

export default function InvestorDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [inv, setInv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [txns, setTxns] = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(true);

  // ✅ load investor
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setToast("");
        const data = await fetchInvestorById(id);
        setInv(data);
      } catch (e) {
        setToast(e?.message || "Failed to load investor");
        setInv(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // ✅ load transactions for this investor
  useEffect(() => {
    const loadTxns = async () => {
      if (!id) return;
      try {
        setLoadingTxns(true);
        const data = await fetchTransactionsByInvestor(id);
        setTxns(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setTxns([]);
      } finally {
        setLoadingTxns(false);
      }
    };

    loadTxns();
  }, [id]);

  const calc = useMemo(() => {
    if (!inv) return null;

    const principal = Number(inv.investedAmount) || 0;
    const rate = Number(inv.monthlyReturnRate) || 0;
    const months = monthsBetween(inv.startDate);

    const monthlyReturn = (principal * rate) / 100;
    const totalReturn = monthlyReturn * months;

    return { principal, rate, months, monthlyReturn, totalReturn };
  }, [inv]);

  const startDateLabel = useMemo(() => {
    if (!inv?.startDate) return "—";
    const d = safeDate(inv.startDate);
    if (!d) return "Invalid date";
    return d.toISOString().slice(0, 10);
  }, [inv]);

  const onDelete = async () => {
    if (!inv?._id) return;
    const ok = window.confirm(`Delete investor "${inv.name}"?`);
    if (!ok) return;

    setDeleting(true);
    setToast("");
    try {
      await deleteInvestor(inv._id);
      setToast("Investor deleted ✅");
      setTimeout(() => {
        navigate("/investments", { state: { refreshInvestors: true } });
      }, 500);
    } catch (e) {
      setToast(e?.message || "Failed to delete investor");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="screenCenter">
      <div className="phoneCard">
        <div className="topBar">
          <button className="backBtn" onClick={() => navigate(-1)}>←</button>
          <h3>Investor Details</h3>
          <span className="ghost">.</span>
        </div>

        {toast && <div className="toast">{toast}</div>}

        {loading ? (
          <p className="muted" style={{ padding: 16 }}>Loading...</p>
        ) : !inv ? (
          <p className="muted" style={{ padding: 16 }}>Investor not found.</p>
        ) : (
          <>
            <div className="avatarArea">
              <div className="avatarCircle">👤</div>
            </div>

            <div className="field">
              <label>Name</label>
              <div className="readOnlyBox">{inv.name}</div>
            </div>

            <div className="field">
              <label>Phone</label>
              <div className="readOnlyBox">{inv.phone || "—"}</div>
            </div>

            <div className="field">
              <label>Address</label>
              <div className="readOnlyBox">{inv.address || "—"}</div>
            </div>

            <div className="field">
              <label>Invested Amount (₹)</label>
              <div className="readOnlyBox">{inv.investedAmount ?? "—"}</div>
            </div>

            <div className="field">
              <label>Monthly Return (%)</label>
              <div className="readOnlyBox">{inv.monthlyReturnRate ?? "—"}</div>
            </div>

            <div className="field">
              <label>Start Date</label>
              <div className="readOnlyBox">{startDateLabel}</div>
            </div>

            {calc && (
              <div style={{ padding: 12, border: "1px solid #eee", borderRadius: 12, marginTop: 10 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Quick Summary</div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span className="muted">Months completed</span>
                  <span>{calc.months}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span className="muted">Monthly return (₹)</span>
                  <span>{Math.round(calc.monthlyReturn)}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="muted">Total return till now (₹)</span>
                  <span>{Math.round(calc.totalReturn)}</span>
                </div>
              </div>
            )}

            {/* ✅ TRANSACTIONS SECTION */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Transactions</div>

              {loadingTxns ? (
                <p className="muted">Loading transactions...</p>
              ) : txns.length === 0 ? (
                <p className="muted">No transactions yet for this investor.</p>
              ) : (
                txns.map((t) => (
                  <div
                    key={t._id}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 12,
                      padding: 10,
                      marginBottom: 8
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 600 }}>{t.type}</div>
                      <div className="muted">{String(t.startDate).slice(0, 10)}</div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                      <span className="muted">Amount</span>
                      <span>₹{t.amount}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                      <span className="muted">Interest</span>
                      <span>₹{Math.round(t.interestAmount || 0)}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                      <span className="muted">Total</span>
                      <span>₹{Math.round(t.totalAmount || 0)}</span>
                    </div>
                  </div>
                ))
              )}

              
            </div>

            <div className="bottomActions" style={{ marginTop: 12 }}>
              <button className="draftBtn" onClick={onDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </button>

              <button
                className="saveBtn"
                onClick={() => navigate(`/edit-investor/${inv._id}`)}
                type="button"
              >
                Edit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
