 import { useEffect, useState } from "react";
import "../styles/AddTransaction.css";

import { addTransaction } from "../api/transactions";
import { fetchCustomers } from "../api/customers";
import { fetchInvestors } from "../api/investors";


function AddTransaction() {
  const [partyType, setPartyType] = useState("customer"); // customer | investor

  const [form, setForm] = useState({
    customerId: "",
    investorId: "",
    type: "Given",
    amount: "",
    interestRate: "",
    durationMonths: "",
    startDate: ""
  });

  const [customers, setCustomers] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingInvestors, setLoadingInvestors] = useState(true);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // ✅ load customers
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const data = await fetchCustomers();
        setCustomers(Array.isArray(data) ? data : []);
      } catch (e) {
        setCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    };
    loadCustomers();
  }, []);

  // ✅ load investors
  useEffect(() => {
    const loadInvestors = async () => {
      try {
        const data = await fetchInvestors();
        setInvestors(Array.isArray(data) ? data : []);
      } catch (e) {
        setInvestors([]);
      } finally {
        setLoadingInvestors(false);
      }
    };
    loadInvestors();
  }, []);

  // ✅ change handler
  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  // ✅ switch between customer/investor
  const switchParty = (type) => {
    setPartyType(type);

    // clear the other id to avoid sending both
    setForm((p) => ({
      ...p,
      customerId: type === "customer" ? p.customerId : "",
      investorId: type === "investor" ? p.investorId : ""
    }));
  };

  const submit = async () => {
    setMessage({ text: "", type: "" });

    // ✅ validate id
    const selectedId =
      partyType === "customer" ? form.customerId : form.investorId;

    if (!selectedId) {
      setMessage({ text: "Please select a customer/investor", type: "error" });
      return;
    }

    if (!form.amount || !form.startDate) {
      setMessage({ text: "Please fill amount and date", type: "error" });
      return;
    }

    // ✅ for investor transactions interest/duration are optional, so set safe values
    const payload = {
      ...form,
      customerId: partyType === "customer" ? form.customerId : undefined,
      investorId: partyType === "investor" ? form.investorId : undefined,
      interestRate: form.interestRate || 0,
      durationMonths: form.durationMonths || 0
    };

    setLoading(true);
    try {
      await addTransaction(payload);
      setMessage({ text: "Transaction saved ✅", type: "success" });

      // reset fields
      setForm((p) => ({
        ...p,
        amount: "",
        interestRate: "",
        durationMonths: "",
        startDate: ""
      }));
    } catch (e) {
      setMessage({ text: e.message || "Save failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-card">
      <h3>Add Transaction</h3>

      {/* ✅ Customer / Investor toggle */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => switchParty("customer")}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.12)",
            background: partyType === "customer" ? "#e9edff" : "#fff",
            fontWeight: 700
          }}
        >
          Customer
        </button>

        <button
          type="button"
          onClick={() => switchParty("investor")}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.12)",
            background: partyType === "investor" ? "#e9edff" : "#fff",
            fontWeight: 700
          }}
        >
          Investor
        </button>
      </div>

      {/* ✅ Dropdown changes */}
      <div className="form-group">
        <label>{partyType === "customer" ? "Select Customer" : "Select Investor"}</label>

        {partyType === "customer" ? (
          <select
            name="customerId"
            value={form.customerId}
            onChange={handleChange}
          >
            <option value="">-- Select Customer --</option>
            {loadingCustomers ? (
              <option value="">Loading...</option>
            ) : (
              customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))
            )}
          </select>
        ) : (
          <select
            name="investorId"
            value={form.investorId}
            onChange={handleChange}
          >
            <option value="">-- Select Investor --</option>
            {loadingInvestors ? (
              <option value="">Loading...</option>
            ) : (
              investors.map((i) => (
                <option key={i._id} value={i._id}>
                  {i.name}
                </option>
              ))
            )}
          </select>
        )}
      </div>

      {/* Type */}
      <div className="form-group">
        <label>Transaction Type</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="Given">Given</option>
          <option value="Taken">Taken</option>
        </select>
      </div>

      {/* Amount */}
      <div className="form-group">
        <label>Amount</label>
        <input name="amount" value={form.amount} onChange={handleChange} />
      </div>

      {/* Interest + duration only needed for customer loans */}
      {partyType === "customer" && (
        <>
          <div className="form-group">
            <label>Interest Rate (%)</label>
            <input
              name="interestRate"
              value={form.interestRate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Duration (Months)</label>
            <input
              name="durationMonths"
              value={form.durationMonths}
              onChange={handleChange}
            />
          </div>
        </>
      )}

      {/* Date */}
      <div className="form-group">
        <label>Start Date</label>
        <input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
        />
      </div>

      {message.text && (
        <p style={{ color: message.type === "error" ? "red" : "green" }}>
          {message.text}
        </p>
      )}

      <button
  className="save-transaction-btn"
  onClick={submit}
  disabled={loading}
>
  {loading ? "Saving..." : "Save Transaction"}
</button>

    </div>
  );
}

export default AddTransaction;
