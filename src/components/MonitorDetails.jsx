import { useEffect, useState } from "react";
import { apiFetch } from "../api";
import "../MonitorDetails.css";

export function MonitorDetails({ monitorId, onBack }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const data = await apiFetch(`/monitors/${monitorId}/logs`);

        if (data.success) setDetails(data);
        else throw new Error();
      } catch (err) {
        console.error("Failed to load monitor logs", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [monitorId]);

  if (loading)
    return <div className="details-loading">Loading monitor logs...</div>;

  return (
    <div className="details-container">
      <div className="details-header">
        <button onClick={onBack} className="back-btn">
          ← Back to Dashboard
        </button>
        <h2>{details?.name || "Monitor"} — Performance Logs</h2>
      </div>

      <div className="table-card">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Status</th>
              <th className="text-right">Latency</th>
            </tr>
          </thead>
          <tbody>
            {details?.logs && details.logs.length > 0 ? (
              details.logs.map((log, idx) => (
                <tr key={idx}>
                  <td className="timestamp-cell">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td>
                    <span
                      className={`status-pill ${log.is_up ? "up" : "down"}`}
                    >
                      {log.status_code || (log.is_up ? "UP" : "DOWN")}
                    </span>
                  </td>
                  <td className="text-right latency-cell">
                    {log.latency_ms || 0} ms
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="empty-state">
                  No log entries found for this monitor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
