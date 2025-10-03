import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllUsers } from "../services/api";
import { toast } from "react-hot-toast";
import Avatar from "./Avatar";
import Spinner from "./Spinner";

const UserList = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      getAllUsers()
        .then((response) => {
          const otherUsers = response.data.getAllusers.filter(
            (u) => u._id !== user.id
          );
          setUsers(otherUsers);
        })
        .catch(() => toast.error("Could not fetch users."))
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="flex h-full flex-col">
      {/* Sidebar Header */}
      <div className="shrink-0 border-b border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-white">Chats</h2>
      </div>

      {/* User List with scrolling */}
      <div className="flex-grow overflow-y-auto">
        {loading ? (
          <div className="mt-10">
            <Spinner />
          </div>
        ) : (
          <ul>
            {users.map((chatUser) => (
              <li key={chatUser._id}>
                <NavLink
                  to={`/chat/${chatUser._id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-6 py-4 transition-colors ${
                      isActive ? "bg-gray-900/50" : "hover:bg-gray-700/50"
                    }`
                  }
                >
                  <Avatar username={chatUser.username} />
                  <p className="text-lg font-medium text-gray-200">
                    {chatUser.username}
                  </p>
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default UserList;
