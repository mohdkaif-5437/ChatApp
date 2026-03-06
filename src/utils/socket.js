// Import necessary modules
import { Server } from "socket.io"; // Socket.IO for real-time communication
import http from "http"; // HTTP module to create the server
import express from "express"; // Express framework for handling HTTP requests

// Initialize the Express application
const app = express();

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Initialize a new Socket.IO server instance, attach it to the HTTP server
const io = new Server(server, {
  cors: {
    origin: ["https://chat-app-coral-phi.vercel.app"], // Allow connections only from this origin
  },
});

// Function to retrieve the socket ID for a specific user ID
export function getReceiverSocketId(userId) {
  return userSocketMap[userId]; // Return the socket ID mapped to the user ID
}

// Map to store the relationship between user IDs and their corresponding socket IDs
// This is used to keep track of online users
const userSocketMap = {}; // Example: { userId: socketId }

// Listen for a new client connection
io.on("connection", (socket) => {
  console.log("A user connected", socket.id); // Log the connection with the socket ID

  // Retrieve the `userId` from the query parameters sent during the connection handshake
  const userId = socket.handshake.query.userId;

  // If a valid `userId` is provided, store it in the `userSocketMap` with its socket ID
  if (userId) userSocketMap[userId] = socket.id;

  // Emit an event to all connected clients with the list of online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Listen for the `disconnect` event when a user disconnects
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id); // Log the disconnection

    // Remove the user from the `userSocketMap`
    delete userSocketMap[userId];

    // Emit an updated list of online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Export the `io`, `app`, and `server` for use in other parts of the application
export { io, app, server };
