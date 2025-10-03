import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import {
  getUserById,
  getChatHistory,
  deleteMessage,
  editMessage,
} from "../services/api";
import { toast } from "react-hot-toast";
import {
  FaTrash,
  FaPaperPlane,
  FaArrowLeft,
  FaEdit,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import Spinner from "../components/Spinner";
import Avatar from "../components/Avatar";
import { useMediaQuery } from "../hooks/useMediaQuery";

const ChatPage = () => {
  const { userId: recipientId } = useParams();
  const { user: currentUser } = useAuth();
  const [recipient, setRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const chatEndRef = useRef(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    setRecipient(null);
    setMessages([]);
    setLoadingHistory(true);
    setNewMessage("");
    setEditingMessage(null);
    setEditText("");
    setSelectedMessage(null);
    if (socket) socket.disconnect();

    getUserById(recipientId)
      .then((response) => setRecipient(response.data.user[0]))
      .catch(console.error);
  }, [recipientId]);

  useEffect(() => {
    if (!currentUser?.id || !recipient?._id) return;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const roomName = [currentUser.id, recipient._id].sort().join("-");
        const response = await getChatHistory(roomName);
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch chat history", error);
        setMessages([]);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [currentUser, recipient]);

  useEffect(() => {
    if (!currentUser?.id || !recipient?._id) return;
    const token = localStorage.getItem("token");
    const newSocket = io(import.meta.env.VITE_BACKEND_URL, { auth: { token } });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      const roomName = [currentUser.id, recipient._id].sort().join("-");
      newSocket.emit("join_private_chat", { roomName });
    });

    newSocket.on("private_message", (confirmedMessage) => {
      setMessages((prevMessages) => {
        const tempMessageExists = prevMessages.some(
          (msg) => msg._id === confirmedMessage.tempId
        );
        if (tempMessageExists) {
          return prevMessages.map((msg) =>
            msg._id === confirmedMessage.tempId ? confirmedMessage : msg
          );
        } else {
          return [...prevMessages, confirmedMessage];
        }
      });
    });

    newSocket.on("message_deleted", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, text: null, isDeleted: true } : msg
        )
      );
    });

    newSocket.on("message_edited", ({ messageId, newText, isEdited }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, text: newText, isEdited: true }
            : msg
        )
      );
    });

    return () => newSocket.disconnect();
  }, [currentUser, recipient]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !socket || !currentUser?.id || !recipient?._id)
      return;
    const tempId = `${Date.now()}-${Math.random()}`;
    const roomName = [currentUser.id, recipient._id].sort().join("-");
    const messageObj = {
      senderId: currentUser.id,
      senderUsername: currentUser.username,
      text: newMessage,
      roomName: roomName,
      tempId: tempId,
    };
    socket.emit("send_private_message", messageObj);
    setMessages((prev) => [...prev, { ...messageObj, me: true, _id: tempId }]);
    setNewMessage("");
  };

  const handleOpenConfirmModal = (e, message) => {
    e.stopPropagation();
    setSelectedMessage(message);
    setIsConfirmModalOpen(true);
  };
  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setSelectedMessage(null);
  };
  const handleConfirmDelete = async () => {
    if (!selectedMessage) return;
    const messageId = selectedMessage._id;
    const roomName = [currentUser.id, recipient._id].sort().join("-");

    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg._id === messageId ? { ...msg, text: null, isDeleted: true } : msg
      )
    );
    handleCloseConfirmModal();
    try {
      await deleteMessage(messageId);
      socket.emit("delete_message", { messageId, roomName });
      toast.success("Message deleted!");
    } catch (error) {
      toast.error("Failed to delete message.");
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? selectedMessage : m))
      );
    }
  };

  const handleStartEdit = (message) => {
    setEditingMessage(message);
    setEditText(message.text);
  };
  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText("");
  };
  const handleSaveEdit = async () => {
    if (!editingMessage || !editText.trim()) return;
    const originalText = editingMessage.text;
    const messageId = editingMessage._id;
    const roomName = [currentUser.id, recipient._id].sort().join("-");
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId ? { ...msg, text: editText, isEdited: true } : msg
      )
    );
    handleCancelEdit();
    try {
      await editMessage(messageId, editText);
      socket.emit("edit_message", { messageId, newText: editText, roomName });
    } catch (error) {
      toast.error("Failed to edit message.");
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, text: originalText, isEdited: editingMessage.isEdited }
            : msg
        )
      );
    }
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (!recipient) {
    return <Spinner />;
  }

  return (
    <div className="flex h-full flex-col font-sans">
      <header className="flex shrink-0 items-center gap-4 border-b bg-white p-4">
        {!isDesktop && (
          <Link
            to="/"
            className="cursor-pointer p-2 text-gray-500 hover:text-blue-500"
          >
            <FaArrowLeft size={20} />
          </Link>
        )}
        <Avatar username={recipient.username} />
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            {recipient.username}
          </h2>
        </div>
      </header>

      <div className="flex-grow overflow-y-auto bg-gray-100 p-6">
        <div className="flex flex-col gap-4">
          {loadingHistory ? (
            <Spinner />
          ) : (
            messages.map((msg) => {
              const isMyMessage = msg.me || msg.senderId === currentUser.id;
              const isEditing = editingMessage?._id === msg._id;

              return (
                <div
                  key={msg._id}
                  className={`group flex items-start gap-2.5 ${
                    isMyMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex flex-col ${
                      isMyMessage ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-lg rounded-2xl px-4 py-3 ${
                        isMyMessage
                          ? "rounded-br-none bg-blue-600 text-white"
                          : "rounded-bl-none bg-gray-700 text-white"
                      }`}
                    >
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full rounded border-b border-white/50 bg-transparent text-white outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit();
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                          />
                          <div className="mt-2 flex justify-end gap-3 text-xs">
                            <button
                              onClick={handleCancelEdit}
                              className="cursor-pointer hover:underline"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              className="cursor-pointer font-bold hover:underline"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : msg.isDeleted ? (
                        <p className="italic text-gray-400">
                          This message was deleted
                        </p>
                      ) : (
                        <p className="text-base whitespace-pre-wrap break-words">
                          {msg.text}
                        </p>
                      )}
                    </div>
                    <span className="px-2 pt-1 text-xs text-gray-400">
                      {formatTime(msg.addedAt || msg.modifiedAt || Date.now())}
                      {msg.isEdited && !msg.isDeleted && (
                        <em className="ml-1">(edited)</em>
                      )}
                    </span>
                  </div>
                  {isMyMessage && !msg.isDeleted && !isEditing && (
                    <div className="flex flex-col gap-2 text-gray-400 opacity-0 transition group-hover:opacity-100">
                      <button
                        onClick={() => handleStartEdit(msg)}
                        className="cursor-pointer p-1 hover:text-blue-400"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={(e) => handleOpenConfirmModal(e, msg)}
                        className="cursor-pointer p-1 hover:text-red-500"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      <footer className="shrink-0 border-t bg-gray-50 p-4">
        <div className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Type a message..."
            className="w-full rounded-full border bg-white py-3 pl-5 pr-14 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="absolute inset-y-0 right-0 flex cursor-pointer items-center rounded-full bg-blue-600 px-5 text-white transition hover:bg-blue-700 disabled:bg-blue-300"
            disabled={!newMessage.trim()}
          >
            <FaPaperPlane size={18} />
          </button>
        </div>
      </footer>

      {isConfirmModalOpen && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleCloseConfirmModal}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold">Delete Message</h2>
            <p className="mt-2 text-gray-600">
              Are you sure you want to permanently delete this message?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseConfirmModal}
                className="cursor-pointer rounded-md bg-gray-200 px-4 py-2 font-semibold text-gray-800 transition hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="cursor-pointer rounded-md bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
