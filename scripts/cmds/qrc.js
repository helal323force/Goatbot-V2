const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");

module.exports = {
  config: {
    name: "qrc",
    version: "4.0",
    author: "Helal",
    countDown: 3,
    role: 0,
    category: "utility",
    shortDescription: "Create colorful QR code",
    longDescription: "Generate exact color QR or smooth rainbow gradient.",
    guide: "{pn} <color> <text>"
  },

  onStart: async function ({ message, args }) {
    if (args.length < 2)
      return message.reply("⚠️ Usage: /qrc <color> <text>");

    const colorMode = args[0].toLowerCase();
    const text = args.slice(1).join(" ");

    const cacheDir = path.join(__dirname, "cache");
    fs.mkdirSync(cacheDir, { recursive: true });

    const filePath = path.join(cacheDir, `qr_${Date.now()}.png`);

    message.reply(`🎨 Generating ${colorMode.toUpperCase()} QR Code…`);

    try {
      // Base QR
      const qrBuffer = await QRCode.toBuffer(text, {
        errorCorrectionLevel: "H",
        scale: 12,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
      });

      const img = await Jimp.read(qrBuffer);
      const w = img.bitmap.width;
      const h = img.bitmap.height;

      // *** Pure single color list ***
      const singleColors = {
        red: "#FF0000",
        blue: "#007BFF",
        green: "#00C853",
        pink: "#FF4081",
        yellow: "#FFD600",
        purple: "#9C27B0",
        orange: "#FF6D00",
        cyan: "#00E5FF",
        black: "#000000",
        white: "#FFFFFF"
      };

      // 🌈 Smooth Rainbow (Top → Bottom)
      const rainbow = [
        "#FF0000",
        "#FF7F00",
        "#FFFF00",
        "#00FF00",
        "#0000FF",
        "#4B0082",
        "#9400D3"
      ];

      function hexToRGB(hex) {
        return {
          r: parseInt(hex.slice(1, 3), 16),
          g: parseInt(hex.slice(3, 5), 16),
          b: parseInt(hex.slice(5, 7), 16)
        };
      }

      // 🌈 Rainbow Gradient Mode
      if (colorMode === "rainbow") {
        img.scan(0, 0, w, h, function (x, y, idx) {
          const isBlack = this.bitmap.data[idx] < 128;
          if (!isBlack) return;

          const pos = Math.floor((y / h) * (rainbow.length - 1));
          const { r, g, b } = hexToRGB(rainbow[pos]);

          this.bitmap.data[idx] = r;
          this.bitmap.data[idx + 1] = g;
          this.bitmap.data[idx + 2] = b;
        });
      }

      // 🎨 Single Color Mode (exact color only)
      else {
        const hex = singleColors[colorMode] || "#000000";
        const { r, g, b } = hexToRGB(hex);

        img.scan(0, 0, w, h, function (x, y, idx) {
          const isBlack = this.bitmap.data[idx] < 128;
          if (isBlack) {
            this.bitmap.data[idx] = r;
            this.bitmap.data[idx + 1] = g;
            this.bitmap.data[idx + 2] = b;
          }
        });
      }

      await img.writeAsync(filePath);

      await message.reply({
        body: `✅ Done! (${colorMode.toUpperCase()})`,
        attachment: fs.createReadStream(filePath)
      });

      setTimeout(() => fs.unlinkSync(filePath), 3000);

    } catch (err) {
      console.error(err);
      message.reply("❌ Error generating QR code.");
    }
  }
};