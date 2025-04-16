import React, { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Loader from "./components/common/Loader/Loader";
import router from "./routes";

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Suspense fallback={<Loader />}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
