const fs = require('fs');
const { join } = require('path');

// ✅ تعريف بيانات المطور (داخل الملف فقط)
global.owner = [
  ['213540419314', '𝑨𝑩𝑫𝑶𝑼 🌙', true],
];

module.exports = {
  command: 'المطور',
  description: 'عرض معلومات المطور مع جهة الاتصال',
  usage: '.المطور',
  category: 'info',

  async execute(sock, msg) {
    try {
      const chatId = msg.key.remoteJid;

      // بيانات المطور
      const [devId, devName] = global.owner[0];
      const devTitle = '*𝑨𝑩𝑫𝑶𝑼 🌙*';
      const devCountry = '*𝑨𝑳𝑮𝑬𝑹𝑰𝑨* 🇩🇿';
      const devAge = '19 ⚡ ';
      const devNumber = `${devId}`;
      const waLink = `https://wa.me/${devId}`;
      const devVideoPath = join(process.cwd(), '𝑨𝑹𝑻𝑯𝑼𝑹.mp4');

      // الرسالة النصية
      const infoMessage = `
*𝑨𝑹𝑻𝑯𝑼𝑹_𝑰𝑵𝑭𝑶* ─────────

『 *_الاسم :_* ${devTitle} 』
『 *_اللقب :_* *𝑨𝑹𝑻𝑯𝑼𝑹 🌓* 』
『 *_الدولة :_* ${devCountry} 』
『 *_العمر :_* ${devAge} 』
『 *_الرقم :_* ${devNumber} 』

      `.trim();

      // زر واتساب داخل نفس الرسالة
      const buttons = [
        {
          index: 0,
          urlButton: {
            displayText: '𝑺𝒆𝒏𝒅 𝑻𝒐 𝑴𝒆 ⚡',
            url: waLink,
          },
        }
      ];

      // إرسال الرسالة (فيديو أو نص)
      if (fs.existsSync(devVideoPath)) {
        const videoBuffer = fs.readFileSync(devVideoPath);
        await sock.sendMessage(chatId, {
          video: videoBuffer,
          caption: infoMessage,
          footer: '𝑨𝑹𝑻𝑯𝑼𝑹 🌓',
          buttons: buttons,
          headerType: 5
        }, { quoted: msg });
      } else {
        await sock.sendMessage(chatId, {
          text: infoMessage,
          footer: '𝑨𝑹𝑻𝑯𝑼𝑹 🌓',
          buttons: buttons,
          headerType: 1
        }, { quoted: msg });
      }

      // ✅ إرسال جهة الاتصال (vCard)
      const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:𝑨𝑩𝑫𝑶𝑼 🌓
TEL;type=CELL;type=VOICE;waid=213540419314:+213540419314
EMAIL:𝒛𝒂𝒊𝒌𝒂𝒃𝒅𝒐𝒖754@𝒈𝒎𝒂𝒊𝒍.𝒄𝒐𝒎
NOTE:هذا رقم شخصي، لا ترسل أوامر!
END:VCARD
      `.trim();

      await sock.sendMessage(chatId, {
        contacts: {
          displayName: '𝑨𝑹𝑻𝑯𝑼𝑹 🌓',
          contacts: [{ vcard }]
        }
      }, { quoted: msg });

    } catch (err) {
      console.error('❌ خطأ في أمر المطور:', err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ حدث خطأ أثناء عرض معلومات المطور:\n${err.message || err.toString()}`,
      }, { quoted: msg });
    }
  },
};