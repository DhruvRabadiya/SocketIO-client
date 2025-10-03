import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthProvider, { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MainLayout from "./pages/MainLayout";
import ChatPage from "./pages/ChatPage";
import ChatPlaceholder from "./components/ChatPlaceholder";
import Spinner from "./components/Spinner"; 
import { Toaster } from "react-hot-toast";

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) {
    // Use the new Spinner component for a better loading experience
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <Routes>
          {/* Auth routes are separate from the main app layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Main app routes are now nested inside the MainLayout */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            {/* The index route shows the placeholder when at "/" */}
            <Route index element={<ChatPlaceholder />} />
            {/* The dynamic route shows the chat page */}
            <Route path="chat/:userId" element={<ChatPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
