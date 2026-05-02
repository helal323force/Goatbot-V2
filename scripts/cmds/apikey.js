const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "apikey",
    version: "3.0",
    author: "Helal",
    countDown: 5,
    role: 2,
    shortDescription: "Show only API key values used in a command file (owner/admin only)",
    category: "system",
  },

  onStart: async function ({ api, event, args }) {
    try {
      // Locate config.json
      let configPath = path.join(__dirname, "../../config.json");
      if (!fs.existsSync(configPath)) configPath = path.join(__dirname, "..", "config.json");
      if (!fs.existsSync(configPath)) {
        const sent = await api.sendMessage("⚠️ config.json not found!", event.threadID, event.messageID);
        return setTimeout(() => api.unsendMessage(sent.messageID), 10000);
      }

      const config = require(configPath);
      const owners = config.botOwner || config.adminBot || config.admins || [];
      const senderID = event.senderID;

      if (!owners.includes(senderID)) {
        const sent = await api.sendMessage("⛔ You are not allowed to use this command!", event.threadID, event.messageID);
        return setTimeout(() => api.unsendMessage(sent.messageID), 10000);
      }

      if (!args[0]) {
        const sent = await api.sendMessage("📘 Usage: /apikey <commandName>", event.threadID, event.messageID);
        return setTimeout(() => api.unsendMessage(sent.messageID), 10000);
      }

      const cmdName = args[0].toLowerCase();

      // Find file path
      const possibleDirs = [
        __dirname,
        path.join(__dirname, ".."),
        path.join(__dirname, "..", "commands"),
        path.join(__dirname, "..", "cmds"),
        path.join(__dirname, "..", "scripts")
      ];

      let cmdPath = null;
      for (const d of possibleDirs) {
        const test = path.join(d, `${cmdName}.js`);
        if (fs.existsSync(test)) { cmdPath = test; break; }
      }

      if (!cmdPath) {
        const sent = await api.sendMessage(`❌ Command file '${cmdName}.js' not found!`, event.threadID, event.messageID);
        return setTimeout(() => api.unsendMessage(sent.messageID), 10000);
      }

      const content = fs.readFileSync(cmdPath, "utf8");

      // Regex — find only pure key values (inside quotes)
      const keyRegex = /['"`]([A-Za-z0-9\-_]{10,})['"`]/g;
      const keys = [];
      let match;

      while ((match = keyRegex.exec(content)) !== null) {
        const val = match[1];
        // filter out obvious non-key patterns (words or urls)
        if (/^(http|www|https)/i.test(val)) continue;
        if (/^[A-Za-z]{3,10}$/.test(val)) continue;
        if (!keys.includes(val)) keys.push(val);
      }

      if (!keys.length) {
        const sent = await api.sendMessage(`🧐 No API key found in '${cmdName}.js' file.`, event.threadID, event.messageID);
        return setTimeout(() => api.unsendMessage(sent.messageID), 10000);
      }

      // Prepare final message
      const reply = `📄 Source: ${cmdName}.js\n🔐 API Keys used: ${keys.join(" | ")}`;

      const sent = await api.sendMessage(reply, event.threadID, event.messageID);

      // Auto unsend after 10s
      setTimeout(() => {
        try { api.unsendMessage(sent.messageID); } catch (e) {}
      }, 10000);

    } catch (err) {
      console.error(err);
      const sent = await api.sendMessage("⚠️ Error while fetching API key data.", event.threadID, event.messageID);
      setTimeout(() => api.unsendMessage(sent.messageID), 10000);
    }
  },
};
