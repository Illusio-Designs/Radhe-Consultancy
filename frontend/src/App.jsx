import React, { Suspense } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import "./App.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Loader from "./components/common/Loader/Loader";
import { Router } from "./routes";
import "./styles/icons.css";

// Check if Google Client ID is available
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (!googleClientId) {
  console.error("Google Client ID is not set in environment variables");
}

function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <DataProvider>
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-screen">
                <Loader />
              </div>
            }
          >
            <Router />
          </Suspense>
        </DataProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
