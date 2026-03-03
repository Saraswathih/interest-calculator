import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddCustomer.css";
import { addInvestor } from "../api/investors";

export default function AddInvestor() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    investedAmount: "",
    monthlyReturnRate: "",
    startDate: ""
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setToast("");

    if (!form.name.trim()) return setToast("Investor name is required");
    if (!form.phone.trim()) return setToast("Phone number is required");
    if (!form.address.trim()) return setToast("Address is required");
    if (!form.investedAmount) return setToast("Invested amount is required");
    if (!form.monthlyReturnRate) return setToast("Monthly return rate is required");
    if (!form.startDate) return setToast("Start date is required");

    setLoading(true);
    try {
      await addInvestor({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        investedAmount: Number(form.investedAmount),
        monthlyReturnRate: Number(form.monthlyReturnRate),
        startDate: form.startDate
      });

      setToast("Investor added successfully ✅");

      setTimeout(() => {
        navigate("/investments");
      }, 700);
    } catch (e) {
      setToast(e?.message || "Failed to add investor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screenCenter">
      <div className="phoneCard">
        <div className="topBar">
          <button className="backBtn" onClick={() => navigate(-1)}>←</button>
          <h3>Add New Investor</h3>
          <span className="ghost">.</span>
        </div>

        <div className="avatarArea">
          <div className="avatarCircle">👤</div>
        </div>

        {toast && <div className="toast">{toast}</div>}

        <div className="field">
          <label>Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Rohit"
          />
        </div>

        <div className="field">
          <label>Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 9876543210"
          />
        </div>

        <div className="field">
          <label>Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Street, City"
          />
        </div>

        <div className="field">
          <label>Invested Amount (₹)</label>
          <input
            name="investedAmount"
            type="number"
            value={form.investedAmount}
            onChange={handleChange}
            placeholder="100000"
          />
        </div>

        <div className="field">
          <label>Monthly Return (%)</label>
          <input
            name="monthlyReturnRate"
            type="number"
            value={form.monthlyReturnRate}
            onChange={handleChange}
            placeholder="2"
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
          <button className="draftBtn" onClick={() => navigate("/investments")}>
            Cancel
          </button>

          <button className="saveBtn" onClick={submit} disabled={loading}>
            {loading ? "Saving..." : "Save Investor"}
          </button>
        </div>
      </div>
    </div>
  );
}
