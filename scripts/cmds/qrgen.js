const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "qr",
    aliases: ["qrgen"],
    version: "1.0",
    author: "Helal",
    countDown: 0,
    role: 0,
    category: "utility",
    shortDescription: "Generate QR code from text using API",
    guide: "{pn} <text>"
  },

  onStart: async function ({ api, event, args, message }) {
    if (!args.length) return message.reply("⚠️ Please provide text to generate QR code.");

    const text = encodeURIComponent(args.join(" "));
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${text}`;

    try {
      const imagePath = path.join(__dirname, `tmp/qr_${Date.now()}.png`);

      const res = await fetch(qrUrl);
      const buffer = await res.buffer();

      fs.writeFileSync(imagePath, buffer);

      message.reply({ body: `🔳 QR Code for: ${args.join(" ")}`, attachment: fs.createReadStream(imagePath) }, () => {
        fs.unlinkSync(imagePath);
      });
    } catch (error) {
      console.error(error);
      message.reply("❌ Error generating QR code.");
    }
  }
};
