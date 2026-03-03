import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Reminders.css";

export default function Reminders() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  // Demo data (later we will connect backend)
  const data = useMemo(
    () => ({
      today: [
        {
          id: "t1",
          title: "Payment Reminder",
          sub: "3 payments due (Ramesh, Arjun, Meera)",
          time: "2h",
          tag: "Due"
        },
        {
          id: "t2",
          title: "Investor Update",
          sub: "Shiva interest payout coming soon",
          time: "5h",
          tag: "Info"
        }
      ],
      yesterday: [
        {
          id: "y1",
          title: "Payment Reminder",
          sub: "1 payment overdue (Sita)",
          time: "1d",
          tag: "Overdue"
        },
        {
          id: "y2",
          title: "New Transaction",
          sub: "₹50,000 added to portfolio",
          time: "1d",
          tag: "Success"
        }
      ]
    }),
    []
  );

  const filterList = (list) => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(
      (x) =>
        x.title.toLowerCase().includes(s) ||
        x.sub.toLowerCase().includes(s) ||
        x.tag.toLowerCase().includes(s)
    );
  };

  const today = filterList(data.today);
  const yesterday = filterList(data.yesterday);

  const Card = ({ item, delay = 0 }) => (
    <button
      className="rem-card"
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => alert(`Open details for: ${item.title}`)}
    >
      <div className="rem-avatar">
        <span>{item.title?.[0] || "R"}</span>
      </div>

      <div className="rem-body">
        <div className="rem-row">
          <h4 className="rem-title">{item.title}</h4>
          <span className="rem-time">{item.time}</span>
        </div>
        <p className="rem-sub">{item.sub}</p>

        <div className="rem-footer">
          <span className={`rem-tag tag-${item.tag.toLowerCase()}`}>
            {item.tag}
          </span>
          <span className="rem-more">More →</span>
        </div>
      </div>
    </button>
  );

  return (
    <div className="rem-page">
      {/* Header */}
      <div className="rem-top">
        <button className="rem-back" onClick={() => navigate(-1)}>
          ←
        </button>
        <div className="rem-heading">
          <h2>Notifications</h2>
          <p>Track payments, updates & alerts</p>
        </div>
        <button
          className="rem-info"
          onClick={() => alert("Notifications info")}
          aria-label="Info"
        >
          i
        </button>
      </div>

      {/* Search */}
      <div className="rem-search">
        <span className="rem-search-ico">🔍</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, keyword..."
        />
        <button
          className="rem-filter"
          onClick={() => alert("Filter UI next step")}
          aria-label="Filter"
        >
          ⚙
        </button>
      </div>

      {/* List */}
      <div className="rem-section">
        <div className="rem-section-title">
          <span>Today</span>
          <small>{today.length}</small>
        </div>

        {today.length === 0 ? (
          <div className="rem-empty">
            <h4>No notifications for today</h4>
            <p>Try searching different keywords.</p>
          </div>
        ) : (
          <div className="rem-list">
            {today.map((item, idx) => (
              <Card key={item.id} item={item} delay={idx * 80} />
            ))}
          </div>
        )}
      </div>

      <div className="rem-section">
        <div className="rem-section-title">
          <span>Yesterday</span>
          <small>{yesterday.length}</small>
        </div>

        {yesterday.length === 0 ? (
          <div className="rem-empty">
            <h4>No notifications yesterday</h4>
            <p>You are all caught up ✨</p>
          </div>
        ) : (
          <div className="rem-list">
            {yesterday.map((item, idx) => (
              <Card key={item.id} item={item} delay={idx * 80 + 120} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
