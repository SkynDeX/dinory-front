import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RewardProvider } from "./context/RewardContext";
import RouterWrapper from "./routes/RouterWrapper";
import { ChildProvider } from "./context/ChildContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <RewardProvider>
          <ChildProvider>
            <RouterWrapper />
          </ChildProvider>
        </RewardProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
