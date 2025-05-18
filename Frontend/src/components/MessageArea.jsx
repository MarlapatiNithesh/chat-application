import React, { useRef, useState, useEffect } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import dp from "../assets/dp.png";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedUser } from "../redux/userSlice";
import { RiEmojiStickerLine } from "react-icons/ri";
import { FaImages } from "react-icons/fa6";
import { RiSendPlane2Fill } from "react-icons/ri";
import EmojiPicker from "emoji-picker-react";
import SenderMessage from "./SenderMessage";

import axios from "axios";
import { serverUrl } from "../main";
import { setmessages } from "../redux/messageSlice";
import ReceiverMessage from "./ReceiverMessage";

function MessageArea() {
  const { selectedUser, userData, socket } = useSelector((state) => state.user);
  const { messages } = useSelector((state) => state.message);
  const dispatch = useDispatch();

  const [showPicker, setShowPicker] = useState(false);
  const [input, setInput] = useState("");
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const image = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    socket?.on("newMessage", (newMessage) => {
      if (newMessage.sender === selectedUser._id) {
        const updatedMessages = Array.isArray(messages)
          ? [...messages, newMessage]
          : [newMessage];
        dispatch(setmessages(updatedMessages));
      }
    });
    return () => {
      socket?.off("newMessage");
    };
  }, [messages, setmessages]);

  useEffect(() => {
    return () => {
      if (frontendImage) {
        URL.revokeObjectURL(frontendImage);
      }
    };
  }, [frontendImage]);

  // Fetch messages every time selectedUser changes
  useEffect(() => {
    if (!selectedUser) {
      dispatch(setmessages([]));
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/message/get/${selectedUser._id}`,
          { withCredentials: true }
        );
        if (res.data && res.data.messages) {
          dispatch(setmessages(res.data.messages));
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    fetchMessages();
  }, [selectedUser, dispatch]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.length === 0 && backendImage == null) {
      return;
    }

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append("message", input);
      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/message/send/${selectedUser._id}`,
        formData,
        { withCredentials: true }
      );

      const newMsg = result.data.newMessage;

      // Add the new message to current messages
      const updatedMessages = Array.isArray(messages)
        ? [...messages, newMsg]
        : [newMsg];

      dispatch(setmessages(updatedMessages));

      setInput("");
      setFrontendImage(null);
      setBackendImage(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
    setIsSending(false);
  };

  const onEmojiClick = (emojiData) => {
    setInput((prevInput) => prevInput + emojiData.emoji);
    setShowPicker(false);
  };

  return (
    <div
      className={`lg:w-[70%] relative ${
        selectedUser ? "flex" : "hidden"
      } lg:flex w-full h-full bg-slate-200 border-l-2 border-gray-300 overflow-hidden`}
    >
      {selectedUser && (
        <div className="w-full h-[100vh] flex flex-col overflow-hidden gap-[20px] items-center">
          <div className="w-full h-[100px] bg-[#1797c2] rounded-b-[30px] shadow-gray-400 shadow-lg gap-[20px] flex items-center px-[20px] ">
            <div
              className="cursor-pointer"
              onClick={() => dispatch(setSelectedUser(null))}
            >
              <IoIosArrowRoundBack className="w-[40px] h-[40px] text-white" />
            </div>
            <div className="w-[50px] h-[50px] rounded-full overflow-hidden flex justify-center items-center bg-white cursor-pointer shadow-gray-500 shadow-lg">
              <img
                src={selectedUser?.image || dp}
                alt="User Avatar"
                className="h-[100%]"
              />
            </div>
            <h1 className="text-white font-semibold text-[20px]">
              {selectedUser?.name || "user"}
            </h1>
          </div>

          <div className="w-full h-[70%] flex flex-col py-[30px] px-[20px] overflow-auto gap-[20px] relative">
            {showPicker && (
              <div className="absolute bottom-[120px] left-[20px] z-[100] shadow-lg">
                <EmojiPicker
                  width={250}
                  height={350}
                  onEmojiClick={onEmojiClick}
                />
              </div>
            )}

            {Array.isArray(messages) &&
              messages.map((mess, idx) =>
                mess.sender === userData?._id ? (
                  <SenderMessage
                    key={mess._id || idx}
                    image={mess.image}
                    message={mess.message}
                  />
                ) : (
                  <ReceiverMessage
                    key={mess._id || idx}
                    image={mess.image}
                    message={mess.message}
                  />
                )
              )}
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="w-full lg:w-[70%] h-[100px] fixed bottom-[20px] flex items-center justify-center px-4">
          {frontendImage && (
            <img
              src={frontendImage}
              alt="preview"
              className="w-[80px] absolute bottom-[100px] right-[20%] rounded-lg shadow-gray-400 shadow-lg"
            />
          )}
          <form
            className="w-[95%] lg:w-[70%] h-[60px] bg-[rgb(23,151,194)] shadow-gray-400 shadow-lg rounded-full flex items-center gap-[20px] px-[20px] relative"
            onSubmit={handleSendMessage}
          >
            <div onClick={() => setShowPicker((prev) => !prev)}>
              <RiEmojiStickerLine className="w-[25px] h-[25px] text-white cursor-pointer" />
            </div>
            <input
              type="file"
              accept="image/*"
              ref={image}
              hidden
              onChange={handleImage}
            />
            <input
              type="text"
              className="w-full h-full px-[10px] outline-none border-0 text-[19px] text-white bg-transparent placeholder-white"
              placeholder="Message"
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
            <div onClick={() => image.current.click()}>
              <FaImages className="w-[25px] h-[25px] cursor-pointer text-white" />
            </div>
            {(input.length > 0 || backendImage != null) && (
              <button type="submit" disabled={isSending}>
                <RiSendPlane2Fill className="w-[25px] cursor-pointer h-[25px] text-white" />
              </button>
            )}
          </form>
        </div>
      )}

      {!selectedUser && (
        <div className="w-full h-full flex flex-col justify-center items-center">
          <h1 className="text-gray-700 font-bold text-[50px]">
            Welcome to Chatly
          </h1>
          <span className="text-gray-700 font-semibold text-[30px]">
            Chat Friendly !
          </span>
        </div>
      )}
    </div>
  );
}

export default MessageArea;
