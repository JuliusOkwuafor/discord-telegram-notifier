// ==================== IMPORTS ====================
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

// ==================== ERROR HANDLING ====================
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
});

// ==================== ENVIRONMENT VARIABLES ====================
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID; // Discord server to monitor
const TG_TOKEN = process.env.TG_TOKEN;
const TG_CHAT_ID = process.env.TG_CHAT_ID; // Can be comma-separated IDs

if (!DISCORD_TOKEN || !TG_TOKEN || !TG_CHAT_ID || !GUILD_ID) {
  console.error("Error: Missing environment variables!");
  process.exit(1);
}

// Support multiple Telegram chat IDs
const TG_CHAT_IDS = TG_CHAT_ID.split(",");

// ==================== DISCORD CLIENT ====================
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once("ready", () => {
  console.log(`Discord bot logged in as ${client.user.tag} ✅`);
});

// ==================== NEW MEMBER EVENT ====================
client.on("guildMemberAdd", async (member) => {
  if (member.guild.id !== GUILD_ID) return;

  const message = `🟢 New Discord Member Joined
👤 User: ${member.user.tag}
🆔 ID: ${member.user.id}
🏠 Server: ${member.guild.name}
🕒 Time: ${new Date().toLocaleString()}`;

  console.log(message);

  // Send Telegram to all chat IDs
  for (const chatId of TG_CHAT_IDS) {
    try {
      await axios.post(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
        chat_id: chatId,
        text: message,
      });
      console.log(`Telegram notification sent to ${chatId} ✅`);
    } catch (err) {
      console.error(`Error sending to ${chatId}:`, err.message);
    }
  }
});

// ==================== TELEGRAM BOT ====================
const tgBot = new TelegramBot(TG_TOKEN, { polling: true });

tgBot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  console.log(`Received message from ${chatId}: ${text}`);

  if (text === "/start") {
    tgBot.sendMessage(
      chatId,
      "Hello! I am your Discord notifier bot. You will receive notifications here whenever someone joins the server."
    );
  } else {
    tgBot.sendMessage(chatId, `You said: "${text}"`);
  }
});

// ==================== LOGIN DISCORD ====================
client
  .login(DISCORD_TOKEN)
  .then(() => console.log("Discord login successful!"))
  .catch((err) => {
    console.error("Discord login failed:", err);
    process.exit(1);
  });
