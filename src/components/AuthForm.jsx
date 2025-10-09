import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaComments,
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema, loginSchema } from "../utils/validationSchemas";

const AuthForm = ({ formType, onSubmit, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isRegister = formType === "register";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(isRegister ? registerSchema : loginSchema),
  });

  const onFormSubmit = (data) => {
    if (isLoading) return;
    if (isRegister) {
      onSubmit(data);
    } else {
      onSubmit({
        emailOrUsername: data.emailOrUsername,
        password: data.password,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-200 p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 rounded-full bg-blue-600 p-4 text-white">
            <FaComments size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">
            Chattr
          </h1>
          <p className="text-gray-500">A new way to connect</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
          <h2 className="mb-2 text-center text-2xl font-bold text-gray-700">
            {isRegister ? "Create Account" : "Sign In"}
          </h2>
          <p className="mb-8 text-center text-gray-500">
            {isRegister ? "Get started" : "Welcome back"}
          </p>

          <form
            onSubmit={handleSubmit(onFormSubmit)}
            className="flex flex-col gap-4"
          >
            {isRegister && (
              <div>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Username"
                    {...register("username")}
                    className={`w-full rounded-lg border bg-gray-50 p-3 pl-12 text-base focus:outline-none focus:ring-2 ${
                      errors.username
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.username.message}
                  </p>
                )}
              </div>
            )}
            <div>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={isRegister ? "Email" : "Email or Username"}
                  {...register(isRegister ? "email" : "emailOrUsername")}
                  className={`w-full rounded-lg border bg-gray-50 p-3 pl-12 text-base focus:outline-none focus:ring-2 ${
                    errors.email || errors.emailOrUsername
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
              </div>
              {(errors.email || errors.emailOrUsername) && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.email?.message || errors.emailOrUsername?.message}
                </p>
              )}
            </div>
            <div>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  {...register("password")}
                  className={`w-full rounded-lg border bg-gray-50 p-3 pl-12 text-base focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="cursor-pointer mt-4 flex items-center justify-center rounded-lg bg-blue-600 p-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="mr-2 h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : isRegister ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
        <p className="mt-8 text-center text-sm text-gray-600">
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <Link
            to={isRegister ? "/login" : "/register"}
            className="font-medium text-blue-600 hover:underline"
          >
            {isRegister ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};
export default AuthForm;
