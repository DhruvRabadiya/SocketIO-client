import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserList from "../components/UserList";
import Avatar from "../components/Avatar";
import { FaSignOutAlt } from "react-icons/fa";
import { useMediaQuery } from "../hooks/useMediaQuery";

const MainLayout = () => {
  const { user, logout } = useAuth();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { pathname } = useLocation();

  // ✅ FIX: Make sure to check for BOTH '/chat/' and '/group/' in the URL
  const isChatOpen =
    pathname.includes("/chat/") || pathname.includes("/group/");

  return (
    <div className="flex h-screen w-full font-sans">
      {/* Dark Sidebar */}
      <aside
        className={`
          ${isChatOpen && !isDesktop ? "hidden" : "flex"} 
          w-full flex-col bg-gray-800 text-white
          md:flex md:w-80 md:shrink-0 lg:w-96
        `}
      >
        <UserList />
        {/* Profile/Logout section at the bottom */}
        <div className="mt-auto flex items-center justify-between border-t border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <Avatar username={user?.username} />
            <span className="font-semibold">{user?.username}</span>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="cursor-pointer rounded-lg p-3 text-gray-400 transition-colors hover:bg-red-500 hover:text-white"
          >
            <FaSignOutAlt size={20} />
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main
        className={`
          ${!isChatOpen && !isDesktop ? "hidden" : "flex"}
          h-full w-full flex-col
          md:flex
        `}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
