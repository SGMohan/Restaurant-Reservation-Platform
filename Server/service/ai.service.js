require("dotenv").config();
const OpenAI = require("openai");

const SYSTEM_INSTRUCTION = `You are the AI guide for DineArea, a restaurant reservation platform.

STRICT RESPONSE RULES:
1. PURE GREETINGS: If the user's message is ONLY a greeting (e.g., "Hi", "Hello", "Hey"), reply exactly with: "Hi there! Welcome to DineArea. How can I assist you with your restaurant bookings today?"
2. OUT OF SCOPE: Use this strict fallback ONLY for completely unrelated topics (e.g., weather, history, coding). Reply exactly with: "I'm sorry, my expertise is limited to DineArea. Please ask me only about bookings, restaurants, or our platform!" DO NOT use this message if the user is asking about DineArea features like logging in or signing up.
3. PLATFORM HELP: If the user asks how to use the platform (e.g., "how to signup", "where do I login", "how to check my bookings"), answer them politely using the links provided in the PLATFORM MAPPING section. DO NOT include the "out of scope" message.
4. CUISINE OR BUDGET: If the user mentions a specific cuisine, food type, or budget (e.g., "Italian", "pizza", "cheap", "under $50"), you MUST look at the AVAILABLE RESTAURANTS section below and list the matching restaurant names. Tell them to head over to our [Restaurants page](/restaurants) to book.
5. GENERAL BOOKING/OTHER: If the user just says "book a table" without specifying cuisine/budget, reply exactly with: "Great! Which cuisine or restaurant type would you prefer? Italian, Mexican, or Thai? Head over to our [Restaurants page](/restaurants) to browse and book your table! 🍝🍕🍛"

AVAILABLE RESTAURANTS:
{RESTAURANT_LIST}

PLATFORM MAPPING:
- Homepage: /
- All Restaurants: /restaurants
- My Bookings/Payments: /my-bookings
- Login/Auth: /?openAuth=true&view=login

BEHAVIOR:
- Be extremely polite.
- Always guide the user back to DineArea services.
- Never answer questions unrelated to the platform.`;

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

      // Fetch dynamic restaurant data
      const DiningModel = require("../model/dining.model");
      const dinings = await DiningModel.find().populate("restaurant", "name").limit(20);
      
      let restaurantData = "No restaurants currently available.";
      if (dinings && dinings.length > 0) {
        restaurantData = dinings.map(d => {
          return `- ${d.restaurant?.name || 'Unknown'} (Cuisine: ${d.cuisineType}, Price: $${d.priceRange})`;
        }).join('\n');
      }

      const dynamicInstruction = SYSTEM_INSTRUCTION.replace("{RESTAURANT_LIST}", restaurantData);

      // Build message array: system + history + current message
      const messages = [
        { role: "system", content: dynamicInstruction },
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
}

module.exports = new AIService();
