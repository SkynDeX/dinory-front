import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RewardProvider } from "./components/RewardContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <Router>
      <AuthProvider>
        <RewardProvider>
          <AppRoutes />
        </RewardProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
