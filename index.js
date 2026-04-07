const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Correct model (Flash Lite equivalent)
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-latest"
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const replyMsg = msg.reply_to_message?.text;

    if (!text && !replyMsg) return;

    let mode = "chat";
    const lower = (text || "").toLowerCase();

    // 🔍 Smart detection
    if (lower.includes("create") || lower.includes("plugin") || lower.includes("ഉണ്ടാക്ക്")) {
        mode = "plugin";
    } 
    else if (lower.includes("fix") || lower.includes("correct") || lower.includes("ശരി")) {
        mode = "fix";
    } 
    else if (lower.includes("error") || lower.includes("issue") || lower.includes("problem")) {
        mode = "explain";
    }

    try {
        let prompt = "";

        // 🔥 Plugin Generator
        if (mode === "plugin") {
            prompt = `
You are an expert Raganork-MD WhatsApp bot plugin developer.

Rules:
- Return ONLY JavaScript code
- No explanation
- Use Module from '../main'
- Include pattern, desc, use, usage
- Use message.sendMessage
- Add proper error handling
- Use streams for media

User request:
${text}
`;
        }

        // 🛠️ Plugin Fixer
        else if (mode === "fix") {
            prompt = `
Fix this Raganork plugin code.

Rules:
- Return ONLY corrected JavaScript code
- No explanation

Code:
${replyMsg || text}
`;
        }

        // 📖 Explain Errors
        else if (mode === "explain") {
            prompt = `
Explain this clearly in user's language:

${replyMsg || text}
`;
        }

        // 💬 Normal Chat
        else {
            prompt = `
You are a friendly AI assistant. Reply naturally:

${text}
`;
        }

        const result = await model.generateContent(prompt);
        let reply = result.response.text();

        // 📦 Format code block
        if (mode === "plugin" || mode === "fix") {
            reply = "```js\n" + reply + "\n```";
        }

        await bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });

    } catch (err) {
        console.log("ERROR:", err);
        await bot.sendMessage(chatId, "Error 😢 check logs");
    }
});
