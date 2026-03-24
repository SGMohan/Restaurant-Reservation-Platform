const mongoose = require("mongoose");

/**
 * ChatSession Schema - Tracks user conversations
 */
const chatSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdAt: { type: Date, default: Date.now },
});

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);

/**
 * ChatMessage Schema - Stores individual message history within a session
 */
const chatMessageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

module.exports = { ChatSession, ChatMessage };
