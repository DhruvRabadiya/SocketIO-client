import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllUsers, createGroup } from "../services/api";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaTimes, FaSearch, FaUsers } from "react-icons/fa";
import Avatar from "./Avatar";
import Spinner from "./Spinner";

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const { user: currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getAllUsers()
        .then((response) => {
          const otherUsers = response.data.getAllusers.filter(
            (u) => u._id !== currentUser.id
          );
          setAllUsers(otherUsers);
        })
        .catch(() => toast.error("Could not fetch users."))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, currentUser.id]);

  const handleToggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return toast.error("Group name is required.");
    if (selectedUsers.length < 1)
      return toast.error("Please select at least one member."); // Changed to 1 member for flexibility
    setIsLoading(true);
    try {
      const participants = [...selectedUsers, currentUser.id];
      const groupId = `${participants.sort().join("-")}-${uuidv4()}`;
      const groupData = { groupName, groupId, participants };
      await createGroup(groupData);
      toast.success(`Group "${groupName}" created!`);
      onGroupCreated();
      handleClose();
    } catch (error) {
      toast.error("Failed to create group.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedUsers([]);
    setGroupName("");
    setSearchTerm("");
    onClose();
  };

  const filteredUsers = useMemo(
    () =>
      allUsers.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [allUsers, searchTerm]
  );

  const selectedUserDetails = useMemo(
    () =>
      selectedUsers
        .map((id) => allUsers.find((user) => user._id === id))
        .filter(Boolean),
    [selectedUsers, allUsers]
  );

  if (!isOpen) return null;

  return (
    <div
      className="backdrop-blur fixed inset-0 z-20 flex items-center justify-center  bg-opacity-60 font-sans"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-4">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="cursor-pointer p-2 text-gray-500 hover:text-gray-800"
              >
                <FaArrowLeft />
              </button>
            )}
            <h2 className="text-xl font-bold text-gray-800">
              {step === 1 ? "Create a Group" : "Group Details"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="cursor-pointer p-2 text-gray-500 hover:text-gray-800"
          >
            <FaTimes />
          </button>
        </div>

        {/* Step 1: Select Users */}
        {step === 1 && (
          <div className="p-6">
            <div className="relative mb-4">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border bg-gray-100 py-2 pl-10 pr-4 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <ul className="h-72 overflow-y-auto">
              {isLoading ? (
                <Spinner />
              ) : (
                filteredUsers.map((user) => (
                  <li
                    key={user._id}
                    onClick={() => handleToggleUser(user._id)}
                    className="flex cursor-pointer items-center gap-4 rounded-lg p-3 hover:bg-gray-100"
                  >
                    <Avatar username={user.username} />
                    <span className="flex-grow font-medium text-gray-800">
                      {user.username}
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      readOnly
                      className="h-5 w-5 cursor-pointer rounded text-blue-600 focus:ring-blue-500"
                    />
                  </li>
                ))
              )}
            </ul>
            <button
              onClick={() => setStep(2)}
              disabled={selectedUsers.length === 0}
              className="cursor-pointer mt-4 w-full rounded-lg bg-blue-600 p-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              Next ({selectedUsers.length} selected)
            </button>
          </div>
        )}

        {/* Step 2: Name Group */}
        {step === 2 && (
          <div className="p-6">
            <div className="mb-4">
              <label
                htmlFor="groupName"
                className="mb-2 block font-semibold text-gray-700"
              >
                Group Name
              </label>
              <div className="relative">
                <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="groupName"
                  type="text"
                  placeholder="Enter group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 pl-12 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mb-4">
              <p className="mb-2 font-semibold text-gray-700">
                Members ({selectedUsers.length + 1})
              </p>
              <div className="flex flex-wrap gap-2 rounded-lg bg-gray-100 p-3">
                {[
                  ...selectedUserDetails,
                  { _id: currentUser.id, username: currentUser.username },
                ].map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center gap-2 rounded-full bg-gray-300 px-3 py-1"
                  >
                    <span className="text-sm font-medium text-gray-800">
                      {member.username}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={handleCreateGroup}
              disabled={isLoading}
              className="cursor-pointer mt-4 flex w-full items-center justify-center rounded-lg bg-green-600 p-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400"
            >
              {isLoading ? <Spinner /> : "Create Group"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateGroupModal;
