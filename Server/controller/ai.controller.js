const express = require("express");
const AiRouter = express.Router();
const aiService = require("../service/ai.service");

/**
 * FIXED: Chat Processing Endpoint (POST /chat/send)
 * Now stateless - No database storage or history retrieval
 */
AiRouter.post("/send", async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ success: false, message: "Empty message provided" });
  }

  try {
    // Stateless generation - send only current message, no history for context
    const aiResponse = await aiService.generateResponse(message, []);

    // Return response directly to UI
    return res.status(200).json({
      success: true,
      data: aiResponse,
    });
  } catch (error) {
    console.error("Chat Controller ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Failed to process chat" });
  }
});

/**
 * DISABLED: Session History Fetcher (GET /chat/history/:sessionId)
 * History persistence is no longer supported
 */
AiRouter.get("/history/:sessionId", async (req, res) => {
  return res.status(200).json({
    success: true,
    data: [], // Always return empty history
    message: "Chat history persistence is disabled"
  });
});

module.exports = AiRouter;
