import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
export const sendMessage = async (req, resp) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });
    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }
    await Promise.all([conversation.save(), newMessage.save()]);
    resp.status(201).json(newMessage);
  } catch (err) {
    console.log("error while sending", err.message);
    resp.status(500).json({ message: "INTERNAL SERVER ERROR" });
  }
};
export const getMessage = async (req, resp) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) resp.status(200).json([]);
    const messages = conversation.messages;
    resp.status(200).json(messages);
  } catch (err) {
    console.log("error while sending", err.message);
    resp.status(500).json({ message: "INTERNAL SERVER ERROR" });
  }
};
