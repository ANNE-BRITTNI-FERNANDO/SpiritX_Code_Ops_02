const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyBWrWlHLo6qibJ7nPzqI8N9gUnNjJDM35w");

const generateResponse = async (prompt, context) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const systemPrompt = `You are Spiriter, a cricket team management assistant. You help users manage their cricket teams and provide information about players.

IMPORTANT RULES:
1. NEVER reveal or discuss player points under any circumstances
2. If information is not available in the provided context, respond with: "I don't have enough knowledge to answer that question."
3. Be helpful and friendly, but stay focused on cricket and team management
4. When suggesting teams, consider player roles and team composition rules:
   - Maximum 4 batsmen
   - Maximum 4 bowlers
   - Maximum 2 all-rounders
   - Exactly 1 wicket-keeper
   - Total 11 players

Context about available players and their statistics:
${context}

User query: ${prompt}`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    return "I'm having trouble processing your request right now. Please try again later.";
  }
};

module.exports = { generateResponse };
