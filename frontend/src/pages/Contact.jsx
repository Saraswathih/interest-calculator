import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "../styles/Support.css";

export default function Contact() {
  const nav = useNavigate();
  const { user } = useUser();

  return (
    <div className="supportWrap">
      <div className="supportTop">
        <button className="supportBack" onClick={() => nav(-1)}>←</button>
        <h3>Contact</h3>
        <span className="ghost">.</span>
      </div>

      <div className="supportCard">
        <h4>Logged User Details</h4>
        <div className="kv">
          <span>Name</span>
          <b>{user?.name || "Guest"}</b>
        </div>
        <div className="kv">
          <span>Role</span>
          <b>{user?.role || "Customer Account"}</b>
        </div>
        <div className="kv">
          <span>Phone</span>
          <b>{user?.phone || "Not added"}</b>
        </div>
        <div className="kv">
          <span>Email</span>
          <b>{user?.email || "Not added"}</b>
        </div>

        <div className="helpBox">
          <b>Support Email</b>
          <p>support@interestapp.local</p>
          <b>Support Phone</b>
          <p>+91 90000 00000</p>
        </div>
      </div>
    </div>
  );
}
