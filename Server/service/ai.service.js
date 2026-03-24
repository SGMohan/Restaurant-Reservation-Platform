require("dotenv").config();
const OpenAI = require("openai");

const SYSTEM_INSTRUCTION = `You are the AI guide for the DineArea restaurant reservation platform. You help users navigate the platform and make reservations.

PLATFORM PAGES (use these links to guide users):
- Homepage: /  → General browsing, explore featured restaurants
- Restaurants: /restaurants  → Browse and search all restaurants
- My Bookings: /my-bookings  → View, manage, and pay for existing bookings
- Login/Signup: /?openAuth=true&view=login  → Authenticate to make a booking

HOW TO GUIDE USERS:
- If user wants to book a table → Ask for cuisine preference or date, then say: "Head over to our [Restaurants page](/restaurants) to browse and book your table!"
- If user wants to see their bookings → Say: "You can view all your reservations on the [My Bookings page](/my-bookings)."
- If user is not logged in and wants to book → Say: "Please [login or sign up](/?openAuth=true&view=login) first, then you can book a table."
- If user wants to cancel or modify → Direct to [My Bookings](/my-bookings)
- If user asks about payment → Direct to [My Bookings](/my-bookings) where they can pay

RULES:
- Be friendly, brief, and helpful.
- Use simple English.
- Always include a relevant page link in your answer when guiding users.
- If user asks about booking, FIRST ask: what cuisine or restaurant type do you prefer?
- Keep responses under 3 sentences.
- Never make up information about specific restaurants.

EXAMPLES:
User: I want to book a table
AI: Of course! What cuisine do you prefer — Indian, Italian, Chinese? Browse all options on our [Restaurants page](/restaurants) 🍽️

User: Show me my reservations
AI: You can view and manage all your bookings on the [My Bookings page](/my-bookings) 📋

User: Hello
AI: Hi! Welcome to DineArea 👋 Looking to book a table or check your reservations?`;

/**
 * AIService - Uses OpenRouter API (OpenAI-compatible) via the openai package
 * OpenRouter gives free access to many models: Llama 3, Mistral, Gemini, etc.
 */
class AIService {
  constructor() {
    this.client = null;
  }

  /**
   * Lazily initializes the OpenRouter client (uses openai SDK with custom baseURL)
   */
  getClient() {
    if (!this.client) {
      if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("OPENROUTER_API_KEY is missing from environment variables");
      }
      // OpenRouter is fully OpenAI-compatible — just change the baseURL
      this.client = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
        defaultHeaders: {
          "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:5173",
          "X-Title": "DineArea AI Assistant",
        },
      });
    }
    return this.client;
  }

  /**
   * Generates a context-aware AI response using OpenRouter
   * @param {string} userPrompt - Current user message
   * @param {Array} history - Previous messages for context
   */
  async generateResponse(userPrompt, history = []) {
    try {
      const client = this.getClient();

      // Build message array: system + history + current message
      const messages = [
        { role: "system", content: SYSTEM_INSTRUCTION },
        ...history
          .filter((msg) => msg && msg.role && msg.content)
          .map((msg) => ({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content,
          })),
        { role: "user", content: userPrompt },
      ];

      console.log(`Sending to OpenRouter (History: ${history.length} messages)`);

      // Primary: openrouter/auto — smart router picks the best available free model
      // Fallbacks: confirmed free models from OpenRouter (March 2026)
      const modelsToTry = [
        "openrouter/auto",                                    // Auto pick best free model
        "nvidia/llama-3.3-nemotron-super-49b-v1:free",       // Nvidia Nemotron 49B free
        "qwen/qwen3-8b:free",                                 // Qwen 3 8B free
        "mistralai/mistral-7b-instruct:free",                 // Mistral 7B free
        "google/gemma-3-12b-it:free",                         // Gemma 3 12B free
        "meta-llama/llama-3.3-70b-instruct:free",             // Llama 3.3 70B free
      ];

      let lastError = null;
      for (const model of modelsToTry) {
        try {
          const completion = await client.chat.completions.create({
            model,
            messages,
            temperature: 0.7,
            max_tokens: 400,
          });
          console.log(`Success with model: ${model}`);
          return completion.choices[0].message.content;
        } catch (err) {
          console.warn(`Model ${model} failed: ${err.message}`);
          lastError = err;
        }
      }
      throw lastError; // re-throw if all models fail

    } catch (error) {
      console.error("CRITICAL OpenRouter SERVICE ERROR:");
      console.error("  Message:", error.message);
      if (error.status) console.error("  Status Code:", error.status);
      if (error.stack) console.error("  Stack:", error.stack);
      return "I'm having a brief issue right now. Please try again in a moment!";
    }
  }

  /**
   * Fetches last N messages for context window
   */
  async getContext(sessionId) {
    try {
      const { ChatMessage } = require("../model/ai.model");
      const history = await ChatMessage.find({ sessionId })
        .sort({ timestamp: -1 })
        .limit(10);
      return history.reverse();
    } catch (error) {
      console.error("Error fetching context:", error.message);
      return [];
    }
  }
}

module.exports = new AIService();
