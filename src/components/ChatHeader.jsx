import React, { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import {
  FaArrowLeft,
  FaUserPlus,
  FaEdit,
  FaCheck,
  FaTimes,
  FaEllipsisV,
  FaSignOutAlt,
} from "react-icons/fa";
import Avatar from "./Avatar";
import { useMediaQuery } from "../hooks/useMediaQuery";

const ChatHeader = ({
  chatPartner,
  isGroupChat,
  onlineUsers,
  onAddMemberClick,
  onSaveRename,
  onLeaveGroup,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (chatPartner) {
      setNewGroupName(chatPartner.name);
    }
  }, [chatPartner]);

  const handleSave = (event) => {
    event.preventDefault();
    if (newGroupName.trim() && newGroupName !== chatPartner.name) {
      onSaveRename(newGroupName);
    }
    setIsEditingName(false);
  };

  let onlineStatusText = null;
  if (isGroupChat && chatPartner?.participants) {
    const onlineCount = chatPartner.participants.filter((p) =>
      onlineUsers.includes(p)
    ).length;
    onlineStatusText = `${onlineCount} of ${chatPartner.participants.length} members online`;
  } else if (!isGroupChat && chatPartner?._id) {
    const isOnline = onlineUsers.includes(chatPartner._id);
    onlineStatusText = isOnline ? "Online" : "Offline";
  }

  return (
    <header className="flex shrink-0 items-center justify-between border-b bg-white p-4">
      <div className="flex min-w-0 items-center gap-4">
        {!isDesktop && (
          <Link
            to="/"
            className="cursor-pointer p-2 text-gray-500 hover:text-blue-500"
          >
            <FaArrowLeft size={20} />
          </Link>
        )}
        {chatPartner && <Avatar username={chatPartner.name} />}
        <div className="min-w-0 flex-1">
          {isEditingName ? (
            <form onSubmit={handleSave} className="flex items-center gap-2">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsEditingName(false);
                }}
                className="min-w-0 rounded-md border border-gray-300 px-2 py-1 text-lg font-bold"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="cursor-pointer p-1 text-gray-500 hover:text-red-500"
              >
                <FaTimes />
              </button>
              <button
                type="submit"
                className="cursor-pointer p-1 text-gray-500 hover:text-green-500"
              >
                <FaCheck />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="truncate text-lg font-bold text-gray-800">
                {chatPartner?.name || "..."}
              </h2>
              {isGroupChat && (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="cursor-pointer text-gray-400 hover:text-blue-500"
                >
                  <FaEdit />
                </button>
              )}
            </div>
          )}
          {onlineStatusText && (
            <p
              className={`truncate text-xs ${
                onlineStatusText.includes("Online") ||
                onlineStatusText.includes("online")
                  ? "text-green-500"
                  : "text-gray-500"
              }`}
            >
              {onlineStatusText}
            </p>
          )}
        </div>
      </div>
      {isGroupChat && (
        <Menu as="div" className="relative">
          <Menu.Button className="cursor-pointer rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-blue-500">
            <FaEllipsisV size={20} />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={onAddMemberClick}
                      className={`${
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                      } group flex w-full items-center px-4 py-2 text-sm`}
                    >
                      <FaUserPlus className="mr-3 h-5 w-5 text-gray-400" />
                      Add Member
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={onLeaveGroup}
                      className={`${
                        active ? "bg-red-50 text-red-700" : "text-red-600"
                      } group flex w-full items-center px-4 py-2 text-sm`}
                    >
                      <FaSignOutAlt className="mr-3 h-5 w-5" />
                      Leave Group
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      )}
    </header>
  );
};

export default ChatHeader;
