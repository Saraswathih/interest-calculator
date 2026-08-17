import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/Support.css";

export default function Export() {
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleExport = async () => {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/export-data`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Export failed");
      }

      setMessage("Data exported successfully to Amazon S3!");

      // Open the temporary S3 download link
      window.open(data.downloadUrl, "_blank");
    } catch (err) {
      console.error("Export error:", err);
      setError(err.message || "Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="supportWrap">
      <div className="supportTop">
        <button
          className="supportBack"
          onClick={() => nav(-1)}
        >
          ←
        </button>

        <h3>Export</h3>

        <span className="ghost">.</span>
      </div>

      <div className="supportCard">
        <h4>Download Data</h4>

        <p style={{ opacity: 0.85 }}>
          Export your customers and transactions data and
          securely store the report in Amazon S3.
        </p>

        <button
          className="loginBtn"
          style={{ marginTop: 12 }}
          onClick={handleExport}
          disabled={loading}
        >
          {loading ? "Exporting..." : "Export Data"}
        </button>

        {message && (
          <p style={{ marginTop: 12, opacity: 0.9 }}>
            ✅ {message}
          </p>
        )}

        {error && (
          <p style={{ marginTop: 12, opacity: 0.9 }}>
            ❌ {error}
          </p>
        )}
      </div>
    </div>
  );
}