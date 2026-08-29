import { useState } from "react";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { getToken } from "./api";
import "./index.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());

  return (
    <main>
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </main>
  );
}

export default App;
