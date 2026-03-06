import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "../Components/skeleton/SidebarSkeleton.jsx";
import { Users } from "lucide-react";

const Sidebar = () => {
  // Retrieve state and actions from chat and auth stores
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore(); // Chat-related data
  const { onlineUsers } = useAuthStore(); // List of online users from auth store

  const [showOnlineOnly,setShowOnlineOnly] = useState(false); // State to toggle showing only online users (default: false)

  // Fetch the list of users when the component mounts
  useEffect(() => {
    getUsers(); // Trigger API call to load user list
  }, [getUsers]);

  /**
   * Filter users based on `showOnlineOnly` state:
   * - If `showOnlineOnly` is true, filter out users who are not online.
   * - Ensure both `users` and `onlineUsers` are valid arrays before filtering to avoid runtime errors.
   */
  const filteredUsers = showOnlineOnly
    ? Array.isArray(users) && Array.isArray(onlineUsers)
      ? users.filter((user) => onlineUsers.includes(user._id)) // Keep only users who are online
      : []
    : Array.isArray(users)
    ? users // Return all users if `showOnlineOnly` is false
    : [];

  // Show a skeleton loader while users are loading
  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      {/* Sidebar header */}
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* TODO: Add functionality for online filter toggle */}
        
      </div>
      <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
    

      {/* User list section */}
      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)} // Set selected user on click
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""} 
            `}
          >
            {/* User profile picture */}
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"} // Default to avatar if no profile picture is set
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {/* Show online status indicator if the user is online */}
              {Array.isArray(onlineUsers) && onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User information - visible only on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div> {/* Display user name */}
              <div className="text-sm text-zinc-400">
                {Array.isArray(onlineUsers) && onlineUsers.includes(user._id) ? "Online" : "Offline"} {/* Online/offline status */}
              </div>
            </div>
          </button>
        ))}

        {/* Message for no users found */}
        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
