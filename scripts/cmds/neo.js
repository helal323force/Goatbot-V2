// neo.js
// 🌈 Neon Emoji Glow — by Helal (Credit Locked 🔒)

const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

// 🔒 Author Lock
const LOCKED_AUTHOR = "Helal";

module.exports = {
  config: {
    name: "neo",
    version: "1.2",
    author: "Helal",
    countDown: 5,
    role: 0,
    category: "image",
    shortDescription: "Add neon emoji glow on photo",
    guide: "{pn} <emoji> <color> <position>",
  },

  onStart: async function ({ api, event, message, args }) {
    try {
      // 🔒 Credit Lock Verification
      if (this.config.author !== LOCKED_AUTHOR) {
        return message.reply("🚫 This command is credit-locked. Author name modification detected.");
      }

      // Ensure user replied to an image
      const reply = event.messageReply;
      if (!reply || !reply.attachments || reply.attachments.length === 0) {
        return message.reply("❌ Please reply to an image when using this command.");
      }

      const imgUrl = reply.attachments[0].url;

      // Parse arguments
      const emoji = args[0] || "✨";
      const color = args[1] || "#00ffff"; // Default cyan
      const position = (args[2] || "middle").toLowerCase();

      // Load image
      const img = await loadImage(imgUrl);
      const width = img.width;
      const height = img.height;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Draw original image
      ctx.drawImage(img, 0, 0, width, height);

      // Neon emoji style
      ctx.font = `${Math.floor(height / 5)}px Arial`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.shadowColor = color;
      ctx.shadowBlur = 25;
      ctx.fillStyle = color;

      // Position setup
      let x = width / 2;
      let y = height / 2;

      switch (position) {
        case "up":
          y = height * 0.2;
          break;
        case "down":
          y = height * 0.8;
          break;
        case "upleft":
          x = width * 0.2;
          y = height * 0.2;
          break;
        case "upright":
          x = width * 0.8;
          y = height * 0.2;
          break;
        case "downleft":
          x = width * 0.2;
          y = height * 0.8;
          break;
        case "downright":
          x = width * 0.8;
          y = height * 0.8;
          break;
        case "middle":
        default:
          break;
      }

      // Draw neon emoji
      ctx.fillText(emoji, x, y);

      // Save and send result
      const outputPath = path.join(__dirname, "temp_neon.png");
      fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

      message.reply(
        {
          body: `✨ Neon emoji added!\nEmoji: ${emoji}\nColor: ${color}\nPosition: ${position}`,
          attachment: fs.createReadStream(outputPath),
        },
        () => fs.unlinkSync(outputPath)
      );

    } catch (err) {
      console.error(err);
      message.reply("⚠️ Error: Please reply to a photo and use the correct command format.");
    }
  },
};