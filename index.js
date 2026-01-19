const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

client.once("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on("guildMemberAdd", async (member) => {
  const message = `🟢 New Discord Member Joined

👤 User: ${member.user.tag}
🆔 ID: ${member.user.id}
🏠 Server: ${member.guild.name}
🕒 Time: ${new Date().toLocaleString()}`;

  try {
    await axios.post(
      `https://api.telegram.org/bot${process.env.TG_TOKEN}/sendMessage`,
      {
        chat_id: process.env.TG_CHAT_ID,
        text: message
      }
    );
  } catch (err) {
    console.error("Telegram error:", err.message);
  }
});

client.login(process.env.DISCORD_TOKEN);
