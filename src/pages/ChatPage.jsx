import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import { getUserById } from "../services/api";

const ChatPage = () => {
  const { userId: recipientId } = useParams();
  const { user: currentUser } = useAuth();
  const [recipient, setRecipient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    getUserById(recipientId)
      .then((response) => setRecipient(response.data.user[0]))
      .catch(console.error);
  }, [recipientId]);

  useEffect(() => {
    if (!currentUser?.id || !recipient?._id) return; // More robust check

    const token = localStorage.getItem("token");

    const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
      auth: {
        token: token,
      },
    });

    setSocket(newSocket);

    const roomName = [currentUser.id, recipient._id].sort().join("-");
    newSocket.emit("join_private_chat", { roomName });

    newSocket.on("private_message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => newSocket.disconnect();
  }, [currentUser, recipient]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
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

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      <header className="flex items-center gap-4 border-b bg-white p-4 shadow-sm">
        <Link to="/" className="text-blue-500 hover:text-blue-700">
          &larr; Back
        </Link>
        <h1 className="text-xl font-bold">Chat with {recipient.username}</h1>
      </header>

      <main className="flex flex-grow flex-col overflow-hidden p-4">
        <div className="flex h-full w-full max-w-4xl flex-col self-center rounded-lg bg-white shadow-xl">
          <div className="flex-grow space-y-4 overflow-y-auto p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.me || msg.sender === currentUser.username
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${
                    msg.me || msg.sender === currentUser.username
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="flex items-center gap-2 border-t p-4">
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
