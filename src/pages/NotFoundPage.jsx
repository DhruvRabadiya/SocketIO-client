import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FaExclamationTriangle, FaHome, FaArrowLeft } from "react-icons/fa";

const NotFoundPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.error("Page Not Found");
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-center">
      <FaExclamationTriangle className="text-5xl text-yellow-500" />
      <h1 className="mt-4 text-4xl font-bold text-gray-800">404 - Not Found</h1>
      <p className="mt-2 text-lg text-gray-600">
        Sorry, the page you are looking for does not exist.
      </p>
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-lg bg-gray-500 px-4 py-2 font-semibold text-white transition hover:bg-gray-600"
        >
          <FaArrowLeft />
          Go Back
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
        >
          <FaHome />
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
