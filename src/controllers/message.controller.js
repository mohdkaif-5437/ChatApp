import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { getReceiverSocketId, io } from "../utils/socket.js";

const getUsersforSidebar = asyncHandler(async (req, res) => {
    try {
        const loggedInUser = req.user._id;
        const filteredUser = await User.find({ _id: { $ne: loggedInUser } }).select("-password"); // Exclude password
        res.status(200).json({ success: true, users: filteredUser });
    } catch (error) {
        console.error("Error in getUsersforSidebar:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// ✅ Fixed `getMessages`
 const getMessages = async (req, res) => {
    try {
      const { id: userToChatId } = req.params;
      const myId = req.user._id;
  
      const messages = await Message.find({
        $or: [
          { senderId: myId, receiverId: userToChatId },
          { senderId: userToChatId, receiverId: myId },
        ],
      });
  
      res.status(200).json(messages);
    } catch (error) {
      console.log("Error in getMessages controller: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };

// ✅ Fixed `sendMessage`
const sendMessage = asyncHandler(async (req, res) => {
    try {
        const { id: receiverId } = req.params; // ✅ Fixed typo
        const { text, image, video, file } = req.body;
        const senderId = req.user._id; // ✅ Fixed missing senderId

        let imageUrl, videoUrl, fileUrl;

        if (image) {
            const uploadResponse = await uploadonCloudinary(image);
            imageUrl = uploadResponse.secure_url;
        }
        if (video) {
            const uploadResponse = await uploadonCloudinary(video);
            videoUrl = uploadResponse.secure_url;
        }
        if (file) {
            const uploadResponse = await uploadonCloudinary(file);
            fileUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId, // ✅ Fixed typo
            text,
            image: imageUrl,
            video: videoUrl,
            file: fileUrl
        });

        await newMessage.save();

        // ✅ Realtime message using socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage); // ✅ Corrected socket.io emission
        }

        res.status(201).json({ success: true, message: newMessage });
    } catch (error) {
        console.error("Error in sendMessage:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

export { getUsersforSidebar, getMessages, sendMessage };
