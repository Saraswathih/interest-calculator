import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Accounts.css";
import BottomNav from "../components/BottomNav";

import { fetchCustomers } from "../api/customers";
import { fetchInvestors } from "../api/investors";

export default function Investments() {
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState("investors"); // "investors" | "accounts"

  // 🔍 Search (Investors)
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Customers (Accounts tab)
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  // Investors (Investors tab)
  const [investors, setInvestors] = useState([]);
  const [loadingInvestors, setLoadingInvestors] = useState(true);

  // ---- Load Customers ----
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const data = await fetchCustomers();
        setCustomers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCustomers(false);
      }
    };
    loadCustomers();
  }, []);

  // ---- Load Investors ----
  const loadInvestors = async () => {
    try {
      setLoadingInvestors(true);
      const data = await fetchInvestors();
      setInvestors(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setInvestors([]);
    } finally {
      setLoadingInvestors(false);
    }
  };

  // load investors once on page open
  useEffect(() => {
    loadInvestors();
  }, []);

  // refresh investors when coming back from AddInvestor
  useEffect(() => {
    if (location.state?.refreshInvestors) {
      loadInvestors();
    }
  }, [location.state]);

  // ✅ close search when switching tabs
  useEffect(() => {
    setShowSearch(false);
    setSearch("");
  }, [tab]);

  // show only active customers in accounts tab
  const activeCustomers = useMemo(
    () => customers.filter((c) => c.status !== "draft"),
    [customers]
  );

  // 🔍 FILTER INVESTORS BY NAME / PHONE
  const filteredInvestors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return investors;

    return investors.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const phone = (p.phone || "").toLowerCase();
      return name.includes(q) || phone.includes(q);
    });
  }, [investors, search]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ✅ Page content */}
      <div style={{ flex: 1 }}>
        <div className="accountsWrap">
          <div className="accountsTop">
            <button className="accBack" onClick={() => navigate(-1)}>←</button>
            <h3>Accounts</h3>

            <div className="accIcons">
              {/* ✅ Search icon toggle */}
              <button
                className="accIconBtn"
                title="Search"
                onClick={() => {
                  setShowSearch((prev) => !prev);
                  setSearch("");
                }}
                type="button"
              >
                🔍
              </button>

              <button className="accIconBtn" title="Info" type="button">ⓘ</button>
            </div>
          </div>

          <div className="tabsBar">
            <button
              className={`tabBtn ${tab === "investors" ? "active" : ""}`}
              onClick={() => setTab("investors")}
              type="button"
            >
              Investors
            </button>

            <button
              className={`tabBtn ${tab === "accounts" ? "active" : ""}`}
              onClick={() => setTab("accounts")}
              type="button"
            >
              My Accounts
            </button>
          </div>

          <div className="sectionTitle">Accounts</div>

          {/* ---------------- INVESTORS TAB ---------------- */}
          {tab === "investors" && (
            <div className="list">
              {/* ✅ Search box only when icon clicked */}
              {showSearch && (
                <div className="searchBox">
                  <input
                    className="searchInput"
                    placeholder="Search investor name / phone..."
                    value={search}
                    autoFocus
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              )}

              {loadingInvestors ? (
                <p className="muted">Loading investors...</p>
              ) : filteredInvestors.length === 0 ? (
                <p className="muted">No investors found.</p>
              ) : (
                filteredInvestors.map((p) => (
                  <div
                    key={p._id}
                    className="rowCard"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/investor/${p._id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") navigate(`/investor/${p._id}`);
                    }}
                  >
                    <div className="avatar">👤</div>

                    <div className="rowInfo">
                      <div className="rowName">{p.name}</div>
                      <div className="rowSub">Investor</div>
                    </div>

                    <div className="rowRight">
                      <div className="rowPhone">{p.phone || "—"}</div>
                      <button
                        className="moreBtn"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/investor/${p._id}`);
                        }}
                      >
                        More
                      </button>
                    </div>
                  </div>
                ))
              )}

              <button
                className="newBtn"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate("/add-investor");
                }}
              >
                + New Investor
              </button>
            </div>
          )}

          {/* ---------------- ACCOUNTS TAB ---------------- */}
          {tab === "accounts" && (
            <div className="list">
              {loadingCustomers ? (
                <p className="muted">Loading accounts...</p>
              ) : activeCustomers.length === 0 ? (
                <p className="muted">No customers yet. Add a customer first.</p>
              ) : (
                activeCustomers.map((c) => (
                  <div key={c._id} className="rowCard">
                    <div className="avatar">👤</div>

                    <div className="rowInfo">
                      <div className="rowName">{c.name}</div>
                      <div className="rowSub">{c.address || "No address"}</div>
                    </div>

                    <div className="rowRight">
                      <div className="rowPhone">{c.phone || "—"}</div>
                      <button
                        className="moreBtn"
                        type="button"
                        onClick={() => navigate(`/lend/${c._id}`)}
                      >
                        More
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Bottom nav always at bottom */}
      <BottomNav />
    </div>
  );
}
