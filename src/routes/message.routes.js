import express from "express";
import { protectRoute } from "../middlewares/auth.middlewares.js";
import { getUsersforSidebar,getMessages,sendMessage } from "../controllers/message.controller.js";
const router = express.Router();// Create a new router

router.get("/users",protectRoute,getUsersforSidebar);// Get all users for sidebar
router.get("/:id",protectRoute,getMessages);// Get all messages between two users provided the other user's id is given in the URL params 
router.post("/send/:id", protectRoute, sendMessage);// Send a message to the user provided by the user 
export default router;