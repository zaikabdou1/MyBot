const path = require('path');

module.exports = {
  command: ['اعدام'],
  description: 'مزاح: اختيار عضو عشوائي أو بالإشارة للحكم عليه بالإعدام',
  category: 'ترفيه',
  group: true,

  async execute(sock, msg, args) {
    const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
    const participants = groupMetadata.participants.map(v => v.id);

    if (!participants || participants.length < 2) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '⚠️ مش كفاية أعضاء في الجروب لعمل حكم الإعدام 😅',
      }, { quoted: msg });
    }

    let target;

    // لو فيه منشن → هنعدم اللي اتعمله منشن
    if (msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo?.mentionedJid?.length) {
      target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
    } else {
      // اختيار عشوائي
      target = participants[Math.floor(Math.random() * participants.length)];
    }

    // الصورة من resources
    const imagePath = path.join(__dirname, '../resources/قتل.jpg');

    const text = `
*☠️ تم إصدار حكم الإعـدام ☠️*

⧉⚖️ ╎المـحكوم عليـه : @${target.split('@')[0]}
⧉🔪 ╎الـتـهـمـة : قتل متعمد ووحشي

> *☠️💀تم تأكيد إدانتك بالجريمة التي تقضي عليك بالإعدام عن جرم قتل متعمد ووحشي*`;

    await sock.sendMessage(msg.key.remoteJid, {
      image: { url: imagePath },
      caption: text,
      mentions: [target]
    }, { quoted: msg });
  }
};