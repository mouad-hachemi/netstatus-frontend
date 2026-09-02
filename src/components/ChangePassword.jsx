import { useState } from "react";
import { apiFetch } from "../api";
import { setToken } from "../api";

export const ChangePassword = ({ onSucces }) => {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault()

    const data = await apiFetch("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({
        newPassword,
      }),
    });

    if (data.success) {
      setToken(data.token);
      onSucces();
    }
  };

  return (
    <div className="auth-card">
      <h2>Change password</h2>
      <p>Please set a new password to continue.</p>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="topdown-form">
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password (min 8 chars)"
          minLength={8}
        />
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
};
