import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/AddCustomer.css";
import { fetchInvestorById, updateInvestor } from "../api/investors";

export default function EditInvestor() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    investedAmount: "",
    monthlyReturnRate: "",
    startDate: "",
    status: "active",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const inv = await fetchInvestorById(id);

        setForm({
          name: inv?.name || "",
          phone: inv?.phone || "",
          address: inv?.address || "",
          investedAmount: inv?.investedAmount ?? "",
          monthlyReturnRate: inv?.monthlyReturnRate ?? "",
          startDate: inv?.startDate ? new Date(inv.startDate).toISOString().slice(0, 10) : "",
          status: inv?.status || "active",
        });
      } catch (e) {
        setToast(e?.message || "Failed to load investor");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setToast("");

    if (!form.name.trim()) return setToast("Investor name is required");
    if (!form.phone.trim()) return setToast("Phone number is required");
    if (!form.address.trim()) return setToast("Address is required");
    if (form.investedAmount === "") return setToast("Invested amount is required");
    if (form.monthlyReturnRate === "") return setToast("Monthly return rate is required");
    if (!form.startDate) return setToast("Start date is required");

    setSaving(true);
    try {
      await updateInvestor(id, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        investedAmount: Number(form.investedAmount),
        monthlyReturnRate: Number(form.monthlyReturnRate),
        startDate: form.startDate,
        status: form.status,
      });

      setToast("Investor updated ✅");
      setTimeout(() => {
        navigate(`/investor/${id}`);
      }, 500);
    } catch (e) {
      setToast(e?.message || "Failed to update investor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="screenCenter">
      <div className="phoneCard">
        <div className="topBar">
          <button className="backBtn" onClick={() => navigate(-1)}>←</button>
          <h3>Edit Investor</h3>
          <span className="ghost">.</span>
        </div>

        {toast && <div className="toast">{toast}</div>}

        {loading ? (
          <p className="muted" style={{ padding: 16 }}>Loading...</p>
        ) : (
          <>
            <div className="field">
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} />
            </div>

            <div className="field">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>

            <div className="field">
              <label>Address</label>
              <input name="address" value={form.address} onChange={handleChange} />
            </div>

            <div className="field">
              <label>Invested Amount (₹)</label>
              <input
                name="investedAmount"
                type="number"
                value={form.investedAmount}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label>Monthly Return (%)</label>
              <input
                name="monthlyReturnRate"
                type="number"
                value={form.monthlyReturnRate}
                onChange={handleChange}
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

            <div className="field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div className="bottomActions">
              <button className="draftBtn" onClick={() => navigate(`/investor/${id}`)}>
                Cancel
              </button>

              <button className="saveBtn" onClick={submit} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
