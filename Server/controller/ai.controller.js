const express = require("express");
const AiRouter = express.Router();
const aiService = require("../service/ai.service");
const { ChatSession, ChatMessage } = require("../model/ai.model");
const { v4: uuidv4 } = require("uuid"); // Requirement: v4 UUIDs for sessions

/**
 * FIXED: Chat Processing Endpoint (POST /api/chat/send)
 * Handles input validation, storage, and AI generation
 */
AiRouter.post("/send", async (req, res) => {
  const { message, sessionId, userId } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ success: false, message: "Empty message provided" });
  }

  try {
    // 1. Ensure session exists
    let session = await ChatSession.findOne({ sessionId: sessionId || "new" });
    let currentSessionId = sessionId;

    if (!session) {
      currentSessionId = uuidv4();
      session = new ChatSession({
        sessionId: currentSessionId,
        userId: userId || null,
      });
      await session.save();
    }

    // 2. Store user message in DB
    const userMsg = new ChatMessage({
      sessionId: currentSessionId,
      role: "user",
      content: message,
    });
    await userMsg.save();

    // 3. Get history for context and generate AI response
    const history = await aiService.getContext(currentSessionId);
    const aiResponse = await aiService.generateResponse(message, history);

    // 4. Store assistant response in DB
    const assistantMsg = new ChatMessage({
      sessionId: currentSessionId,
      role: "assistant",
      content: aiResponse,
    });
    await assistantMsg.save();

    // 5. Return response to UI (also includes sessionId for newly created ones)
    return res.status(200).json({
      success: true,
      data: aiResponse,
      sessionId: currentSessionId,
    });
  } catch (error) {
    console.error("Chat Controller ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Failed to process chat" });
  }
});

/**
 * FIXED: Session History Fetcher (GET /api/chat/history/:sessionId)
 */
AiRouter.get("/history/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const history = await ChatMessage.find({ sessionId }).sort({ timestamp: 1 });
    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Chat History ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Failed to fetch history" });
  }
});

module.exports = AiRouter;
