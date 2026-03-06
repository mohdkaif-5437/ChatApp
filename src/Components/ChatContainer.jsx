import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "../Components/ChatHeader.jsx";
import MessageInput from "../Components/MessageInput.jsx";
import MessageSkeleton from "../Components/skeleton/MessageSkeleton.jsx";
import { useAuthStore } from "../store/useAuthStore.js";
import { formatMessageTime } from "../Lib/formatMessageTime.js";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    seeMessages,
    unSeeMessages,
  } = useChatStore(); // ✅ Single useChatStore call ensures reactivity

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // ✅ Fetch messages only if selectedUser exists
  useEffect(() => {
    if (!selectedUser?._id) return; 
    getMessages(selectedUser._id);
    seeMessages();
    return () => unSeeMessages();
  }, [selectedUser?._id, getMessages, seeMessages, unSeeMessages]);

  // ✅ Scroll to the bottom when messages update
  useEffect(() => {
    if (messages.length > 0 && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={message._id || index}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={index === messages.length - 1 ? messageEndRef : null}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser?.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text ? <p>{message.text}</p> : <p className="text-gray-500">[No text]</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
