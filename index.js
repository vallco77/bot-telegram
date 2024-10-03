const TelegramBot = require("node-telegram-bot-api");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const app = express();

const port = process.env.PORT || 3000;
//const env = process.env.NODE_ENV || 'development';
//const port = env === 'development' ? 3000 : process.env.PORT; 

// Buat instance bot
const bot = new TelegramBot(process.env.ID_TOKEN, { polling: false });
//gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
};

app.get("/", (req, res) => {
    res.send("Bot is running!");
});

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

// Set webhook (ganti YOUR_TELEGRAM_BOT_TOKEN dan YOUR_RENDER_URL)
//bot.setWebHook(`https://YOUR_RENDER_URL/YOUR_TELEGRAM_BOT_TOKEN`);

app.listen(port, () => {
    console.log(`Bot listening on port ${port}`);
});
