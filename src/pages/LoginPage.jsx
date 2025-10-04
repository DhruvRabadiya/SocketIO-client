import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { toast } from "react-hot-toast";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleLogin = async (credentials) => {
    setIsLoading(true); // Start loading
    try {
      await login(credentials);
      navigate("/");
    } catch (err) {
      // Get the specific error message from the API response, or show a default one
      const errorMessage =
        err.response?.data?.message || "Login failed. Please try again.";
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false); // Stop loading, whether it succeeded or failed
    }
  };

  return (
    <AuthForm formType="login" onSubmit={handleLogin} isLoading={isLoading} />
  );
};

export default LoginPage;
