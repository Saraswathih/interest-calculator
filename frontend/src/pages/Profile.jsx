import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

export default function Profile() {
  const navigate = useNavigate();

  // ===================== THEME =====================
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [showThemeSheet, setShowThemeSheet] = useState(false);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ===================== PROFILE EDIT =====================
  const [showEdit, setShowEdit] = useState(false);

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("profile");
    return saved
      ? JSON.parse(saved)
      : { name: "Saraswathi", role: "Customer Account" };
  });

  const [draft, setDraft] = useState(profile);

  const inputStyle = {
    width: "100%",
    padding: "12px 12px",
    borderRadius: "14px",
    border: "1px solid var(--border)",
    background: "var(--card)",
    outline: "none",
    color: "var(--text)"
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ←
        </button>
        <h3>Profile</h3>
        <div className="ghost" />
      </div>

      <div className="profile-card">
        <div className="avatar">{(profile.name || "S")[0]?.toUpperCase()}</div>
        <div className="profile-meta">
          <h4>{profile.name}</h4>
          <p>{profile.role}</p>
        </div>

        {/* ✅ Edit now works */}
        <button
          className="edit-btn"
          type="button"
          onClick={() => {
            setDraft(profile);
            setShowEdit(true);
          }}
        >
          Edit
        </button>
      </div>

      <div className="settings-card">
        <button className="setting-row" type="button">
          <div className="row-left">
            <span className="row-icon">🌐</span>
            <div>
              <div className="row-title">Change language</div>
              <div className="row-sub">English</div>
            </div>
          </div>
          <span className="chev">›</span>
        </button>

        {/* ✅ Theme row now works */}
        <button
          className="setting-row active"
          type="button"
          onClick={() => setShowThemeSheet(true)}
        >
          <div className="row-left">
            <span className="row-icon">🌓</span>
            <div>
              <div className="row-title">Theme</div>
              <div className="row-sub">{theme === "light" ? "Light" : "Dark"}</div>
            </div>
          </div>
          <span className="chev">›</span>
        </button>

        {/* ✅ Storage row now opens a real page */}
        <button
          className="setting-row"
          type="button"
          onClick={() => navigate("/storage")}
        >
          <div className="row-left">
            <span className="row-icon">💾</span>
            <div>
              <div className="row-title">Storage</div>
              <div className="row-sub">View usage</div>
            </div>
          </div>
          <span className="chev">›</span>
        </button>

        <button className="setting-row" type="button">
          <div className="row-left">
            <span className="row-icon">⬇️</span>
            <div>
              <div className="row-title">Export</div>
              <div className="row-sub">Download data</div>
            </div>
          </div>
          <span className="chev">›</span>
        </button>
      </div>

      <button className="logout-card" type="button">
        Log Out <span className="logout-chev">›</span>
      </button>

      {/* ✅ Theme Bottom Sheet */}
      {showThemeSheet && (
        <div className="sheet-backdrop" onClick={() => setShowThemeSheet(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h4 className="sheet-title">Choose Theme</h4>

            <button
              className={`sheet-option ${theme === "light" ? "selected" : ""}`}
              onClick={() => setTheme("light")}
            >
              ☀️ Light {theme === "light" && <span className="tick">✓</span>}
            </button>

            <button
              className={`sheet-option ${theme === "dark" ? "selected" : ""}`}
              onClick={() => setTheme("dark")}
            >
              🌙 Dark {theme === "dark" && <span className="tick">✓</span>}
            </button>

            <button className="sheet-close" onClick={() => setShowThemeSheet(false)}>
              Done
            </button>
          </div>
        </div>
      )}

      {/* ✅ Edit Profile Bottom Sheet */}
      {showEdit && (
        <div className="sheet-backdrop" onClick={() => setShowEdit(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h4 className="sheet-title">Edit Profile</h4>

            <div style={{ display: "grid", gap: "10px" }}>
              <div>
                <div className="row-title" style={{ marginBottom: "6px" }}>
                  Name
                </div>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="Enter name"
                  style={inputStyle}
                />
              </div>

              <div>
                <div className="row-title" style={{ marginBottom: "6px" }}>
                  Role
                </div>
                <input
                  value={draft.role}
                  onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                  placeholder="Enter role"
                  style={inputStyle}
                />
              </div>

              <button
                className="sheet-close"
                onClick={() => {
                  const cleaned = {
                    name: (draft.name || "Saraswathi").trim(),
                    role: (draft.role || "Customer Account").trim()
                  };
                  setProfile(cleaned);
                  localStorage.setItem("profile", JSON.stringify(cleaned));
                  setShowEdit(false);
                }}
              >
                Save Changes
              </button>

              <button
                className="sheet-close"
                style={{ background: "rgba(0,0,0,0.06)" }}
                onClick={() => setShowEdit(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
