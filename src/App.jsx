import { useState } from "react";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { ChangePassword } from "./components/ChangePassword";
import { MonitorDetails } from "./components/MonitorDetails";
import { getToken, apiFetch } from "./api";
import "./index.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [selectedMonitorId, setSelectedMonitorId] = useState(null);

  const handleDelete = async (id) => {
    if (!id || !window.confirm("Are you sure you want to delete this monitor?"))
      return;
    const data = await apiFetch(`/monitors/${id}`, {
      method: "DELETE",
    });
    if (data.success) {
      setSelectedMonitorId(null);
      // Reload page or trigger monitor reload state
      window.location.reload();
    }
  };

  const handleLoginSuccess = ({ firstLogin }) => {
    if (firstLogin) {
      setIsFirstLogin(true);
    } else {
      setIsAuthenticated(true);
    }
  };

  const handlePasswordChanged = () => {
    setIsFirstLogin(false);
    setIsAuthenticated(true);
  };

  return (
    <main>
      {isFirstLogin ? (
        <ChangePassword onSucces={handlePasswordChanged} />
      ) : !isAuthenticated ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : selectedMonitorId ? (
        <MonitorDetails
          monitorId={selectedMonitorId}
          onBack={() => setSelectedMonitorId(null)}
        />
      ) : (
        <Dashboard
          onSelectMonitor={(id) => {
            setSelectedMonitorId(id);
          }}
          onDeleteMonitor={handleDelete}
        />
      )}
    </main>
  );
}

export default App;
