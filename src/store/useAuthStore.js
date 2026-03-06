// Import necessary modules
import { create } from "zustand"; // Zustand for state management
import instance from "../Lib/axios"; // Axios instance for HTTP requests
import toast from "react-hot-toast"; // Toast notifications for user feedback
import { io } from "socket.io-client"; // Socket.IO client for real-time communication

// Define the base URL depending on the environment (development or production)
const BASE_URL = "https://chatapp-raff.onrender.com";

// Safe JSON parsing utility to handle invalid or missing data gracefully
const safeParse = (data, fallback = null) => {
  try {
    return JSON.parse(data) || fallback; // Return parsed data or fallback value
  } catch {
    return fallback; // Return fallback value if parsing fails
  }
};


// Zustand store for authentication-related state and actions
export const useAuthStore = create((set, get) => ({
  // State variables
  authUser: safeParse(localStorage.getItem("authUser")), // User information from localStorage
  isCheckingAuth: true, // State to track authentication checking process
  isSigningUp: false, // State to track signup process
  isLoggingIn: false, // State to track login process
  isUpdatingProfile: false, // State to track profile update process
  onlineUsers: [], // List of online users
  socket: null, // Socket.IO instance for real-time communication

  // Action to check if the user is authenticated
  // Action to check if the user is authenticated
   checkAuth : async () => {
    const storedUser = safeParse(localStorage.getItem("authUser"));

  if (storedUser) {
    set({ authUser: storedUser, isCheckingAuth: false });
    get().connectSocket();
    return;
  }
    try {
      // Ensure cookies are sent
      const res = await instance.get("/auth/check", { withCredentials: true });
  
      if (res.status !== 200) throw new Error("Access token invalid");
  
      set({ authUser: res.data.user });
      localStorage.setItem("authUser", JSON.stringify(res.data.user)); // Store user in localStorage
      get().connectSocket();
    } catch (error) {
      console.error("Error checking auth:", error.message);
      
      try {
        // Attempt session refresh
        const res = await instance.post("/auth/refresh", {}, { withCredentials: true });
        const { user } = res.data;
  
        set({ authUser: user });
        localStorage.setItem("authUser", JSON.stringify(user)); // Store refreshed user data
        get().connectSocket();
      } catch (refreshError) {
        toast.error(refreshError.message);
        console.error("Error refreshing token:", refreshError.message);
        set({ authUser: null });
        localStorage.removeItem("authUser");
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },  

  

  // Action to handle user signup
  signup: async (data) => {
    set({ isSigningUp: true }); // Set the signup process state to true
    try {
      const res = await instance.post("auth/signup", data); // Make a signup request
      set({ authUser: res.data }); // Set the authenticated user in the state
      get().connectSocket(); // Connect the socket after signup
    } catch (error) {
      console.error(error.message);
      toast.error(error.response?.data?.message || "Signup failed"); // Show error notification
    } finally {
      set({ isSigningUp: false }); // Reset the signup process state
    }
  },

  // Action to handle user login
  login: async (credentials) => {
    set({ isLoggingIn: true }); // Set the login process state to true
    try {
      const res = await instance.post("/auth/login", credentials); // Make a login request
      const { user, accessToken, refreshToken } = res.data.data;

      // Save tokens and user data in localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("authUser", JSON.stringify(user));

      set({ authUser: user }); // Set the authenticated user in the state
      get().connectSocket(); // Connect the socket after login
      toast.success("Logged in successfully"); // Show success notification
      return true;
    } catch (error) {
      console.error("Error in login:", error.response);
      toast.error("Failed to login"); // Show error notification
    } finally {
      set({ isLoggingIn: false }); // Reset the login process state
    }
  },

  // Action to handle user logout
  logout: async () => {
    try {
      await instance.post("/auth/logout"); // Make a logout request
    } catch (error) {
      console.error("Error in logout:", error.message);
      toast.error("Some error occurred while logging out"); // Show error notification
    } finally {
      // Disconnect the socket and clear user data
      get().disconnectSocket();
      localStorage.clear(); // Clear all data from localStorage
      set({ authUser: null }); // Reset the authenticated user in the state
      toast.success("Logged out successfully"); // Show success notification
    }
  },

  // Action to handle user profile updates
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true }); // Set the profile update state to true
    try {
      const res = await instance.put("/auth/updateProfile", data); // Make a profile update request
      const user = res.data.data; // Extract updated user data from the response

      // Update user data in localStorage and state
      localStorage.setItem("authUser", JSON.stringify(user));
      set({ authUser: user });

      toast.success("Profile updated successfully"); // Show success notification
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile"); // Show error notification
    } finally {
      set({ isUpdatingProfile: false }); // Reset the profile update state
    }
  },

  // Action to connect the Socket.IO client
  connectSocket: () => {
    const { authUser } = get(); // Get the authenticated user from the state
    if (!authUser || get().socket?.connected) return; // If no user or socket already connected, do nothing

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id, // Pass the user ID in the connection query
      },
    });
    socket.connect(); // Connect the socket

    set({ socket: socket }); // Set the socket instance in the state

    // Listen for "getOnlineUsers" event to update the list of online users
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds }); // Update the online users list in the state
    });
  },

  // Action to disconnect the Socket.IO client
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect(); // Disconnect the socket if connected
  },
}));
