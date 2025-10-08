import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaUserPlus,
  FaEdit,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import Avatar from "./Avatar";
import { useMediaQuery } from "../hooks/useMediaQuery";

const ChatHeader = ({
  chatPartner,
  isGroupChat,
  onlineUsers,
  onAddMemberClick,
  onSaveRename,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    if (chatPartner) {
      setNewGroupName(chatPartner.name);
    }
  }, [chatPartner]);

  const handleSave = () => {
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
      <div className="flex items-center gap-4">
        {!isDesktop && (
          <Link
            to="/"
            className="cursor-pointer p-2 text-gray-500 hover:text-blue-500"
          >
            <FaArrowLeft size={20} />
          </Link>
        )}
        {chatPartner && <Avatar username={chatPartner.name} />}
        <div>
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") setIsEditingName(false);
                }}
                className="rounded-md border border-gray-300 px-2 py-1 text-lg font-bold"
                autoFocus
              />
              <button
                onClick={() => setIsEditingName(false)}
                className="cursor-pointer p-1 text-gray-500 hover:text-red-500"
              >
                <FaTimes />
              </button>
              <button
                onClick={handleSave}
                className="cursor-pointer p-1 text-gray-500 hover:text-green-500"
              >
                <FaCheck />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800">
                {chatPartner.name}
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
              className={`text-xs ${
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
        <button
          onClick={onAddMemberClick}
          className="cursor-pointer p-2 text-gray-500 transition hover:text-blue-500"
          title="Add Member"
        >
          <FaUserPlus size={20} />
        </button>
      )}
    </header>
  );
};

export default ChatHeader;
