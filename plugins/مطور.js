const path = require('path');
const fs = require('fs');

module.exports = {
  name: 'مطور',
  command: ['مطور'],
  category: 'عام',
  description: 'إرسال معلومات المطور وتعليمات التواصل.',
  args: [],
  hidden: false,

  async execute(sock, msg) {
    try {
      const developerNumber1 = '213540419314@s.whatsapp.net';
      const developerEmail = 'zaikabdo754@gmail.com';

      const vcard1 = `BEGIN:VCARD
VERSION:3.0
FN:𝑨𝑹𝑻𝑯𝑼𝑹 🌓
TEL;waid=213540419314:+213540419314
END:VCARD`;

      const vcard2 = `BEGIN:VCARD
VERSION:3.0
FN:𝑴𝑰𝑲𝑨𝑺𝑨 ⚡
TEL;waid=12267986773:+12267986773
EMAIL:${developerEmail}
NOTE:الرقم ليس بوت، لو كتبت أوامر بيعطيك بلوك 🦈
END:VCARD`;

      // إرسال جهتي الاتصال دفعة واحدة
      await sock.sendMessage(msg.key.remoteJid, {
        contacts: {
          displayName: "𝑨𝑩𝑫𝑶𝑼 🌙",
          contacts: [
            { vcard: vcard1 },
            { vcard: vcard2 }
          ]
        }
      }, { quoted: msg });

      const instructionsText = `┃ مرحباً بك، هذا هو المطورد ↯↯

> *تعليمات قبل الدخول إليه لتجنب الحظر منه، الرجاء قراءتها قبل الدخول إليه*

> \`1 - الدخول للأسباب المهمة فقط\`
> \`2 - أرسل رسالة واحدة فيها كل ما يلزمك\`
> \`3 - ممنوع الدخول لأسباب تافهة\``;

      const thumbnailPath = path.join(__dirname, 'image.jpeg');
      const thumbnailBuffer = fs.existsSync(thumbnailPath) ? fs.readFileSync(thumbnailPath) : null;

      await sock.sendMessage(msg.key.remoteJid, {
        text: instructionsText,
        contextInfo: {
          externalAdReply: {
            title: 'مطور البوت',
            body: 'اضغط هنا لزيارة الدعم',
            thumbnail: thumbnailBuffer,
            mediaUrl: '',
          }
        }
      }, { quoted: msg });

    } catch (error) {
      console.error('❌ خطأ أثناء تنفيذ أمر مطور:', error);
    }
  }
};