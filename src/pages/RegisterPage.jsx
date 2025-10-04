import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { toast } from "react-hot-toast";

const RegisterPage = () => {
  const { register, login } = useAuth(); // Assuming you still want to auto-login
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleRegister = async (userData) => {
    setIsLoading(true); // Start loading
    try {
      await register(userData);
      toast.success("Registration successful! Logging you in...");
      // Automatically log the user in after successful registration
      await login({
        emailOrUsername: userData.email,
        password: userData.password,
      });
      navigate("/");
    } catch (err) {
      // Get the specific error message from the API response
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <AuthForm
      formType="register"
      onSubmit={handleRegister}
      isLoading={isLoading}
    />
  );
};

export default RegisterPage;
