import { useState } from "react";
import "../MonitorCard.css";

export function MonitorCard({ monitor, statusData, onSelect, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  // Fallback line points if backend history array is empty
  const rawLatency = statusData?.latency || 0;
  const history =
    statusData?.history && statusData.history.length > 1
      ? statusData.history
      : [
          rawLatency * 0.9 || 20,
          rawLatency * 1.1 || 25,
          rawLatency * 0.8 || 18,
          rawLatency * 1.2 || 30,
          rawLatency * 0.95 || 22,
          rawLatency || 20,
        ];

  const currentLatency = statusData?.latency
    ? `${statusData.latency}ms`
    : "OFFLINE";
  const checkType = monitor.type || "HTTP";
  const port = monitor.port;

  const generateSparkline = (points) => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 120;
    const height = 30;

    return points
      .map((val, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3;
        return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  };

  return (
    <div className="monitor-card" onClick={() => onSelect(monitor.id)}>
      {/* Left Column: Metric & Info */}
      <div className="card-left">
        <div className="type-badge">{`${checkType}${port ? ":" + port : ""}`}</div>
        <div className="metric-large">{currentLatency}</div>
        <div className="device-name">{monitor.name}</div>
      </div>

      {/* Right Column: Menu & Sparkline */}
      <div className="card-right">
        <div
          className="card-menu-container"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="menu-btn" onClick={() => setShowMenu(!showMenu)}>
            •••
          </button>
          {showMenu && (
            <div className="dropdown-menu">
              <button
                className="delete-btn"
                onClick={() => {
                  setShowMenu(false);
                  onDelete(monitor.id);
                }}
              >
                Delete Monitor
              </button>
            </div>
          )}
        </div>

        <div className="sparkline-container">
          <svg viewBox="0 0 120 40" className="sparkline-svg">
            <path
              d={generateSparkline(history)}
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="status-subtext">
            {statusData?.isUp ? "● Online" : "▲ Down"}
          </span>
        </div>
      </div>
    </div>
  );
}
