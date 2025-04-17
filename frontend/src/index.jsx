import React from "react";
import ReactDOM from "react-dom";
import { LoadingProvider } from "./contexts/LoadingContext";
import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <LoadingProvider>
      <App />
    </LoadingProvider>
  </React.StrictMode>,
  document.getElementById("root")
);