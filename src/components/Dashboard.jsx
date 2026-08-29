import { useEffect, useState } from "react";
import { apiFetch, setToken, removeToken, getToken } from "../api";

export function Dashboard() {
  const [monitors, setMonitors] = useState({});
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("HTTP");
  const [port, setPort] = useState("");

  const loadMonitors = async () => {
    const data = await apiFetch("/monitors");

    if (data) setMonitors(data);
  };

  useEffect(() => {
    loadMonitors();

    const token = getToken();
    const ws = new WebSocket(`ws://localhost:8080?token=${token}`);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.monitorId) {
          loadMonitors();
        }
      } catch (error) {}
    };
    return () => ws.close();
  }, []);

  const handleAddMonitor = async (e) => {
    e.preventDefault();
    await apiFetch("/monitors", {
      method: "POST",
      body: JSON.stringify({
        name,
        url,
        type,
        port: Number(port) ? Number(port) : null,
      }),
    });
    setName("");
    setUrl("");
    setType("HTTP");
    loadMonitors();
  };

  return (
    <div className="dashboard-layout">
      <header>
        <h1>NetStatus Operations</h1>

        <div className="actionButtons">
          <button>Add Recipient</button>
          <button
            className="logout-btn"
            onClick={() => {
              removeToken();
              window.location.reload();
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/**Add monitor form. */}
      <section className="card">
        <h3>Add Target Monitor</h3>
        <form onSubmit={handleAddMonitor} className="inline-form">
          <input
            type="text"
            placeholder="Host Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="URL / IP"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              if (type === "TCP" && port) {
                setPort("");
              }
            }}
          >
            <option value="HTTP">HTTP</option>
            <option value="TCP">TCP</option>
            <option value="ICMP">ICMP Ping</option>
          </select>

          <input
            disabled={type !== "TCP" ? true : false}
            type="number"
            placeholder="Port"
            value={port}
            onChange={(e) => setPort(e.target.value)}
          />

          <button type="submit">Add Monitor</button>
        </form>
      </section>

      {/** Real time status grid. */}
      <section className="grid">
        {Object.entries(monitors).map(([hostName, stats]) => (
          <div
            key={hostName}
            className={`monitor-card ${stats.is_up ? "up" : "down"}`}
          >
            <h3>{hostName}</h3>
            <div className="status-indicator">
              Status: <strong>{stats.is_up ? "ONLINE" : "OFFLINE"}</strong>
            </div>
            <p>
              Avg Latency:{" "}
              {stats.avg_latency
                ? `${Math.round(stats.avg_latency)} ms`
                : `N/A`}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
