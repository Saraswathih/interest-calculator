import { Outlet } from "react-router-dom";
import BottomNav from "../components/BottomNav";


export default function AppLayout() {
  return (
    <div className="app-shell">
      <div className="app-content">
        <Outlet />
      </div>

      {/* ✅ Bottom Nav should show on all pages */}
      <BottomNav />
    </div>
  );
}
