import { useState } from "react";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { ChangePassword } from "./components/ChangePassword";
import { getToken } from "./api";
import "./index.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const [isFirstLogin, setIsFirstLogin] = useState(false);

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
      ) : isAuthenticated ? (
        <Dashboard />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </main>
  );
}

export default App;
