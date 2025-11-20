const fs = require('fs');
const path = require('path');

module.exports = {
  command: 'تست',
  description: 'اختبار قوة 𝐀𝐑𝐓𝐇𝐔𝐑',
  usage: '.تست',
  category: '𝕯𝖊𝖒𝖔𝖓 𝕿𝖔𝖔𝖑𝖘',

  async execute(sock, msg) {
    try {
      const demonicText = `
╭─❖ 『𝑨𝑹𝑻𝑯𝑼𝑹 🌓』 ❖─╮
│🌙 *𝑾𝑯𝑬𝑹𝑬 𝑷𝑶𝑾𝑬𝑹 𝑯𝑰𝑫𝑬𝑺*
│ *𝑨𝑹𝑻𝑯𝑼𝑹 𝑹𝑰𝑺𝑬𝑺* 🌪️
│ *𝑻𝑯𝑬 𝑺𝑯𝑨𝑫𝑶𝑾 𝒀𝑶𝑼 𝑭𝑬𝑬𝑳*
│ *𝑩𝑼𝑻 𝑵𝑬𝑽𝑬𝑹 𝑺𝑬𝑬* 🖤╰────────────────╯`;

      const imagePath = path.join(__dirname, '../image.jpeg');
      const hasImage = fs.existsSync(imagePath);
      const imageBuffer = hasImage ? fs.readFileSync(imagePath) : null;

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: demonicText,
          contextInfo: {
            externalAdReply: {
              title: "𖤐 𝑨𝑹𝑻𝑯𝑼𝑹'𝒔 𝑹𝑬𝑰𝑮𝑵 𖤐",
              body: "𝐓𝐇𝐄 𝐒𝐓𝐎𝐑𝐌 𝐇𝐀𝐒 𝐀𝐖𝐀𝐊𝐄𝐍𝐄𝐃 ⚡",
              thumbnail: imageBuffer,
              mediaType: 1,
              sourceUrl: "n",
              renderLargerThumbnail: true,
              showAdAttribution: false
            }
          }
        },
        { quoted: msg }
      );

    } catch (err) {
      const errorDesign = `
╭─⚡| 𝑨𝑹𝑻𝑯𝑼𝑹'𝒔 𝑾𝑹𝑨𝑻𝑯 |⚡─╮
│
│ *« 𝐄𝐑𝐑𝐎𝐑 »* 
│ ${err.message || '𝐔𝐍𝐊𝐍𝐎𝐖𝐍 𝐅𝐎𝐑𝐂𝐄 𝐑𝐄𝐋𝐄𝐀𝐒𝐄𝐃'}
│
╰─────────────⚔️────────╯`;

      await sock.sendMessage(msg.key.remoteJid, {
        text: errorDesign
      }, { quoted: msg });
    }
  }
};