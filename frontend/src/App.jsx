import React, { Suspense } from "react";
import { optimizeImage } from "./utils/imageOptimizer";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AppRoutes from "./routes";
import Loader from "./components/common/Loader/Loader";

const LazyImage = React.lazy(() => import("./components/common/LazyImage"));

function App() {
  const imageData = optimizeImage("/images/hero.jpg", [400, 800, 1200]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <Suspense fallback={<Loader />}>
            <AppRoutes />
          </Suspense>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
