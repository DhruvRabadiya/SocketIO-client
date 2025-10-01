import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const s = io(import.meta.env.VITE_BACKEND_URL);
    setSocket(s);

    s.on("connect", () => s.emit("setUsername", user.username));
    s.on("onboard", (msg) =>
      setMessages((prev) => [...prev, { system: true, text: msg }])
    );
    s.on("joins", (msg) =>
      setMessages((prev) => [...prev, { system: true, text: msg }])
    );
    s.on("chat", (msg) => setMessages((prev) => [...prev, msg]));
    s.on("disconnect", (reason) =>
      setMessages((prev) => [
        ...prev,
        { system: true, text: `Disconnected: ${reason}` },
      ])
    );

    return () => s.disconnect();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !socket) return;
    const messageObj = { user: user.username, text: newMessage };
    socket.emit("chat", messageObj);
    setMessages((prev) => [...prev, { ...messageObj, me: true }]);
    setNewMessage("");
  };

  return (
    <div className="flex h-full w-full max-w-4xl flex-col rounded-lg bg-white shadow-xl">
      <div className="rounded-t-lg border-b bg-gray-50 p-4 text-center text-lg font-bold text-gray-800">
        💬 Chat Room
      </div>
      <div className="flex-grow space-y-4 overflow-y-auto p-4">
        {messages.map((msg, index) =>
          msg.system ? (
            <div
              key={index}
              className="text-center text-xs italic text-gray-500"
            >
              {msg.text}
            </div>
          ) : (
            <div
              key={index}
              className={`flex ${msg.me ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${
                  msg.me
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {!msg.me && (
                  <strong className="block text-xs font-semibold text-gray-600">
                    {msg.user}
                  </strong>
                )}
                {msg.text}
              </div>
            </div>
          )
        )}
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
  );
}

export default Chat;
