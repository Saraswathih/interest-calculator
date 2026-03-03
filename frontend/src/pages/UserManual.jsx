import { useNavigate } from "react-router-dom";
import "../styles/Support.css";

export default function UserManual() {
  const nav = useNavigate();
  return (
    <div className="supportWrap">
      <div className="supportTop">
        <button className="supportBack" onClick={() => nav(-1)}>←</button>
        <h3>User Manual</h3>
        <span className="ghost">.</span>
      </div>

      <div className="supportCard">
        <h4>Basic Steps</h4>
        <ol className="manualList">
          <li>Login and set theme/language.</li>
          <li>Add Customers.</li>
          <li>Add Transactions (Given / Taken).</li>
          <li>Check Portfolio for totals.</li>
          <li>Use Profile for settings, export, support.</li>
        </ol>
      </div>
    </div>
  );
}
