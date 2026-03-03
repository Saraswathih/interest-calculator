import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import "../styles/LeadToCustomer.css";

function LendToCustomer() {
  const navigate = useNavigate();
  const { customerId } = useParams();
  const location = useLocation();

  const customer = location.state?.customer;

  const [form, setForm] = useState({
    lendingDate: "",
    loanFor: "Personal Loan",
    amount: "",
    interestRate: "",
    paymentFrequency: "Monthly"
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSave = async () => {
    setToast("");

    // ✅ simple validation
    if (!form.lendingDate) return setToast("Lending date is required");
    if (!form.amount) return setToast("Amount is required");
    if (!form.interestRate) return setToast("Interest rate is required");

    setSaving(true);
    try {
      // ✅ later we will connect API here:
      // await saveLendDetails({ customerId, ...form });

      setToast("Saved successfully ✅");

      setTimeout(() => {
        navigate("/"); // ✅ go to Home page
      }, 700);
    } catch (e) {
      setToast(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="screenCenter">
      <div className="phoneCard">
        <div className="topBar">
          <button className="backBtn" onClick={() => navigate(-1)}>←</button>
          <h3>Lend to Customer</h3>
          <span className="ghost">.</span>
        </div>

        {toast && <div className="toast">{toast}</div>}

        <div className="customerStrip">
          <div className="custAvatar">👤</div>
          <div className="custInfo">
            <b>{customer?.name || "Customer"}</b>
            <small>{customer?.phone || customerId}</small>
          </div>
          <button className="editBtn" onClick={() => navigate("/add-customer")}>
            Edit
          </button>
        </div>

        <div className="field">
          <label>Lending Date</label>
          <input
            type="date"
            name="lendingDate"
            value={form.lendingDate}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label>Loan For</label>
          <select name="loanFor" value={form.loanFor} onChange={handleChange}>
            <option>Personal Loan</option>
            <option>Business Loan</option>
          </select>
        </div>

        <div className="field">
          <label>Amount</label>
          <input
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="200000"
          />
        </div>

        <div className="field">
          <label>Interest Rate (%)</label>
          <input
            name="interestRate"
            value={form.interestRate}
            onChange={handleChange}
            placeholder="2"
          />
        </div>

        <div className="field">
          <label>Payment Frequency</label>
          <select
            name="paymentFrequency"
            value={form.paymentFrequency}
            onChange={handleChange}
          >
            <option>Monthly</option>
            <option>Weekly</option>
            <option>Daily</option>
          </select>
        </div>

        

        <button className="saveBtn" onClick={onSave} disabled={saving} type="button">
          {saving ? "Saving..." : "Save Details"}
        </button>
      </div>
    </div>
  );
}

export default LendToCustomer;
