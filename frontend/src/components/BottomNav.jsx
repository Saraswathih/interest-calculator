import { useNavigate, useLocation } from "react-router-dom";
import "../styles/BottomNav.css";

function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  return (
    <div className="bottom-nav-wrap">
      <div className="bottom-nav">
        <button
          className={`nav-item ${isActive("/") ? "active" : ""}`}
          onClick={() => navigate("/")}
          aria-label="Home"
        >
          🏠
        </button>

        {/* ✅ Money -> open transactions tab */}
        <button
          className={`nav-item ${isActive("/money") ? "active" : ""}`}
          onClick={() => navigate("/money", { state: { tab: "transactions" } })}
          aria-label="Money"
        >
          💰
        </button>

        <button
          className={`nav-item ${isActive("/portfolio") ? "active" : ""}`}
          onClick={() => navigate("/portfolio")}
          aria-label="Portfolio"
        >
          💼
        </button>

        <button
          className={`nav-item ${isActive("/investments") ? "active" : ""}`}
          onClick={() => navigate("/investments")}
          aria-label="Accounts"
        >
          <span className="navIcon">👥</span>
        </button>

        <button
          className={`nav-item ${isActive("/profile") ? "active" : ""}`}
          onClick={() => navigate("/profile")}
          aria-label="Profile"
        >
          👤
        </button>
      </div>
    </div>
  );
}

export default BottomNav;
