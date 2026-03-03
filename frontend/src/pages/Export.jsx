import { useNavigate } from "react-router-dom";
import "../styles/Support.css";

export default function Export() {
  const nav = useNavigate();
  return (
    <div className="supportWrap">
      <div className="supportTop">
        <button className="supportBack" onClick={() => nav(-1)}>←</button>
        <h3>Export</h3>
        <span className="ghost">.</span>
      </div>

      <div className="supportCard">
        <h4>Download Data</h4>
        <p style={{ opacity: 0.85 }}>
          Next step: we’ll connect backend and export customers + transactions as CSV/JSON.
        </p>
        <button className="loginBtn" style={{ marginTop: 12 }} disabled>
          Export (Coming Soon)
        </button>
      </div>
    </div>
  );
}
