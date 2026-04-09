import React, { useEffect, useRef, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { RiEmojiStickerLine } from "react-icons/ri";
import { FaImages } from "react-icons/fa6";
import { RiSendPlane2Fill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import EmojiPicker from "emoji-picker-react";
import axios from "axios";
import moment from "moment";
import dp from "../assets/dp.png";
import SenderMessage from "./SenderMessage";
import ReceiverMessage from "./ReceiverMessage";
import { setSelectedUser } from "../redux/userSlice";
import { addMessage, setMessages } from "../redux/messageSlice";
import { serverUrl } from "../main";

function MessageArea() {
  const dispatch = useDispatch();
  const { selectedUser, userData, socket } = useSelector((state) => state.user);
  const { messages } = useSelector((state) => state.message);

  const [input, setInput] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  const bottomRef = useRef();
  const imageRef = useRef();
  const typingTimeout = useRef(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() && !backendImage) return;

    const formData = new FormData();
    formData.append("message", input);
    if (backendImage) formData.append("image", backendImage);

    try {
      const res = await axios.post(
        `${serverUrl}/api/message/send/${selectedUser._id}`,
        formData,
        { withCredentials: true }
      );

      const message = res.data;
      dispatch(addMessage(message));
      socket?.emit("stopTyping", { to: selectedUser._id });
      socket?.emit("newMessage", { to: selectedUser._id, message });

      setInput("");
      setBackendImage(null);
      setFrontendImage(null);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    socket?.emit("typing", { to: selectedUser._id });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket?.emit("stopTyping", { to: selectedUser._id });
    }, 1000);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const cancelImage = () => {
    setBackendImage(null);
    setFrontendImage(null);
  };

  const onEmojiClick = (emojiData) => {
    setInput((prev) => prev + emojiData.emoji);
    setShowPicker(false);
  };

  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/message/get/${selectedUser._id}`,
          { withCredentials: true }
        );
        dispatch(setMessages(res.data));
      } catch (err) {
        console.error("Error fetching messages:", err);
        dispatch(setMessages([]));
      }
    };

    fetchMessages();
  }, [selectedUser, dispatch]);

  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleNewMessage = ({ message }) => {
      const selectedUserId = String(selectedUser._id);
      const senderId = String(message.sender);
      const receiverId = String(message.receiver);

      if (senderId === selectedUserId || receiverId === selectedUserId) {
        dispatch(addMessage(message));
      }
    };

    const handleTyping = ({ from }) => {
      if (String(from) === String(selectedUser._id)) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({ from }) => {
      if (String(from) === String(selectedUser._id)) {
        setIsTyping(false);
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [socket, selectedUser, dispatch]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, frontendImage, isTyping]);

  if (!selectedUser) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center bg-slate-200 text-center p-4">
        <h1 className="text-gray-700 font-bold text-4xl">Welcome to Chatly</h1>
        <p className="text-gray-600 text-lg mt-2">Select a user to start chatting!</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-100 relative">
      {/* Header */}
      <div className="w-full h-[70px] bg-[#1797c2] flex items-center px-4 justify-between shadow-md">
        <div className="flex items-center gap-3">
          <IoIosArrowRoundBack
            className="text-white text-3xl mr-4 cursor-pointer"
            onClick={() => dispatch(setSelectedUser(null))}
          />
          <img
            src={selectedUser.image || dp}
            alt="user"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="text-white">
            <h1 className="text-lg font-semibold">{selectedUser.name}</h1>
            <p className="text-sm">
              {isTyping
                ? "typing..."
                : selectedUser.lastSeen
                ? `Last seen ${moment(selectedUser.lastSeen).fromNow()}`
                : "Online"}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {Array.isArray(messages) &&
          messages.map((mess, index) => {
            const isSender = String(mess.sender) === String(userData._id);
            const MessageComponent = isSender ? SenderMessage : ReceiverMessage;
            return (
              <MessageComponent
                key={index}
                image={mess.image}
                message={mess.message}
                time={moment(mess.createdAt).format("h:mm A")}
                isRead={mess.isRead}
                onImageClick={setModalImage}
              />
            );
          })}
        {isTyping && (
          <p className="text-gray-500 italic text-sm ml-2 animate-pulse">
            {selectedUser.name} is typing...
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Emoji Picker */}
      {showPicker && (
        <div className="absolute bottom-[90px] left-4 z-50">
          <EmojiPicker width={280} height={350} onEmojiClick={onEmojiClick} />
        </div>
      )}

      {/* Image Preview */}
      {frontendImage && (
        <div className="absolute bottom-[90px] right-5 flex flex-col items-end gap-1 z-40">
          <img
            src={frontendImage}
            alt="preview"
            className="w-20 h-20 object-cover rounded-lg shadow-md"
          />
          <button
            onClick={cancelImage}
            className="text-sm text-red-600 hover:underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
          onClick={() => setModalImage(null)}
        >
          <img
            src={modalImage}
            alt="Full View"
            className="max-w-[90%] max-h-[90%] rounded-lg"
          />
        </div>
      )}

      {/* Message Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="w-full h-[70px] flex items-center gap-3 px-4 bg-white border-t border-gray-300"
      >
        <RiEmojiStickerLine
          className="text-2xl text-gray-500 cursor-pointer"
          onClick={() => setShowPicker(!showPicker)}
        />
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Message..."
          className="flex-1 bg-transparent outline-none text-gray-800 text-base"
        />
        <FaImages
          className="text-xl text-gray-500 cursor-pointer"
          onClick={() => imageRef.current.click()}
        />
        <input
          type="file"
          accept="image/*"
          hidden
          ref={imageRef}
          onChange={handleImage}
        />
        {(input.trim() || backendImage) && (
          <button type="submit">
            <RiSendPlane2Fill className="text-xl text-blue-500" />
          </button>
        )}
      </form>
    </div>
  );
}

export default MessageArea;
