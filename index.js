const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return;

    try {
        let prompt = "";

        if (text.toLowerCase().includes("plugin")) {
            prompt = `
You are an expert Raganork-MD WhatsApp bot plugin developer.

Rules:
- Return ONLY JavaScript code
- No explanation
- Use Module from '../main'
- Proper pattern, desc, use, usage
- Use message.sendMessage
- Add error handling
- Use streams for media

User request: ${text}
`;
        } else {
            prompt = `You are a friendly AI. Reply normally:\n${text}`;
        }

        const result = await model.generateContent(prompt);
        let reply = result.response.text();

        if (text.toLowerCase().includes("plugin")) {
            reply = "```js\n" + reply + "\n```";
        }

        await bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });

    } catch (err) {
        console.log("ERROR:", err);
        await bot.sendMessage(chatId, "Error 😢 check logs");
    }
});
