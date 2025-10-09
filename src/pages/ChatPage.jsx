import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getUserById,
  getChatHistory,
  deleteMessage,
  editMessage,
  createMessage,
  getGroupById,
  renameGroup,
  leaveGroup,
  addUserToGroup,
} from "../services/api";
import { toast } from "react-hot-toast";
import {
  FaTrash,
  FaPaperPlane,
  FaEdit,
  FaUserPlus,
  FaUserMinus,
  FaPen,
  FaArrowLeft,
} from "react-icons/fa";
import Spinner from "../components/Spinner";
import Avatar from "../components/Avatar";
import AddMemberModal from "../components/AddMemberModal";
import TypingIndicator from "../components/TypingIndicator";
import TextareaAutosize from "react-textarea-autosize";
import ChatHeader from "../components/ChatHeader";

const ChatPage = () => {
  const { userId: recipientId, groupId } = useParams();
  const { user: currentUser, socket, onlineUsers, updateGroups } = useAuth();
  const [chatPartner, setChatPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const messageContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isPaginating = useRef(false);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  const isGroupChat = !!groupId;
  const roomName = chatPartner
    ? isGroupChat
      ? chatPartner._id
      : [currentUser.id, chatPartner._id].sort().join("-")
    : null;

  const fetchChatPartnerDetails = useCallback(() => {
    if (isGroupChat) {
      getGroupById(groupId)
        .then((response) => {
          if (response.data?.group)
            setChatPartner({
              ...response.data.group,
              name: response.data.group.groupName,
            });
        })
        .catch(console.error);
    } else {
      getUserById(recipientId)
        .then((response) => {
          if (response.data?.user?.[0])
            setChatPartner({
              ...response.data.user[0],
              name: response.data.user[0].username,
            });
        })
        .catch(console.error);
    }
  }, [groupId, recipientId, isGroupChat]);

  useEffect(() => {
    setMessages([]);
    setLoadingHistory(true);
    setNewMessage("");
    setEditingMessage(null);
    setEditText("");
    setSelectedMessage(null);
    setTypingUsers([]);
    setPage(1);
    setHasMoreMessages(true);
    fetchChatPartnerDetails();
  }, [recipientId, groupId, fetchChatPartnerDetails]);

  useEffect(() => {
    if (!currentUser?.id || !chatPartner?._id) return;
    const fetchInitialHistory = async () => {
      setLoadingHistory(true);
      isPaginating.current = true;
      try {
        const idToFetch = isGroupChat
          ? chatPartner._id
          : [currentUser.id, chatPartner._id].sort().join("-");
        const response = await getChatHistory(idToFetch, isGroupChat, 1);
        setMessages(response.data.data.reverse());
        setHasMoreMessages(
          response.data.pagination.currentPage <
            response.data.pagination.totalPages
        );
        setPage(1);
      } catch (error) {
        console.error("Failed to fetch chat history", error);
      } finally {
        setLoadingHistory(false);
        setTimeout(() => {
          isPaginating.current = false;
          if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop =
              messageContainerRef.current.scrollHeight;
          }
        }, 0);
      }
    };
    fetchInitialHistory();
  }, [currentUser, chatPartner, isGroupChat]);

  useEffect(() => {
    if (!socket || !roomName) return;
    socket.emit("join_private_chat", { roomName, isGroupChat });
    const privateMessageHandler = (message) => {
      setTypingUsers((prev) =>
        prev.filter((u) => u !== message.senderUsername)
      );
      setMessages((prev) => [...prev, message]);
    };
    const deletedHandler = ({ messageId }) =>
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, text: null, isDeleted: true } : msg
        )
      );
    const editedHandler = ({ messageId, newText }) =>
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, text: newText, isEdited: true }
            : msg
        )
      );
    const typingHandler = ({ username }) =>
      setTypingUsers((prev) => [...new Set([...prev, username])]);
    const stopTypingHandler = ({ username }) =>
      setTypingUsers((prev) => prev.filter((u) => u !== username));
    const groupRenamedHandler = ({ updatedGroup, newMessage }) => {
      if (isGroupChat && chatPartner?._id === updatedGroup._id) {
        setChatPartner((prev) => ({
          ...prev,
          name: updatedGroup.groupName,
          groupName: updatedGroup.groupName,
        }));
        setMessages((prev) => [...prev, { ...newMessage, isSystem: true }]);
      }
    };
    const memberLeftHandler = ({ groupId, updatedGroup, newMessage }) => {
      if (isGroupChat && chatPartner?._id === groupId) {
        setChatPartner((prev) => ({
          ...prev,
          participants: updatedGroup.participants,
        }));
        setMessages((prev) => [...prev, { ...newMessage, isSystem: true }]);
      }
    };
    const memberAddedHandler = ({ updatedGroup, newMessage }) => {
      if (isGroupChat && chatPartner?._id === updatedGroup._id) {
        setChatPartner((prev) => ({
          ...prev,
          participants: updatedGroup.participants,
        }));
        setMessages((prev) => [...prev, { ...newMessage, isSystem: true }]);
      }
    };
    socket.on("private_message", privateMessageHandler);
    socket.on("message_deleted", deletedHandler);
    socket.on("message_edited", editedHandler);
    socket.on("user_is_typing", typingHandler);
    socket.on("user_stopped_typing", stopTypingHandler);
    socket.on("group_renamed", groupRenamedHandler);
    socket.on("member_left", memberLeftHandler);
    socket.on("members_added", memberAddedHandler);
    return () => {
      socket.emit("leave_room", { roomName });
      socket.off("private_message", privateMessageHandler);
      socket.off("message_deleted", deletedHandler);
      socket.off("message_edited", editedHandler);
      socket.off("user_is_typing", typingHandler);
      socket.off("user_stopped_typing", stopTypingHandler);
      socket.off("group_renamed", groupRenamedHandler);
      socket.off("member_left", memberLeftHandler);
      socket.off("members_added", memberAddedHandler);
    };
  }, [socket, roomName, isGroupChat, chatPartner]);

  useEffect(() => {
    if (isPaginating.current) return;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const handleNewMessageChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket || !roomName) return;
    if (typingTimeoutRef.current === null) {
      socket.emit("start_typing", { roomName });
    } else {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { roomName });
      typingTimeoutRef.current = null;
    }, 1500);
  };

  const loadMoreMessages = async () => {
    if (isFetchingMore || !hasMoreMessages) return;
    isPaginating.current = true;
    const container = messageContainerRef.current;
    const oldScrollHeight = container.scrollHeight;
    setIsFetchingMore(true);
    const nextPage = page + 1;
    try {
      const idToFetch = isGroupChat
        ? chatPartner._id
        : [currentUser.id, chatPartner._id].sort().join("-");
      const response = await getChatHistory(idToFetch, isGroupChat, nextPage);
      const newMessages = response.data.data.reverse();
      setMessages((prev) => [...newMessages, ...prev]);
      setPage(nextPage);
      setHasMoreMessages(
        response.data.pagination.currentPage <
          response.data.pagination.totalPages
      );
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight - oldScrollHeight;
      });
    } catch (error) {
      toast.error("Failed to load older messages.");
    } finally {
      setIsFetchingMore(false);
      setTimeout(() => {
        isPaginating.current = false;
      }, 100);
    }
  };

  const handleScroll = () => {
    if (messageContainerRef.current?.scrollTop === 0) loadMoreMessages();
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !socket || !roomName) return;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    socket.emit("stop_typing", { roomName });
    const tempId = `${Date.now()}-${Math.random()}`;
    const messageObj = {
      senderId: currentUser.id,
      senderUsername: currentUser.username,
      text: newMessage,
      roomName,
      tempId,
      isGroupChat,
    };
    setMessages((prev) => [...prev, { ...messageObj, me: true, _id: tempId }]);
    setNewMessage("");
    try {
      const response = await createMessage(messageObj);
      const savedMessage = response.data.savedMessage;
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempId ? { ...savedMessage, me: true } : msg
        )
      );
      socket.emit("send_private_message", { ...savedMessage, roomName });
    } catch (error) {
      toast.error("Failed to send message.");
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
    }
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
    if (!selectedMessage || !socket || !roomName) return;
    const messageId = selectedMessage._id;
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId ? { ...msg, text: null, isDeleted: true } : msg
      )
    );
    handleCloseConfirmModal();
    try {
      await deleteMessage(messageId);
      socket.emit("delete_message", { messageId, roomName });
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
    if (!editingMessage || !editText.trim() || !socket || !roomName) return;
    const originalMessage = editingMessage;
    const messageId = editingMessage._id;
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
        prev.map((msg) => (msg._id === messageId ? originalMessage : msg))
      );
    }
  };

  const handleSaveRename = async (newGroupName) => {
    if (!isGroupChat || !chatPartner) return;
    const tempId = `rename_${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      isSystem: true,
      text: `${currentUser.username} renamed the group to "${newGroupName}"`,
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    try {
      const response = await renameGroup(chatPartner._id, newGroupName, tempId);
      const { groupExists: updatedGroup, newMessage: finalSystemMessage } =
        response.data;
      setChatPartner((prev) => ({
        ...prev,
        name: updatedGroup.groupName,
        groupName: updatedGroup.groupName,
      }));
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempId ? { ...finalSystemMessage, isSystem: true } : msg
        )
      );
      updateGroups((prev) =>
        prev.map((g) =>
          g._id === updatedGroup._id
            ? { ...g, groupName: updatedGroup.groupName }
            : g
        )
      );
      socket.emit("rename_group", {
        groupId: chatPartner._id,
        updatedGroup,
        newMessage: finalSystemMessage,
      });
    } catch (error) {
      toast.error("Failed to rename group.");
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
    }
  };

  const handleLeaveGroup = async () => {
    if (!isGroupChat || !chatPartner || !socket) return;
    const tempId = `leave_${Date.now()}`;
    try {
      const response = await leaveGroup(chatPartner._id, tempId);
      const { groupDetail: updatedGroup, newMessage } = response.data;
      socket.emit("leave_group", {
        groupId: chatPartner._id,
        updatedGroup,
        newMessage,
      });
      updateGroups((prev) => prev.filter((g) => g._id !== chatPartner._id));
      toast.success(`You have left the group "${chatPartner.name}"`);
      navigate("/");
    } catch (error) {
      toast.error("Failed to leave group.");
    } finally {
      setIsLeaveModalOpen(false);
    }
  };

  const handleMembersAdded = async (userIds, usernames) => {
    const tempId = `add_${Date.now()}`;
    const names = usernames.join(", ");
    const optimisticMessage = {
      _id: tempId,
      isSystem: true,
      text: `${currentUser.username} added ${names} to the group.`,
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    try {
      const response = await addUserToGroup(chatPartner._id, userIds, tempId);
      const { updatedGroup, newMessage } = response.data;
      setChatPartner((prev) => ({
        ...prev,
        participants: updatedGroup.participants,
      }));
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempId ? { ...newMessage, isSystem: true } : msg
        )
      );
      updateGroups((prev) =>
        prev.map((g) => (g._id === updatedGroup._id ? updatedGroup : g))
      );
      socket.emit("add_members", {
        groupId: chatPartner._id,
        updatedGroup,
        newMessage,
        addedUserIds: userIds,
      });
    } catch (error) {
      toast.error("Failed to add members.");
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
    }
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  const otherTypingUsers = typingUsers.filter(
    (u) => u !== currentUser.username
  );
  const typingDisplay = () => {
    if (otherTypingUsers.length === 1)
      return `${otherTypingUsers[0]} is typing`;
    if (otherTypingUsers.length > 2)
      return `${otherTypingUsers.length} people are typing`;
    if (otherTypingUsers.length > 1)
      return `${otherTypingUsers.join(" and ")} are typing`;
    return null;
  };

  if (!chatPartner && loadingHistory) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        group={chatPartner}
        onMembersAdded={handleMembersAdded}
      />
      {isLeaveModalOpen && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setIsLeaveModalOpen(false)}
        >  
          <div
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >    
            <h2 className="text-lg font-bold">Leave Group</h2>
            <p className="mt-2 text-gray-600">
              Are you sure you want to leave "{chatPartner?.name}"?
            </p>
            <div className="mt-6 flex justify-end gap-3">      
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="cursor-pointer rounded-md bg-gray-200 px-4 py-2 font-semibold text-gray-800 transition hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveGroup}
                className="cursor-pointer rounded-md bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
              >
                Yes, Leave
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex h-full flex-col font-sans">
        <ChatHeader
          chatPartner={chatPartner}
          isGroupChat={isGroupChat}
          onlineUsers={onlineUsers}
          onAddMemberClick={() => setIsAddMemberModalOpen(true)}
          onSaveRename={handleSaveRename}
          onLeaveGroup={() => setIsLeaveModalOpen(true)}
        />
        <div
          ref={messageContainerRef}
          onScroll={handleScroll}
          className="flex-grow overflow-y-auto bg-gray-100 p-6"
        >
          <div className="flex flex-col gap-4">
            {isFetchingMore && (
              <div className="py-4">
                <Spinner />
              </div>
            )}
            {!hasMoreMessages && !loadingHistory && (
              <p className="text-center text-sm text-gray-500">
                This is the beginning of your conversation.
              </p>
            )}
            {loadingHistory ? (
              <div className="flex h-full items-center justify-center">
                <Spinner />
              </div>
            ) : (
              messages.map((msg) => {
                const idString = String(msg.tempId || msg._id);
                if (
                  msg.isSystem ||
                  idString.startsWith("rename_") ||
                  idString.startsWith("add_") ||
                  idString.startsWith("leave_")
                ) {
                  let icon = <FaPen className="mr-2 shrink-0" />;
                  let color = "text-gray-500";
                  if (idString.startsWith("add_")) {
                    icon = <FaUserPlus className="mr-2 shrink-0" />;
                    color = "text-green-600";
                  }
                  if (idString.startsWith("leave_")) {
                    icon = <FaUserMinus className="mr-2 shrink-0" />;
                    color = "text-red-600";
                  }
                  return (
                    <div
                      key={msg._id}
                      className={`flex items-center justify-center gap-1 py-2 text-center text-xs italic ${color}`}
                    >
                      {icon}
                      <span>{msg.text}</span>
                    </div>
                  );
                }
                const isMyMessage = msg.me || msg.senderId === currentUser.id;
                const isEditing = editingMessage?._id === msg._id;
                return (
                  <div
                    key={msg._id}
                    className={`group flex items-start gap-2.5 ${
                      isMyMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isMyMessage && isGroupChat && (
                      <Avatar username={msg.senderUsername} />
                    )}
                    <div
                      className={`flex flex-col ${
                        isMyMessage ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-lg rounded-2xl px-4 py-3 shadow-md ${
                          isMyMessage
                            ? "rounded-br-none bg-blue-600 text-white"
                            : "rounded-bl-none bg-gray-700 text-white"
                        }`}
                      >
                        {!isMyMessage && isGroupChat && (
                          <strong className="block text-xs font-bold text-blue-300">
                            {msg.senderUsername}
                          </strong>
                        )}
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
                        {formatTime(
                          msg.addedAt || msg.modifiedAt || Date.now()
                        )}
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
            {otherTypingUsers.length > 0 && (
              <div className="group flex items-start gap-2.5 justify-start">          
                {isGroupChat && otherTypingUsers[0] && (
                  <Avatar username={otherTypingUsers[0]} />
                )}
                <div className="flex flex-col items-start">            
                  <div
                    className={`max-w-lg rounded-2xl px-4 py-3 rounded-bl-none bg-gray-700 text-white shadow-md`}
                  >            
                    {isGroupChat ? (
                      <div className="flex flex-col items-start">                 
                        <TypingIndicator />
                        <p className="pt-1 text-xs font-bold text-blue-300">
                          {typingDisplay()}
                        </p>
                      </div>
                    ) : (
                      <TypingIndicator />
                    )}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
        <footer className="shrink-0 border-t bg-white p-4 shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.05)]">   
          <div className="relative flex items-end gap-2">       
            <TextareaAutosize
              value={newMessage}
              onChange={handleNewMessageChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
              className="w-full resize-none rounded-xl border bg-gray-100 px-4 py-2.5 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows={1}
              maxRows={5}
            />
            <button
              onClick={handleSend}
              className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:bg-blue-400"
              disabled={!newMessage.trim()}
            >
              <FaPaperPlane size={18} />
            </button>
          </div>
        </footer>
        {isConfirmModalOpen && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm"
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
    </>
  );
};
export default ChatPage;
