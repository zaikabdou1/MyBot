// ⚡ دمج تصميم Anastasia مع أوامر Arthur
const fs = require('fs');
const path = require('path');
const { getPlugins } = require('../handlers/plugins.js');
const axios = require('axios');

module.exports = {
  status: "on",
  name: 'Bot Commands',
  command: ['اوامر'],
  category: 'tools',
  description: 'قائمة الأوامر بحسب الفئة',
  hidden: false,
  version: '3.5',

  async execute(sock, msg) {
    try {
      const zarfData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'zarf.json')));
      const body = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
      const args = body.trim().split(' ').slice(1);
      const plugins = getPlugins();
      const categories = {};

      Object.values(plugins).forEach((plugin) => {
        if (plugin.hidden) return;
        const category = plugin.category?.toLowerCase() || 'others';
        if (!categories[category]) categories[category] = [];

        const commands = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
        let commandDisplay = `- ${commands.map(cmd => `\`${cmd}\``).join(' - ')}`;
        if (plugin.description) commandDisplay += `\nالوصف: \`${plugin.description}\``;

        categories[category].push(commandDisplay + '\n');
      });

      let menu = '┏━━━━ *_𝑨𝑹𝑻𝑯𝑼𝑹 🌓_*━━━━┓\n\n';

      if (args.length === 0) {
        menu += '╭─── *الفئات المتوفرة:*\n';
        for (const cat of Object.keys(categories)) {
          menu += `│ ◦ \`${cat}\`\n`;
        }
        menu += '╰──────────────\n';
        menu += '\nاكتب `.اوامر [فئة]` لعرض أوامرها.\n';
      } else {
        const requestedCategory = args.join(' ').toLowerCase();
        if (!categories[requestedCategory]) {
          return await sock.sendMessage(msg.key.remoteJid, {
            text: `❌ الفئة *${requestedCategory}* غير موجودة.\nاكتب \`.اوامر\` لعرض الفئات.`
          }, { quoted: msg });
        }

        menu += `╭─❒ *${requestedCategory.toUpperCase()}*\n`;
        menu += categories[requestedCategory].join('\n');
        menu += '╰──\n';
      }

      menu += '\n┗━━━━ *_𝑨𝑹𝑻𝑯𝑼𝑹 🌓_*━━━━┛\n';
      menu += '\n *𝑫𝑬𝑺𝑰𝑮𝑵 𝑩𝒀 𝑨𝑩𝑫𝑶𝑼 ⚡*';

      // تحميل الصورة من الملف المحلي
      let imageBuffer = null;
      if (fs.existsSync(path.join(process.cwd(), 'image.jpeg'))) {
        imageBuffer = fs.readFileSync(path.join(process.cwd(), 'image.jpeg'));
      }

      if (imageBuffer) {
        await sock.sendMessage(msg.key.remoteJid, {
          image: imageBuffer,
          caption: menu
        }, { quoted: msg });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: menu }, { quoted: msg });
      }

    } catch (error) {
      console.error('❌ Menu Error:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '❌ حدث خطأ أثناء عرض الأوامر.'
      }, { quoted: msg });
    }
  }
};