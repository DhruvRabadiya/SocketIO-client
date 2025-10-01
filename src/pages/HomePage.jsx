import React from "react";
import { useAuth } from "../context/AuthContext";
import Chat from "../components/Chat";

const HomePage = () => {
  const { user, logout } = useAuth();
  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <header className="flex items-center justify-between border-b bg-white p-4 shadow-sm">
        <div className="flex-1">
          <span className="text-xl font-semibold">Chat App</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden font-bold text-gray-700 sm:block">
            Welcome, {user?.username}!
          </span>
          <button
            onClick={logout}
            className="cursor-pointer rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="flex flex-grow items-center justify-center overflow-hidden p-4">
        <Chat />
      </main>
    </div>
  );
};

export default HomePage;
