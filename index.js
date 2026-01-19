// ==================== IMPORTS ====================
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
const express = require("express");
const bodyParser = require("body-parser");

// ==================== ENV VARIABLES ====================
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const TG_TOKEN = process.env.TG_TOKEN;
const TG_CHAT_ID = process.env.TG_CHAT_ID; // Can be comma-separated IDs
const WEBHOOK_PATH = process.env.WEBHOOK_PATH || "/telegram-webhook"; // Unique path for Telegram webhook

if (!DISCORD_TOKEN || !TG_TOKEN || !TG_CHAT_ID || !GUILD_ID) {
  console.error("Missing required environment variables!");
  process.exit(1);
}

const TG_CHAT_IDS = TG_CHAT_ID.split(",");

// ==================== EXPRESS SERVER (Webhook) ====================
const app = express();
app.use(bodyParser.json());

app.post(WEBHOOK_PATH, async (req, res) => {
  const msg = req.body.message;
  if (!msg) return res.sendStatus(200);

  const chatId = msg.chat.id;
  const text = msg.text;

  console.log(`Received Telegram message from ${chatId}: ${text}`);

  if (text === "/start") {
    for (const id of TG_CHAT_IDS) {
      await axios.post(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
        chat_id: id,
        text: "Hello! I am your Discord notifier bot. You will receive notifications here whenever someone joins the server.",
      });
    }
  } else {
    await axios.post(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: `You said: "${text}"`,
    });
  }

  res.sendStatus(200);
});

// ==================== DISCORD CLIENT ====================
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once("ready", () => {
  console.log(`Discord bot logged in as ${client.user.tag} ✅`);
});

client.on("guildMemberAdd", async (member) => {
  if (member.guild.id !== GUILD_ID) return;

  const message = `🟢 New Discord Member Joined
👤 User: ${member.user.tag}
🆔 ID: ${member.user.id}
🏠 Server: ${member.guild.name}
🕒 Time: ${new Date().toLocaleString()}`;

  console.log(message);

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

client.login(DISCORD_TOKEN);

// ==================== START EXPRESS SERVER ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Set Telegram webhook
  const webhookUrl = `https://${process.env.RAILWAY_STATIC_URL}${WEBHOOK_PATH}`;
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${TG_TOKEN}/setWebhook`,
      { url: webhookUrl }
    );
    console.log("Webhook set:", response.data);
  } catch (err) {
    console.error("Failed to set webhook:", err.message);
  }
});
