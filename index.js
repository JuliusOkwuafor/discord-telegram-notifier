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
const GUILD_ID = process.env.GUILD_ID;       // Only notify this server
const TG_TOKEN = process.env.TG_TOKEN;
const TG_CHAT_ID = process.env.TG_CHAT_ID;

// Check for missing environment variables
if (!DISCORD_TOKEN || !TG_TOKEN || !TG_CHAT_ID || !GUILD_ID) {
  console.error("Error: Missing environment variables!");
  process.exit(1);
}

// ==================== CREATE DISCORD CLIENT ====================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ==================== BOT READY EVENT ====================
client.once("ready", () => {
  console.log(`Discord bot logged in as ${client.user.tag} ✅`);
});

// ==================== NEW MEMBER JOIN EVENT ====================
client.on("guildMemberAdd", async (member) => {
  // Only notify if the member joined the specified server
  if (member.guild.id !== GUILD_ID) return;

  try {
    const message = `🟢 New Discord Member Joined
👤 User: ${member.user.tag}
🆔 ID: ${member.user.id}
🏠 Server: ${member.guild.name}
🕒 Time: ${new Date().toLocaleString()}`;

    console.log(message);

    // Send Telegram message
    try {
      await axios.post(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
        chat_id: TG_CHAT_ID,
        text: message
      });
      console.log("Telegram notification sent ✅");
    } catch (tgErr) {
      console.error("Telegram API error:", tgErr.message);
    }
  } catch (err) {
    console.error("Error handling new member:", err);
  }
});

// ==================== TELEGRAM BOT SETUP ====================
const tgBot = new TelegramBot(TG_TOKEN, { polling: true });

// Listen for messages sent to the bot
tgBot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  console.log(`Received message from ${chatId}: ${text}`);

  // Respond to /start
  if (text === "/start") {
    tgBot.sendMessage(chatId, "Hello! I am your Discord notifier bot. You will receive notifications here whenever someone joins the server.");
  } else {
    // Echo any other message
    tgBot.sendMessage(chatId, `You said: "${text}"`);
  }
});

// ==================== LOGIN BOT ====================
client.login(DISCORD_TOKEN)
  .then(() => console.log("Discord login successful!"))
  .catch(err => {
    console.error("Discord login failed:", err);
    process.exit(1); // Stop the bot if login fails
  });
