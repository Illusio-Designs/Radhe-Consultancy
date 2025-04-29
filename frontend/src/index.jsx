import React from "react";
import ReactDOM from "react-dom";
import { LoadingProvider } from "./contexts/LoadingContext";
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <LoadingProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LoadingProvider>
  </React.StrictMode>,
  document.getElementById("root")
);