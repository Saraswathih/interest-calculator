import { useNavigate } from "react-router-dom";
import "../styles/Header.css";
import { useUser } from "../context/UserContext";

function Header({ onSearchChange }) {
  const navigate = useNavigate();

  // ✅ Get logged-in user from context
  const { user } = useUser();

  const customerName = user?.name || "Guest";

  return (
    <div className="header-wrap">
      <div className="header-card">
        <div className="header-top">
          <div className="header-left">
            <h2 className="header-title">
              Hi, {customerName} 👋
            </h2>
            <p className="header-subtitle">
              Track your interest & payments in one place
            </p>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="header-icon"
              title="Calculator"
              onClick={() => navigate("/calculator")}
            >
              🧮
            </button>

            <button
              type="button"
              className="header-icon"
              title="Reminders"
              onClick={() => navigate("/reminders")}
            >
              🔔
            </button>

            <button
              type="button"
              className="header-icon"
              title="Draft Customers"
              onClick={() => navigate("/drafts")}
            >
              📝
            </button>

            {/* ✅ Profile button now dynamic */}
            <button
              type="button"
              className="header-profile"
              title="Profile"
              onClick={() => navigate("/profile")}
            >
              <div className="profile-avatar">
                {customerName.charAt(0).toUpperCase()}
              </div>
              <div className="profile-name">{customerName}</div>
            </button>
          </div>
        </div>

        <div className="header-search">
          <input
            className="header-search-input"
            placeholder="Search customer / transaction / amount..."
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

export default Header;
