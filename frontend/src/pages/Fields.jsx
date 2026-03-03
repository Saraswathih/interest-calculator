import { useNavigate } from "react-router-dom";
import "../styles/Support.css";

export default function Fields() {
  const nav = useNavigate();
  return (
    <div className="supportWrap">
      <div className="supportTop">
        <button className="supportBack" onClick={() => nav(-1)}>←</button>
        <h3>Fields</h3>
        <span className="ghost">.</span>
      </div>

      <div className="supportCard">
        <h4>Custom Fields</h4>
        <p style={{ opacity: 0.85 }}>
          Coming soon: Add extra fields like Address, City, Notes, etc.
        </p>
      </div>
    </div>
  );
}
