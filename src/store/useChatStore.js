import { create } from "zustand";
import toast from "react-hot-toast";
import instance from "../Lib/axios";
import { useAuthStore } from "./useAuthStore";

// Zustand store for managing chat-related state and operations
export const useChatStore = create((set,get) => ({
  // State variables
  messages: [], // Array to store the messages for the selected user
  users: [], // Array to store all available users
  selectedUser: null, // Object representing the currently selected user
  isUsersLoading: false, // Boolean to indicate whether users are being loaded
  isMessagesLoading: false, // Boolean to indicate whether messages are being loaded

  /**
   * Fetches the list of users from the server.
   * Sets `isUsersLoading` to true while the request is in progress.
   * On success, updates the `users` state with the response data.
   * On failure, logs the error and displays a toast notification.
   */
  getUsers: async () => {
    set({ isUsersLoading: true }); // Set loading state to true
    try {
      const res = await instance.get("/message/users"); // Fetch users from API
      set({ users: res.data.users, isUsersLoading: false }); // Update state with users and set loading to false
    } catch (error) {
      console.log("Error in getUsers", error); // Log error for debugging
      toast.error("Failed to load users"); // Display error notification
      set({ isUsersLoading: false }); // Reset loading state
    }
  },

  /**
   * Fetches messages for a specific user by their user ID.
   * Sets `isMessagesLoading` to true while the request is in progress.
   * On success, updates the `messages` state and sets the selected user.
   * On failure, logs the error and displays a toast notification.
   * 
   * @param {string} userId - The ID of the user whose messages should be fetched.
   */
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
        const res = await instance.get(`/message/${userId}`);
       
        // ✅ Fix: Directly assign res.data if it's an array
        if (Array.isArray(res.data)) {
            set({ messages: [...res.data] }); // Ensure a new array reference
        } else {
            console.warn("⚠️ Unexpected response structure!", res.data);
            set({ messages: [] });
        }

            } catch (error) {
        console.error("Error in getMessages", error);
        set({ messages: [] });
    } finally {
        set({ isMessagesLoading: false });
    }
},



  /**
   * Sets the selected user in the chat interface.
   * This function is used when a user is selected from the contact list.
   * 
   * @param {object} selectedUser - The user object to set as the selected user.
   */
  setSelectedUser:  (selectedUser) => set({ selectedUser }), // Update the selected user state
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await instance.post(`/message/send/${selectedUser._id}`, messageData);
      
      // Check the response and only add the message, not the whole response object
      const newMessage = res.data.message || res.data; // If res.data.message is available, use it
      
      set({ messages: [...messages, newMessage] });
    } catch (error) {
      toast.error(error.response?.data?.message || error);
    }
  },
  
    
  //optimize later
  seeMessages:()=>{
    const {selectedUser}=get();
    if(!selectedUser) return;
    const socket=useAuthStore.getState().socket;
    socket.on("newMessage",(newMessage)=>{
      if(newMessage.senderId !== selectedUser._id) return;
      set({
        messages:[...get().messages,newMessage],}) //add new messages with existing messages

    })
  },
  unSeeMessages:()=>{
    const socket=useAuthStore.getState().socket;
    socket.off("newMessage");
  },
}));
