const TelegramBot = require("node-telegram-bot-api");
const { GoogleGenerativeAI } = require("@google/generative-ai");
//require('dotenv').config();

// Buat instance bot
const token = process.env.ID_TOKEN;
const geminiApiKey = process.env.GEMINI_API_KEY;

const bot = new TelegramBot(token, { polling:true });

const vercelUrl = process.env.VERCEL_URL; 
const webhookUrl = `https://${vercelUrl}/${token}`; 
bot.setWebHook(webhookUrl);
module.exports = (req, res) => {
  bot.processUpdate(req.body);
  res.status(200).end();
};

// gemini
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Fungsi async untuk generate teks dengan Gemini
async function generateFable(prompt) {
    try {
        //const result = await model.generateContent(prompt);
        const result = await model.generateContent(prompt);
        return result.response.text(); // Perhatikan tanda kurung di sini
    } catch (error) {
        console.error("Error generating story:", error);
        return "Maaf, terjadi kesalahan saat membuat cerita.";
    }
}

// Tangkap pesan dari pengguna
// Tangkap pesan /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId,
        "Selamat datang di bot pembuat cerita! Kirimkan saya sebuah tema dan saya akan buatkan cerita pendek untuk Anda."
    );
});

bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Kirim pesan ke Gemini API untuk menghasilkan cerita
    generateFable(text)
        .then((fable) => bot.sendMessage(chatId, fable))
        .catch((error) => console.error("Error sending message:", error));
});
