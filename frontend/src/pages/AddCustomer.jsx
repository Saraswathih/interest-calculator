import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddCustomer.css";
import { addCustomer } from "../api/customers";

function AddCustomer() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  // 🔄 Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // 🔴 Validation ONLY for Save Customer
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Customer name is required";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?\d{10,13}$/.test(form.phone.trim())) {
      newErrors.phone = "Enter valid phone number";
    }

    if (!form.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ SAVE CUSTOMER (ACTIVE)
  const submitCustomer = async () => {
    if (!validate()) return;

    setLoading(true);
    setToast("");

    try {
      const created = await addCustomer({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        status: "active"
      });

      setToast("Customer added successfully ✅");

      setTimeout(() => {
        navigate(`/lend/${created._id}`, {
          state: { customer: created }
        });
      }, 900);
    } catch (err) {
      setToast(err.message || "Failed to add customer");
    } finally {
      setLoading(false);
    }
  };

  // 📝 SAVE DRAFT (only name required)
  const saveDraft = async () => {
    if (!form.name.trim()) {
      setToast("Customer name is required to save draft");
      return;
    }

    setLoading(true);
    setToast("");

    try {
      await addCustomer({
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        status: "draft"
      });

      setToast("Draft saved 📝");

      // optional: clear form
      setForm({ name: "", phone: "", address: "" });

      // optional: go back
      setTimeout(() => navigate(-1), 900);
    } catch (err) {
      setToast(err.message || "Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screenCenter">
      <div className="phoneCard">
        <div className="topBar">
          <button className="backBtn" onClick={() => navigate(-1)}>←</button>
          <h3>Add New Customer</h3>
          <span className="ghost">.</span>
        </div>

        <div className="avatarArea">
          <div className="avatarCircle">👤</div>
        </div>

        {toast && <div className="toast">{toast}</div>}

        {/* NAME */}
        <div className="field">
          <label>Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Surya"
            className={errors.name ? "errorInput" : ""}
          />
          {errors.name && <p className="errorText">{errors.name}</p>}
        </div>

        {/* PHONE */}
        <div className="field">
          <label>Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 9876543210"
            className={errors.phone ? "errorInput" : ""}
          />
          {errors.phone && <p className="errorText">{errors.phone}</p>}
        </div>

        {/* ADDRESS */}
        <div className="field">
          <label>Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Street, City"
            className={errors.address ? "errorInput" : ""}
          />
          {errors.address && <p className="errorText">{errors.address}</p>}
        </div>

        <div className="miniActions">
          <button className="miniBtn">Documents</button>
          <button className="miniBtn">Notes</button>
          <button className="miniBtn">Tags</button>
        </div>

        <div className="bottomActions">
          {/* 📝 SAVE DRAFT */}
          <button
            type="button"
            className="draftBtn"
            onClick={saveDraft}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Draft"}
          </button>

          {/* ✅ SAVE CUSTOMER */}
          <button
            type="button"
            className="saveBtn"
            onClick={submitCustomer}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddCustomer;
