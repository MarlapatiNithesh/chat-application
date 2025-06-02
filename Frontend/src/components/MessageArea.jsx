import React, { useRef, useState, useEffect } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { RiEmojiStickerLine } from "react-icons/ri";
import { FaImages } from "react-icons/fa6";
import { RiSendPlane2Fill } from "react-icons/ri";
import EmojiPicker from "emoji-picker-react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../redux/userSlice";
import { setmessages } from "../redux/messageSlice";
import SenderMessage from "./SenderMessage";
import ReceiverMessage from "./ReceiverMessage";
import dp from "../assets/dp.png";
import axios from "axios";
import { serverUrl } from "../main";

function MessageArea() {
  const { selectedUser, userData, socket } = useSelector((state) => state.user);
  const { messages } = useSelector((state) => state.message);
  const dispatch = useDispatch();

  const [input, setInput] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);

  const messageEndRef = useRef(null);
  const imageRef = useRef();
  const typingTimeoutRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Fetch messages when selected user changes
  useEffect(() => {
    if (!selectedUser) {
      dispatch(setmessages([]));
      return;
    }
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/message/get/${selectedUser._id}`, {
          withCredentials: true,
        });
        dispatch(setmessages(res.data.messages || []));
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };
    fetchMessages();
  }, [selectedUser, dispatch]);

  // Handle typing indicator
  useEffect(() => {
    if (!socket || !selectedUser) return;

    socket.on("typing", (fromUserId) => {
      if (fromUserId === selectedUser._id) {
        setIsUserTyping(true);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsUserTyping(false), 1500);
      }
    });

    return () => {
      socket.off("typing");
    };
  }, [socket, selectedUser]);

  // Handle incoming message
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (newMessage) => {
      if (
        selectedUser &&
        (newMessage.sender === selectedUser._id || newMessage.receiver === selectedUser._id)
      ) {
        dispatch(setmessages((prev) => [...prev, newMessage]));
      }
    };
    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser, dispatch]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input && !backendImage) return;
    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append("message", input);
      if (backendImage) formData.append("image", backendImage);

      const res = await axios.post(
        `${serverUrl}/api/message/send/${selectedUser._id}`,
        formData,
        { withCredentials: true }
      );
      const newMsg = res.data.newMessage;
      dispatch(setmessages([...messages, newMsg]));
      setInput("");
      setBackendImage(null);
      setFrontendImage(null);
    } catch (err) {
      console.error("Message send failed:", err);
    }
    setIsSending(false);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!typing && socket && selectedUser) {
      setTyping(true);
      socket.emit("typing", selectedUser._id);
      setTimeout(() => setTyping(false), 1500);
    }
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
    }
  };

  const onEmojiClick = (emoji) => {
    setInput((prev) => prev + emoji.emoji);
    setShowPicker(false);
  };

  return (
    <div className={`relative w-full h-full flex ${selectedUser ? "flex" : "hidden"} lg:flex flex-col`}>
      {selectedUser ? (
        <>
          {/* Header */}
          <div className="flex items-center px-4 py-2 bg-[#1797c2] rounded-b-2xl shadow-md">
            <IoIosArrowRoundBack
              className="text-white text-3xl cursor-pointer mr-3"
              onClick={() => dispatch(setSelectedUser(null))}
            />
            <div className="w-12 h-12 rounded-full overflow-hidden bg-white flex items-center justify-center">
              <img
                src={selectedUser.image || dp}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="ml-4">
              <p className="text-white text-lg font-semibold">
                {selectedUser.name}
              </p>
              {isUserTyping && (
                <p className="text-white text-sm font-light">typing...</p>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100">
            {messages.map((msg, index) =>
              msg.sender === userData?._id ? (
                <SenderMessage
                  key={msg._id || index}
                  image={msg.image}
                  message={msg.message}
                />
              ) : (
                <ReceiverMessage
                  key={msg._id || index}
                  image={msg.image}
                  message={msg.message}
                />
              )
            )}
            <div ref={messageEndRef} />
          </div>

          {/* Input */}
          <div className="w-full px-4 py-2 relative">
            {frontendImage && (
              <img
                src={frontendImage}
                alt="Preview"
                className="w-20 h-20 rounded-lg absolute bottom-20 right-4 shadow"
              />
            )}
            {showPicker && (
              <div className="absolute bottom-24 left-4 z-50 shadow-lg">
                <EmojiPicker height={350} width={300} onEmojiClick={onEmojiClick} />
              </div>
            )}
            <form
              className="flex items-center bg-[#1797c2] rounded-full px-4 py-2 space-x-4"
              onSubmit={handleSendMessage}
            >
              <RiEmojiStickerLine
                className="text-white text-2xl cursor-pointer"
                onClick={() => setShowPicker((prev) => !prev)}
              />
              <input
                type="file"
                accept="image/*"
                hidden
                ref={imageRef}
                onChange={handleImage}
              />
              <input
                type="text"
                className="flex-1 text-white text-base placeholder-white bg-transparent outline-none"
                placeholder="Type a message..."
                value={input}
                onChange={handleInputChange}
              />
              <FaImages
                className="text-white text-xl cursor-pointer"
                onClick={() => imageRef.current.click()}
              />
              {(input || backendImage) && (
                <button type="submit" disabled={isSending}>
                  <RiSendPlane2Fill className="text-white text-2xl" />
                </button>
              )}
            </form>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl font-bold text-gray-700">Welcome to Chatly</h1>
          <p className="text-xl font-semibold text-gray-500 mt-2">Chat Friendly!</p>
        </div>
      )}
    </div>
  );
}

export default MessageArea;
