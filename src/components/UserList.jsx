import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAllUsers, getUserGroups } from "../services/api";
import { toast } from "react-hot-toast";
import { FaPlus, FaComments, FaUserFriends } from "react-icons/fa";
import Avatar from "./Avatar";
import Spinner from "./Spinner";
import CreateGroupModal from "./CreateGroupModal";

const UserList = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 1. Set the default active tab to 'directs'
  const [activeTab, setActiveTab] = useState("directs");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersResponse, groupsResponse] = await Promise.all([
        getAllUsers(),
        getUserGroups(),
      ]);

      const otherUsers = user?.id
        ? usersResponse.data.getAllusers.filter((u) => u._id !== user.id)
        : usersResponse.data.getAllusers;

      setUsers(otherUsers);
      setGroups(groupsResponse.data.groups);
    } catch (error) {
      toast.error("Could not fetch contacts and groups.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const handleGroupCreated = () => {
    fetchData();
  };

  const TabButton = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`cursor-pointer flex flex-1 items-center justify-center gap-2 p-3 text-sm font-semibold transition-colors ${
        activeTab === tabName
          ? "border-b-2 border-blue-500 text-blue-500"
          : "border-b-2 border-transparent text-gray-400 hover:text-gray-200"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <>
      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
      <div className="flex h-full flex-col">
        <div className="shrink-0 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Chats</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="cursor-pointer flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              title="Create a new group"
            >
              <FaPlus />
              New Group
            </button>
          </div>
          {/* 2. Reorder the tab buttons to show Direct Messages first */}
          <div className="mt-4 flex border-b border-gray-700">
            <TabButton
              tabName="directs"
              label="Direct Messages"
              icon={<FaComments />}
            />
            <TabButton
              tabName="groups"
              label="Groups"
              icon={<FaUserFriends />}
            />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto">
          {isLoading ? (
            <div className="mt-10">
              <Spinner />
            </div>
          ) : (
            <>
              {/* 3. Reorder the content blocks to match the new tab order */}
              {/* Direct Messages List */}
              {activeTab === "directs" && (
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
              {/* Groups List */}
              {activeTab === "groups" && (
                <ul>
                  {groups.length > 0 ? (
                    groups.map((group) => (
                      <li key={group._id}>
                        <NavLink
                          to={`/group/${group._id}`}
                          className={({ isActive }) =>
                            `flex items-center gap-4 px-6 py-4 transition-colors ${
                              isActive
                                ? "bg-gray-900/50"
                                : "hover:bg-gray-700/50"
                            }`
                          }
                        >
                          <Avatar username={group.groupName} />
                          <p className="text-lg font-medium text-gray-200">
                            {group.groupName}
                          </p>
                        </NavLink>
                      </li>
                    ))
                  ) : (
                    <p className="px-6 py-4 text-center text-sm text-gray-400">
                      No groups yet. Create one!
                    </p>
                  )}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UserList;
