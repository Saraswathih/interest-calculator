import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Drafts.css";
import BottomNav from "../components/BottomNav";

import { fetchDraftCustomers, deleteCustomer } from "../api/customers";

export default function Drafts() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchDraftCustomers();
        setDrafts(Array.isArray(data) ? data : []);
      } catch (e) {
        setMsg(e?.message || "Failed to load drafts");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (e, id) => {
    // ✅ Stop card click (so it won't open edit page)
    e.stopPropagation();

    const ok = window.confirm("Delete this draft?");
    if (!ok) return;

    try {
      await deleteCustomer(id);
      setDrafts((prev) => prev.filter((d) => d._id !== id));
      setMsg("Draft deleted ✅");
      setTimeout(() => setMsg(""), 1200);
    } catch (err) {
      setMsg(err?.message || "Failed to delete draft");
    }
  };

  return (
    <div className="draftsWrap">
      <div className="draftTop">
        <button className="backBtn2" onClick={() => navigate(-1)}>
          ←
        </button>
        <h3>Draft Customers</h3>
        <button className="addBtn" onClick={() => navigate("/add-customer")}>
          + Add
        </button>
      </div>

      {loading && <p className="info">Loading drafts...</p>}
      {msg && <p className={`info ${msg.includes("Failed") ? "error" : ""}`}>{msg}</p>}

      {!loading && drafts.length === 0 && (
        <div className="emptyBox">
          <p>No drafts yet 📝</p>
          <button className="primaryBtn" onClick={() => navigate("/add-customer")}>
            Create Draft
          </button>
        </div>
      )}

      <div className="draftList">
        {drafts.map((c) => (
          <div
            key={c._id}
            className="draftCard"
            onClick={() =>
              navigate(`/edit-customer/${c._id}`, { state: { customer: c } })
            }
          >
            <div className="draftAvatar">👤</div>

            <div className="draftInfo">
              <h4>{c.name || "Unnamed"}</h4>
              <p>{c.phone || "No phone"}</p>
              <p className="muted">{c.address || "No address"}</p>
            </div>

            <div className="draftRight">
              <span className="badge">DRAFT</span>

              <button
                className="deleteBtn"
                onClick={(e) => handleDelete(e, c._id)}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
    
  );
}
