import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllUsers } from "../services/api";
import { toast } from "react-hot-toast";

const HomePage = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUsers();
        // Filter out the current logged-in user from the list
        const otherUsers = response.data.getAllusers.filter(
          (u) => u.username !== user.username
        );
        setUsers(otherUsers);
      } catch (error) {
        toast.error("Could not fetch users.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b bg-white p-4 shadow-sm">
        <div className="flex-1">
          <span className="text-xl font-semibold">Chat App</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6 text-gray-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>

            <span className="font-semibold text-gray-700">
              {user?.username}
            </span>
          </div>
          <div className="h-6 w-px bg-gray-200"></div>

          <button
            onClick={logout}
            className="cursor-pointer rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="flex-grow overflow-y-auto bg-gray-100 p-4">
        <div className="mx-auto max-w-md">
          <ul className="space-y-3">
            {users.map((chatUser) => (
              <li key={chatUser._id}>
                <Link
                  to={`/chat/${chatUser._id}`}
                  className="block transform rounded-lg bg-white p-4 shadow transition duration-200 hover:scale-105 hover:bg-blue-50"
                >
                  <p className="font-semibold text-gray-800">
                    {chatUser.username}
                  </p>
                  <p className="text-sm text-gray-500">{chatUser.email}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
