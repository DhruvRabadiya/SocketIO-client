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
  const { user, socket, onlineUsers } = useAuth();
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
          ? "border-b-2 border-blue-500 text-white"
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
              {activeTab === "directs" && (
                <ul>
                  {users.map((chatUser) => {
                    const isOnline = onlineUsers.includes(chatUser._id);
                    return (
                      <li key={chatUser._id}>
                        <NavLink
                          to={`/chat/${chatUser._id}`}
                          className={({ isActive }) =>
                            `flex items-center gap-4 px-6 py-4 transition-colors ${
                              isActive
                                ? "bg-gray-900/50"
                                : "hover:bg-gray-700/50"
                            }`
                          }
                        >
                          <div className="relative shrink-0">
                            <Avatar username={chatUser.username} />
                            {isOnline ? (
                              <div
                                className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-gray-800 bg-green-500"
                                title="Online"
                              ></div>
                            ) : (
                              <div
                                className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-gray-800 bg-gray-500"
                                title="Offline"
                              ></div>
                            )}
                          </div>
                          <p className="text-lg font-medium text-gray-200">
                            {chatUser.username}
                          </p>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              )}
              {activeTab === "groups" && (
                <ul>
                  {groups.length > 0 ? (
                    groups.map((group) => {
                      const onlineMembersInGroup = group.participants.filter(
                        (p) => onlineUsers.includes(p)
                      );
                      const otherOnlineMembersCount =
                        onlineMembersInGroup.filter(
                          (id) => id !== user.id
                        ).length;

                      return (
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
                            <div className="flex-grow">
                              <p className="text-lg font-medium text-gray-200">
                                {group.groupName}
                              </p>
                              {otherOnlineMembersCount > 0 ? (
                                <div className="flex items-center gap-1.5 text-xs text-green-400">
                                  <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                                  </span>
                                  {otherOnlineMembersCount} online
                                </div>
                              ) : (
                                <p className="truncate text-xs text-gray-400">
                                  No one else is online
                                </p>
                              )}
                            </div>
                          </NavLink>
                        </li>
                      );
                    })
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
