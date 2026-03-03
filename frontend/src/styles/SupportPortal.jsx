import { useNavigate } from "react-router-dom";
import "../styles/Support.css";

export default function SupportPortal() {
  const nav = useNavigate();
  return (
    <div className="supportWrap">
      <div className="supportTop">
        <button className="supportBack" onClick={() => nav(-1)}>←</button>
        <h3>Support Portal</h3>
        <span className="ghost">.</span>
      </div>

      <div className="supportCard">
        <h4>Quick Help</h4>

        <details className="qa" open>
          <summary>How to add a customer?</summary>
          <p>Go to Home → Add Customer. Fill details → Save.</p>
        </details>

        <details className="qa">
          <summary>How to add a transaction?</summary>
          <p>Go to Home → Add Transaction. Select customer → Save.</p>
        </details>

        <details className="qa">
          <summary>Why dashboard looks blank in dark mode?</summary>
          <p>Enable theme styles using body[data-theme="dark"] in each page css.</p>
        </details>

        <details className="qa">
          <summary>Export / backup data?</summary>
          <p>Profile → Export. (We will connect real download later.)</p>
        </details>
      </div>
    </div>
  );
}
