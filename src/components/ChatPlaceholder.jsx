import React from "react";
import { FaComments } from "react-icons/fa";

const ChatPlaceholder = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-gray-100 p-4 text-center text-gray-500">
      <FaComments className="mb-4 text-7xl text-gray-300" />
      <h2 className="text-2xl font-bold text-gray-700">Welcome to Chattr</h2>
      <p className="max-w-xs">
        Select a person from your contact list to start a conversation.
      </p>
    </div>
  );
};

export default ChatPlaceholder;
