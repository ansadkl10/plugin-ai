const TelegramBot = require('node-telegram-bot-api');
const { OpenAI } = require('openai');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const replyMsg = msg.reply_to_message?.text;

    if (!text && !replyMsg) return;

    let mode = "chat";
    const lower = (text || "").toLowerCase();

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
        let messages = [];

        if (mode === "plugin") {
            messages = [
                {
                    role: "system",
                    content: `You are an expert Raganork-MD WhatsApp bot plugin developer.

Rules:
- Return ONLY JavaScript code
- No explanation
- Use Module from '../main'
- Proper pattern, desc, use, usage
- Use message.sendMessage
- Add error handling
- Use streams for media`
                },
                {
                    role: "user",
                    content: text
                }
            ];
        }

        else if (mode === "fix") {
            messages = [
                {
                    role: "system",
                    content: `Fix this Raganork plugin code. Return ONLY corrected code.`
                },
                {
                    role: "user",
                    content: replyMsg || text
                }
            ];
        }

        else if (mode === "explain") {
            messages = [
                {
                    role: "system",
                    content: `Explain clearly in user's language.`
                },
                {
                    role: "user",
                    content: replyMsg || text
                }
            ];
        }

        else {
            messages = [
                {
                    role: "system",
                    content: `You are a friendly AI assistant.`
                },
                {
                    role: "user",
                    content: text
                }
            ];
        }

        const response = await ai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages
        });

        let reply = response.choices[0].message.content;

        if (mode === "plugin" || mode === "fix") {
            reply = "```js\n" + reply + "\n```";
        }

        await bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });

    } catch (err) {
        console.log("ERROR:", err);
        await bot.sendMessage(chatId, "Error 😢 check logs");
    }
});
