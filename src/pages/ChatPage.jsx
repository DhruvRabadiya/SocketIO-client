import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { getUserById, getChatHistory } from "../services/api"; // <-- Import getChatHistory

const ChatPage = () => {
  const { userId: recipientId } = useParams();
  const { user: currentUser } = useAuth();
  const [recipient, setRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true); // <-- State for loading history
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const chatEndRef = useRef(null);

  // This effect fetches the recipient's details (no change)
  useEffect(() => {
    getUserById(recipientId)
      .then((response) => setRecipient(response.data.user[0]))
      .catch(console.error);
  }, [recipientId]);

  // This new effect fetches the chat history 📜
  useEffect(() => {
    if (!currentUser?.id || !recipient?._id) return;

    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const roomName = [currentUser.id, recipient._id].sort().join("-");
        const response = await getChatHistory(roomName);
        setMessages(response.data); // Load previous messages into state
      } catch (error) {
        console.error("Failed to fetch chat history", error);
        setMessages([]); // Set to empty array on error
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [currentUser, recipient]);

  // This effect handles the real-time socket connection 🔄
  useEffect(() => {
    if (!currentUser?.id || !recipient?._id) return;

    const token = localStorage.getItem("token");
    const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { token },
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      const roomName = [currentUser.id, recipient._id].sort().join("-");
      newSocket.emit("join_private_chat", { roomName });
    });

    // When a new message arrives, add it to the existing messages
    newSocket.on("private_message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => newSocket.disconnect();
  }, [currentUser, recipient]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    // ... handleSend logic remains the same
    if (!newMessage.trim() || !socket || !currentUser?.id || !recipient?._id)
      return;
    const roomName = [currentUser.id, recipient._id].sort().join("-");
    const messageObj = {
      senderId: currentUser.id,
      senderUsername: currentUser.username,
      text: newMessage,
      roomName: roomName,
    };
    socket.emit("send_private_message", messageObj);
    setMessages((prev) => [...prev, { ...messageObj, me: true }]);
    setNewMessage("");
  };

  if (!recipient) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading chat...</p>
      </div>
    );
  }

  // Helper to format the timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <header className="flex shrink-0 items-center gap-4 border-b bg-white p-4 shadow-sm">
        <Link to="/" className="text-blue-500 hover:text-blue-700">
          &larr; Back
        </Link>
        <h1 className="text-xl font-bold">Chat with {recipient.username}</h1>
      </header>

      <main className="flex flex-grow flex-col overflow-hidden p-4">
        <div className="flex h-full w-full max-w-4xl flex-col self-center rounded-lg bg-white shadow-xl">
          <div className="flex-grow space-y-2 overflow-y-auto p-4">
            {loadingHistory ? (
              <div className="flex h-full items-center justify-center text-gray-500">
                Loading history...
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-500">
                No messages yet. Say hello!
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={msg._id || index}
                  className={`flex flex-col ${
                    msg.me || msg.senderId === currentUser.id
                      ? "items-end"
                      : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-xs rounded-lg px-3 py-2 lg:max-w-md ${
                      msg.me || msg.senderId === currentUser.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="px-2 text-xs text-gray-400">
                    {formatTime(msg.addedAt || msg.modifiedAt || Date.now())}
                  </span>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="flex shrink-0 items-center gap-2 border-t p-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-grow rounded-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              className="cursor-pointer rounded-full bg-blue-600 px-6 py-2 font-semibold text-white transition hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
