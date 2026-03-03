import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/storage.css";

function calcLocalStorageBytes() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    const v = localStorage.getItem(k) || "";
    total += (k?.length || 0) + v.length;
  }
  return total; // characters
}

function formatKB(chars) {
  // Rough: 1 char ~ 1 byte (good enough for UI)
  const bytes = chars;
  const kb = bytes / 1024;
  const mb = kb / 1024;
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  return `${kb.toFixed(2)} KB`;
}

export default function Storage() {
  const navigate = useNavigate();

  const usage = useMemo(() => {
    const usedChars = calcLocalStorageBytes();
    const used = usedChars; // bytes approx
    const quota = 5 * 1024 * 1024; // 5MB common browser localStorage quota (approx)
    const free = Math.max(quota - used, 0);

    return {
      used,
      free,
      quota,
      usedLabel: formatKB(usedChars),
      freeLabel: formatKB(free),
      quotaLabel: formatKB(quota),
      percent: Math.min((used / quota) * 100, 100)
    };
  }, []);

  // Donut chart using SVG circle
  const r = 44;
  const c = 2 * Math.PI * r;
  const dash = (usage.percent / 100) * c;

  return (
    <div className="storage-page">
      <div className="storage-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h3>Storage</h3>
        <div className="ghost" />
      </div>

      <div className="storage-card">
        <div className="donut-wrap">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle className="donut-bg" cx="60" cy="60" r={r} />
            <circle
              className="donut-fg"
              cx="60"
              cy="60"
              r={r}
              strokeDasharray={`${dash} ${c - dash}`}
            />
          </svg>

          <div className="donut-center">
            <div className="big">{Math.round(usage.percent)}%</div>
            <div className="small">Used</div>
          </div>
        </div>

        <div className="usage-text">
          <div className="usage-title">Local Storage Usage</div>
          <div className="usage-sub">
            Used <b>{usage.usedLabel}</b> of <b>{usage.quotaLabel}</b>
          </div>
        </div>
      </div>

      <div className="breakdown-card">
        <div className="break-row">
          <div className="left">
            <span className="dot used" />
            <div>
              <div className="label">Used</div>
              <div className="sub">Saved app settings, user data</div>
            </div>
          </div>
          <div className="value">{usage.usedLabel}</div>
        </div>

        <div className="break-row">
          <div className="left">
            <span className="dot free" />
            <div>
              <div className="label">Free</div>
              <div className="sub">Remaining space</div>
            </div>
          </div>
          <div className="value">{usage.freeLabel}</div>
        </div>

        <button
          className="clear-btn"
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
        >
          Clear Local Storage
        </button>
      </div>

      <div className="tip-card">
        <div className="tip-title">What is this?</div>
        <div className="tip-sub">
          This page shows how much data your app saved in your browser (localStorage).
        </div>
      </div>
    </div>
  );
}
