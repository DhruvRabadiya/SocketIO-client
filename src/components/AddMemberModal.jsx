import React, { useState, useEffect, useMemo } from "react";
import { getAllUsers, addUserToGroup } from "../services/api";
import { toast } from "react-hot-toast";
import { FaTimes, FaSearch } from "react-icons/fa";
import Avatar from "./Avatar";
import Spinner from "./Spinner";

const AddMemberModal = ({ isOpen, onClose, group, onMembersAdded }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [usersToAdd, setUsersToAdd] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen && group) {
      setIsLoading(true);
      getAllUsers()
        .then((response) => {
          const allSystemUsers = response.data.getAllusers;
          const availableUsers = allSystemUsers.filter(
            (user) => !group.participants.includes(user._id)
          );
          setUsersToAdd(availableUsers);
        })
        .catch(() => toast.error("Could not fetch users."))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, group]);

  const handleAddMember = async () => {
    if (!selectedUserId) {
      return toast.error("Please select a user to add.");
    }
    setIsSubmitting(true);
    try {
      await addUserToGroup(group._id, selectedUserId);
      toast.success("Member added successfully!");
      onMembersAdded();
      handleClose();
    } catch (error) {
      toast.error("Failed to add member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedUserId(null);
    setSearchTerm("");
    onClose();
  };

  const filteredUsers = useMemo(
    () =>
      usersToAdd.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [usersToAdd, searchTerm]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-60"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold text-gray-800">
            Add Member to {group.name}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-800"
          >
            <FaTimes />
          </button>
        </div>
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
          <ul className="h-64 overflow-y-auto">
            {isLoading ? (
              <Spinner />
            ) : (
              filteredUsers.map((user) => (
                <li
                  key={user._id}
                  onClick={() => setSelectedUserId(user._id)}
                  className={`flex cursor-pointer items-center gap-4 rounded-lg p-3 ${
                    selectedUserId === user._id
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <Avatar username={user.username} />
                  <span className="flex-grow font-medium text-gray-800">
                    {user.username}
                  </span>
                </li>
              ))
            )}
          </ul>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="cursor-pointer rounded-md bg-gray-200 px-4 py-2 font-semibold text-gray-800 transition hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMember}
              disabled={isSubmitting || !selectedUserId}
              className="flex w-32 items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isSubmitting ? <Spinner /> : "Add Member"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
