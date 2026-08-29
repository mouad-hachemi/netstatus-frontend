import { useState } from "react";
import { apiFetch, setToken } from "../api";

export function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("submitting form.");
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      if (data.success && data.token) {
        setToken(data.token);
        onLoginSuccess();
      } else {
        setError(data.error || "Login failed");
        setPassword("");
      }
    } catch (error) {
      console.log(error);
      setPassword("");
      setUsername("");
      setError("Network error connecting to server");
    }
  };

  return (
    <div className="auth-card">
      <h2>NetStatus Login</h2>
      {error && <p className="error-badge">{error}</p>}
      <form onSubmit={handleSubmit} className="topdown-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
