import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { toast } from "react-hot-toast"; // <-- Import toast

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      navigate("/");
    } catch (err) {
      // Use toast.error for failure
      toast.error("Failed to log in. Please check your credentials.");
      console.error(err);
    }
  };

  return <AuthForm formType="login" onSubmit={handleLogin} />;
};

export default LoginPage;
