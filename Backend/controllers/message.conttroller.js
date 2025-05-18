import uploadCloudinary from "../config/cloudinary.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const sender = req.userId;
    const { receiver } = req.params;

    // Ensure message or image is provided
    const messageText = req.body.message;
    if (!messageText && !req.file) {
      return res.status(400).json({ message: "Message or image is required" });
    }

    let imageUrl = null;
    if (req.file && req.file.path) {
      const uploaded = await uploadCloudinary(req.file.path);
      imageUrl = uploaded.url;
    }

    // Create the new message
    

    // Find existing conversation with these two participants (order-independent)
    let conversation = await Conversation.findOne({
      participants: { $all: [sender, receiver] },
    });

    const newMessage = await Message.create({
      sender,
      receiver,
      message: messageText || "",
      image: imageUrl,
    });

    // Create or update conversation
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [sender, receiver],
        messages: [newMessage._id],
      });
    } else {
      conversation.messages.push(newMessage._id);
      await conversation.save();
    }

    const receiverSocketId = getReceiverSocketId(receiver);
    if(receiverSocketId){
      io.to(receiverSocketId).emit("newMessage",newMessage)
    }

    return res.status(201).json({ newMessage });
  } catch (err) {
    console.error("Send Message Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const sender = req.userId;
    const { receiver } = req.params;


    const conversation = await Conversation.findOne({
      participants: { $all: [sender, receiver] },
    }).populate("messages");

    if (!conversation) {
      console.log("No conversation found for participants:", sender, receiver);
      return res.status(200).json({ messages: [] });
    }


    // Return messages array (empty if none)
    return res.status(200).json({ messages: conversation.messages });
  } catch (err) {
    console.error("Get Messages Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
