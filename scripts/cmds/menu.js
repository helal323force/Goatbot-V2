const fs = require("fs");

module.exports = {
  config: {
    name: "help4",
    aliases: [],
    version: "2.1",
    author: "Helal",
    role: 0,
    shortDescription: "Show full command list with animation + fancy font",
    category: "system"
  },

  onStart: async function ({ api, event }) {
    const commands = global.GoatBot?.commands || new Map();

    // Send first loading message
    const sent = await api.sendMessage("⏳ Loading help menu...", event.threadID);

    // Animation frames
    const frames = [
      "[░░░░░░░░░░] ⚪ 0%",
      "[██░░░░░░░░] 🟠 40%",
      "[██████░░░░] 🔴 80%",
      "[██████████] 🟢 100%"
    ];

    // Play animation
    for (const frame of frames) {
      await new Promise(r => setTimeout(r, 500));
      await api.editMessage(frame, sent.messageID);
    }

    await new Promise(r => setTimeout(r, 500));

    // Sort commands by category
    const categories = {};
    for (const [name, cmd] of commands.entries()) {
      const cat = cmd.config?.category
        ? cmd.config.category.toUpperCase()
        : "📁 OTHER";

      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
    }

    // Build menu text
    let menu =
      "🛡️ 𝙷𝙴𝙻𝙿 𝙼𝙴𝙽𝚄\n━━━━━━━━━━━━━━━━━━━━━━\n";

    // Create category sections
    for (const [cat, cmds] of Object.entries(categories)) {
      menu += `
╭───────❍📦❍────────╮ ${convertFont(cat)}\n`;

      const pairs = chunkArray(cmds, 2);
      for (const row of pairs) {
        const c1 = row[0] ? `🔹 ${convertFont(row[0])}` : "";
        const c2 = row[1] ? `   🔹 ${convertFont(row[1])}` : "";
        menu += `${c1}${c2}\n`;
      }

      menu += "\n";
    }

    // Footer
    menu +=
      "━━━━━━━━━━━━━━━━━━━━━━\n" +
      `📦 ᴛᴏᴛᴀʟ ᴄᴏᴍᴍᴀɴᴅꜱ: ${commands.size}\n` +
      "💡 ᴜꜱᴇ: /help <command>\n" +
      "👑 ᴏᴡɴᴇʀ: ʜᴇʟᴀʟ\n" +
      "━━━━━━━━━━━━━━━━━━━━━━";

    await api.editMessage(menu, sent.messageID);
  }
};

// Split array into chunks
function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

// Fancy font converter
function convertFont(text) {
  const normal = "abcdefghijklmnopqrstuvwxyz";
  const fancy = "ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀꜱᴛᴜᴠᴡxʏᴢ";

  return text
    .split("")
    .map(ch => {
      const idx = normal.indexOf(ch.toLowerCase());
      return idx !== -1 ? fancy[idx] : ch;
    })
    .join("");
}