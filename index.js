const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ====== CONFIG ======
const TOKEN = const TOKEN = process.env.TOKEN;
const GUILD_ID = "1352467283603095683";
const CHANNEL_ID = "1404060567374794782";
const GROUP_URL = "https://groups.roblox.com/v1/groups/11005492";
const MILESTONE_STEP = 500; 

// ====== STATE ======
let currentMembers = null;
let lastMilestone = null;

// ====== HELPERS ======
function formatCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getNextMilestone(count) {
  return Math.ceil(count / MILESTONE_STEP) * MILESTONE_STEP;
}

// ====== MAIN LOGIC ======
async function post() {
  let res;
  try {
    res = await axios.get(GROUP_URL);
  } catch (err) {
    console.error("Roblox API error", err);
    return;
  }

  const members = res.data.memberCount;

  if (currentMembers === null) {
    currentMembers = members;
    lastMilestone = Math.floor(members / MILESTONE_STEP) * MILESTONE_STEP;
    return;
  }

  const diff = members - currentMembers;
  currentMembers = members;

  if (diff <= 0) return;

  const guild = client.guilds.cache.get(GUILD_ID);
  const channel = guild.channels.cache.get(CHANNEL_ID);

  let content = `⭐ We gained **${diff}** new member${diff === 1 ? "" : "s"}!
**${formatCommas(members)}** total members`;

  const milestone =
    Math.floor(members / MILESTONE_STEP) * MILESTONE_STEP;

  if (milestone > lastMilestone) {
    lastMilestone = milestone;
    content =
      `🎉 **MILESTONE REACHED!** 🎉\n` +
      `We just hit **${formatCommas(milestone)} members!**\n` +
      `Next goal: **${formatCommas(getNextMilestone(members))}**`;

    await channel.send({
      content: `@here\n${content}`,
      allowedMentions: { parse: ["everyone"] }
    });
    return;
  }

  await channel.send({ content });
}

// ====== BOT READY ======
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  setInterval(post, 5 * 60 * 1000); // every 5 min
});

// ====== LOGIN ======
client.login(TOKEN);
