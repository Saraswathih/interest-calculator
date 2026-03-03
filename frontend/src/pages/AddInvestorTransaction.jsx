import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/AddCustomer.css";
import { fetchInvestorById } from "../api/investors";
import { addInvestorTransaction } from "../api/transactions";

export default function AddInvestorTransaction() {
  const navigate = useNavigate();
  const { id } = useParams(); // investorId

  const [inv, setInv] = useState(null);
  const [loadingInv, setLoadingInv] = useState(true);

  const [form, setForm] = useState({
    type: "Given",
    amount: "",
    interestRate: "",
    durationMonths: "",
    startDate: ""
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const loadInvestor = async () => {
      try {
        setLoadingInv(true);
        const data = await fetchInvestorById(id);
        setInv(data);
      } catch (e) {
        setToast(e?.message || "Failed to load investor");
      } finally {
        setLoadingInv(false);
      }
    };
    loadInvestor();
  }, [id]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const submit = async () => {
    setToast("");

    if (!form.amount) return setToast("Amount is required");
    if (form.interestRate === "") return setToast("Interest rate is required");
    if (form.durationMonths === "") return setToast("Duration is required");
    if (!form.startDate) return setToast("Start date is required");

    setSaving(true);
    try {
      await addInvestorTransaction(id, {
        type: form.type,
        amount: Number(form.amount),
        interestRate: Number(form.interestRate),
        durationMonths: Number(form.durationMonths),
        startDate: form.startDate
      });

      setToast("Transaction added ✅");
      setTimeout(() => {
        // go back to investor details and it will refetch transactions on open
        navigate(`/investor/${id}`);
      }, 400);
    } catch (e) {
      setToast(e?.message || "Failed to add transaction");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="screenCenter">
      <div className="phoneCard">
        <div className="topBar">
          <button className="backBtn" onClick={() => navigate(-1)}>←</button>
          <h3>Add Transaction</h3>
          <span className="ghost">.</span>
        </div>

        {toast && <div className="toast">{toast}</div>}

        {loadingInv ? (
          <p className="muted" style={{ padding: 16 }}>Loading investor...</p>
        ) : !inv ? (
          <p className="muted" style={{ padding: 16 }}>Investor not found.</p>
        ) : (
          <>
            <div className="field">
              <label>Investor</label>
              <div className="readOnlyBox">{inv.name}</div>
            </div>

            <div className="field">
              <label>Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="Given">Given</option>
                <option value="Taken">Taken</option>
              </select>
            </div>

            <div className="field">
              <label>Amount (₹)</label>
              <input
                name="amount"
                type="number"
                value={form.amount}
                onChange={handleChange}
                placeholder="100000"
              />
            </div>

            <div className="field">
              <label>Interest Rate (%)</label>
              <input
                name="interestRate"
                type="number"
                value={form.interestRate}
                onChange={handleChange}
                placeholder="2"
              />
            </div>

            <div className="field">
              <label>Duration (Months)</label>
              <input
                name="durationMonths"
                type="number"
                value={form.durationMonths}
                onChange={handleChange}
                placeholder="12"
              />
            </div>

            <div className="field">
              <label>Start Date</label>
              <input
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange}
              />
            </div>

            <div className="bottomActions">
              <button className="draftBtn" onClick={() => navigate(`/investor/${id}`)}>
                Cancel
              </button>

              <button className="saveBtn" onClick={submit} disabled={saving}>
                {saving ? "Saving..." : "Save Transaction"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
