import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "../styles/Login.css";

export default function Login() {
  const { login, settings, updateSettings } = useUser();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    login(form);
    navigate("/", { replace: true });
  };

  return (
    <div className="loginWrap">
      <div className="loginCard">
        <h2>Welcome 👋</h2>
        <p className="loginSub">Login to manage interest & payments</p>

        <form onSubmit={submit} className="loginForm">
          <label>Name</label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Enter your name"
            required
          />

          <label>Phone (optional)</label>
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="Enter phone number"
          />

          <label>Email (optional)</label>
          <input
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="Enter email"
          />

          <div className="loginRow">
            <div className="miniSelect">
              <span>Theme</span>
              <select
                value={settings.theme}
                onChange={(e) => updateSettings({ theme: e.target.value })}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="miniSelect">
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
          </div>

          <button className="loginBtn" type="submit">
            Login
          </button>
        </form>

        <p className="loginHint">
          * Later we can connect real backend authentication.
        </p>
      </div>
    </div>
  );
}
