module.exports = {
  config: {
    name: "font2",
    version: "3.0",
    author: "Helal",
    description: {
      role: 0,
      en: "Convert text into 100 stylish fonts",
    },
    category: "Utility",
  },

  langs: {
    en: {
      list_title: "🎨 Available Fonts (1–100):",
      invalid_number: "⚠️ Please enter a valid font number (1–100)!",
      no_text: "⚠️ Please enter some text after the font number!",
    },
  },

  onStart: async function ({ args, message, getLang }) {
    if (!args[0]) return message.reply(getLang("invalid_number"));

    // Font list
    if (args[0].toLowerCase() === "list") {
      const fontList = generateFontList();
      const previewText = fontList.map((f, i) => `${i + 1}. ${f.preview}`).join("\n");
      return message.reply(`${getLang("list_title")}\n\n${previewText}`);
    }

    const num = parseInt(args[0]);
    if (isNaN(num) || num < 1 || num > 100)
      return message.reply(getLang("invalid_number"));

    const text = args.slice(1).join(" ");
    if (!text) return message.reply(getLang("no_text"));

    const styled = applyFont(num, text);
    const sent = await message.reply(styled);

    setTimeout(() => message.unsend(sent.messageID), 6000);
  },
};

// ==========================
// FONT LOGIC SECTION
// ==========================

function generateFontList() {
  const previews = [];
  for (let i = 1; i <= 100; i++) {
    previews.push({
      id: i,
      preview: applyFont(i, "Font Preview"),
    });
  }
  return previews;
}

function applyFont(styleNum, text) {
  const fontSets = [
    // 1–10
    ["𝓪","𝓫","𝓬","𝓭","𝓮","𝓯","𝓰","𝓱","𝓲","𝓳","𝓴","𝓵","𝓶","𝓷","𝓸","𝓹","𝓺","𝓻","𝓼","𝓽","𝓾","𝓿","𝔀","𝔁","𝔂","𝔃"],
    ["𝕒","𝕓","𝕔","𝕕","𝕖","𝕗","𝕘","𝕙","𝕚","𝕛","𝕜","𝕝","𝕞","𝕟","𝕠","𝕡","𝕢","𝕣","𝕤","𝕥","𝕦","𝕧","𝕨","𝕩","𝕪","𝕫"],
    ["𝒶","𝒷","𝒸","𝒹","ℯ","𝒻","ℊ","𝒽","𝒾","𝒿","𝓀","𝓁","𝓂","𝓃","ℴ","𝓅","𝓆","𝓇","𝓈","𝓉","𝓊","𝓋","𝓌","𝓍","𝓎","𝓏"],
    ["𝐚","𝐛","𝐜","𝐝","𝐞","𝐟","𝐠","𝐡","𝐢","𝐣","𝐤","𝐥","𝐦","𝐧","𝐨","𝐩","𝐪","𝐫","𝐬","𝐭","𝐮","𝐯","𝐰","𝐱","𝐲","𝐳"],
    ["𝑎","𝑏","𝑐","𝑑","𝑒","𝑓","𝑔","ℎ","𝑖","𝑗","𝑘","𝑙","𝑚","𝑛","𝑜","𝑝","𝑞","𝑟","𝑠","𝑡","𝑢","𝑣","𝑤","𝑥","𝑦","𝑧"],
    ["𝖆","𝖇","𝖈","𝖉","𝖊","𝖋","𝖌","𝖍","𝖎","𝖏","𝖐","𝖑","𝖒","𝖓","𝖔","𝖕","𝖖","𝖗","𝖘","𝖙","𝖚","𝖛","𝖜","𝖝","𝖞","𝖟"],
    ["🅰️","🅱️","©️","↩️","🆎","🎏","🌀","♓","ℹ️","🎷","🎋","👢","Ⓜ️","🎵","🅾️","🅿️","🍳","®️","💲","✝️","⛎","✅","🔱","❎","🍸","💤"],
    ["ᵃ","ᵇ","ᶜ","ᵈ","ᵉ","ᶠ","ᵍ","ʰ","ⁱ","ʲ","ᵏ","ˡ","ᵐ","ⁿ","ᵒ","ᵖ","ᑫ","ʳ","ˢ","ᵗ","ᵘ","ᵛ","ʷ","ˣ","ʸ","ᶻ"],
    ["ₐ","ᵦ","ᵢ","ⱼ","ₖ","ₗ","ₘ","ₙ","ₒ","ₚ","ᵩ","ᵣ","ₛ","ₜ","ᵤ","ᵥ","ₓ"],
    ["Ａ","Ｂ","Ｃ","Ｄ","Ｅ","Ｆ","Ｇ","Ｈ","Ｉ","Ｊ","Ｋ","Ｌ","Ｍ","Ｎ","Ｏ","Ｐ","Ｑ","Ｒ","Ｓ","Ｔ","Ｕ","Ｖ","Ｗ","Ｘ","Ｙ","Ｚ"],
    // 11–20
    ["𝓐","𝓑","𝓒","𝓓","𝓔","𝓕","𝓖","𝓗","𝓘","𝓙","𝓚","𝓛","𝓜","𝓝","𝓞","𝓟","𝓠","𝓡","𝓢","𝓣","𝓤","𝓥","𝓦","𝓧","𝓨","𝓩"],
    ["🅰","🅱","🅲","🅳","🅴","🅵","🅶","🅷","🅸","🅹","🅺","🅻","🅼","🅽","🅾","🅿","🆀","🆁","🆂","🆃","🆄","🆅","🆆","🆇","🆈","🆉"],
    ["Ⓐ","Ⓑ","Ⓒ","Ⓓ","Ⓔ","Ⓕ","Ⓖ","Ⓗ","Ⓘ","Ⓙ","Ⓚ","Ⓛ","Ⓜ","Ⓝ","Ⓞ","Ⓟ","Ⓠ","Ⓡ","Ⓢ","Ⓣ","Ⓤ","Ⓥ","Ⓦ","Ⓧ","Ⓨ","Ⓩ"],
    ["𝔄","𝔅","ℭ","𝔇","𝔈","𝔉","𝔊","ℌ","ℑ","𝔍","𝔎","𝔏","𝔐","𝔑","𝔒","𝔓","𝔔","ℜ","𝔖","𝔗","𝔘","𝔙","𝔚","𝔛","𝔜","ℨ"],
    ["Δ","β","ζ","η","θ","λ","μ","ν","ξ","σ","τ","φ","χ","ψ","ω","π","ρ","σ","τ","υ","φ","χ","ψ","ω","α","γ"],
    ["ᴀ","ʙ","ᴄ","ᴅ","ᴇ","ꜰ","ɢ","ʜ","ɪ","ᴊ","ᴋ","ʟ","ᴍ","ɴ","ᴏ","ᴘ","ǫ","ʀ","s","ᴛ","ᴜ","ᴠ","ᴡ","x","ʏ","ᴢ"],
    ["ค","๒","ς","๔","є","Ŧ","ɠ","ђ","เ","ן","к","ℓ","๓","ภ","๏","ק","๑","г","ร","t","ย","v","ฬ","x","ץ","z"],
    ["α","в","¢","∂","є","ƒ","g","н","ι","נ","к","ℓ","м","η","σ","ρ","φ","я","ѕ","т","υ","ν","ω","χ","у","z"],
    ["ค","๖","¢","໓","ē","f","ງ","h","i","ว","k","l","₥","ຖ","໐","p","q","r","Ş","t","น","ง","ຟ","x","ฯ","ຊ"],
    ["𝕬","𝕭","𝕮","𝕯","𝕰","𝕱","𝕲","𝕳","𝕴","𝕵","𝕶","𝕷","𝕸","𝕹","𝕺","𝕻","𝕼","𝕽","𝕾","𝕿","𝖀","𝖁","𝖂","𝖃","𝖄","𝖅"],
  ];

  const chosen = fontSets[(styleNum - 1) % fontSets.length];
  const base = "abcdefghijklmnopqrstuvwxyz";
  const upper = base.toUpperCase();

  let out = "";
  for (let ch of text) {
    const idx = base.indexOf(ch.toLowerCase());
    if (idx !== -1 && chosen[idx]) {
      out += ch === ch.toUpperCase() ? chosen[idx].toUpperCase() : chosen[idx];
    } else out += ch;
  }
  return out;
}