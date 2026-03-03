import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "../styles/Support.css";

export default function Settings() {
  const nav = useNavigate();
  const { settings, updateSettings, resetSettings } = useUser();

  return (
    <div className="supportWrap">
      <div className="supportTop">
        <button className="supportBack" onClick={() => nav(-1)}>←</button>
        <h3>Settings</h3>
        <span className="ghost">.</span>
      </div>

      <div className="supportCard">
        <div className="kv">
          <span>Theme</span>
          <select
            value={settings.theme}
            onChange={(e) => updateSettings({ theme: e.target.value })}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="kv">
          <span>Language</span>
          <select
            value={settings.language}
            onChange={(e) => updateSettings({ language: e.target.value })}
          >
            <option>English</option>
            <option>Kannada</option>
            <option>Hindi</option>
          </select>
        </div>

        <button
          className="loginBtn"
          style={{ marginTop: 14 }}
          onClick={resetSettings}
        >
          Reset / Forget Settings
        </button>
      </div>
    </div>
  );
}
