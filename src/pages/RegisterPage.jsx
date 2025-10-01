import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { toast } from "react-hot-toast"; // <-- Import toast

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (userData) => {
    try {
      await register(userData);
      // Use toast.success for success
      toast.success("Registration successful! Please log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      // Use toast.error for failure
      toast.error("Registration failed. Please try again.");
      console.error(err);
    }
  };

  return <AuthForm formType="register" onSubmit={handleRegister} />;
};

export default RegisterPage;
