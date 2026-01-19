// ==================== IMPORTS ====================
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

// ==================== ERROR HANDLING ====================
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
});

// ==================== ENVIRONMENT VARIABLES ====================
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const TG_TOKEN = process.env.TG_TOKEN;
const TG_CHAT_ID = process.env.TG_CHAT_ID;

// Check for missing environment variables
if (!DISCORD_TOKEN || !TG_TOKEN || !TG_CHAT_ID) {
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
  console.log(`Bot logged in as ${client.user.tag} ✅`);
});

// ==================== NEW MEMBER JOIN EVENT ====================
client.on("guildMemberAdd", async (member) => {
  try {
    // Build message
    const message = `🟢 New Discord Member Joined
👤 User: ${member.user.tag}
🆔 ID: ${member.user.id}
🏠 Server: ${member.guild.name}
🕒 Time: ${new Date().toLocaleString()}`;

    console.log(message); // Log locally

    // Send message to Telegram
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

// ==================== LOGIN BOT ====================
client.login(DISCORD_TOKEN)
  .then(() => console.log("Discord login successful!"))
  .catch(err => {
    console.error("Discord login failed:", err);
    process.exit(1); // Stop the bot if login fails
  });
