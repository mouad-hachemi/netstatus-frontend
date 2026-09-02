import { useEffect, useState } from "react";
import { apiFetch, removeToken, getToken } from "../api";

export function Dashboard() {
  const [monitors, setMonitors] = useState({});
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("HTTP");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [chatId, setChatId] = useState("");
  const [message, setMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("");

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

    ws.onclose = (event) => {
      if (event.code === 4003) {
        removeToken();
        window.location.reload();
      }
    };

    return () => ws.close();
  }, []);

  const handleAddMonitor = async (e) => {
    e.preventDefault();
    const resp = await apiFetch("/monitors", {
      method: "POST",
      body: JSON.stringify({
        name,
        url,
        type,
        port: Number(port) ? Number(port) : null,
      }),
    });

    if (resp.success) {
      setToastType("success");
      setMessage("Monitor added successfuly");
    } else {
      setToastType("error");
      setMessage(resp.error ? resp.error : "Failed to add monitor");
    }

    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 2000);

    setTimeout(() => {
      setMessage("");
      setToastType("");
    }, 2500);

    setName("");
    setUrl("");
    setPort("");
    setType("HTTP");
    loadMonitors();
  };

  const handleAddRecipient = async (e) => {
    e.preventDefault();
    const resp = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
        chat_id: chatId,
      }),
    });

    if (resp.success) {
      setToastType("success");
      setMessage("Recipient added successfuly");
    } else {
      setToastType("error");
      setMessage(resp.error ? resp.error : "Failed to add recipient");
    }

    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 2000);

    setTimeout(() => {
      setMessage("");
      setToastType("");
    }, 2500);

    const modal = document.getElementById("formModal");
    modal.close();

    setUsername("");
    setPassword("");
    setChatId("");
  };

  return (
    <div className="dashboard-layout">
      <header>
        <h1>NetStatus Operations</h1>

        <div className="actionButtons">
          <button
            onClick={() => {
              const modal = document.getElementById("formModal");
              modal.showModal();
            }}
          >
            Add Recipient
          </button>
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
              const newType = e.target.value;
              setType(e.target.value);
              if (newType !== "TCP" && port) {
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

      {/** Add recipient form */}
      <dialog id="formModal">
        <form
          onSubmit={handleAddRecipient}
          className="topdown-form"
          method="dialog"
        >
          <h3>Add Recipient</h3>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="One-time password"
            value={password}
            onClick={(e) => {
              const tempPass = Math.random().toString(16).slice(2, 10);
              setPassword(tempPass);
            }}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Telegram chat ID"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            required
          />
          <div className="actions">
            <button
              className="btn-cancel"
              type="button"
              onClick={(e) => {
                const modal = document.getElementById("formModal");
                modal.close();
              }}
            >
              Cancel
            </button>
            <button className="btn-submit" type="submit">
              Add
            </button>
          </div>
        </form>
      </dialog>
      <div
        id="toastNotification"
        className={`notification ${showToast ? "show" : ""} ${toastType}`}
      >
        {message}
      </div>
    </div>
  );
}
