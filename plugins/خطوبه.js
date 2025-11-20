const fs = require('fs');
const path = require('path');

module.exports = {
  command: ['خطوبه'],
  description: 'مزاح: اعلان خطوبة بين عضوين عشوائيين 💍',
  category: 'ترفيه',
  usage: '.خطوبه',
  group: true,

  async execute(sock, msg) {
    const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
    const ps = groupMetadata.participants.map(v => v.id);

    if (ps.length < 2) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '⚠️ لازم يكون في عضوين على الأقل عشان نعلن الخطوبة! 😅',
      }, { quoted: msg });
    }

    const a = ps[Math.floor(Math.random() * ps.length)];
    let b;
    do {
      b = ps[Math.floor(Math.random() * ps.length)];
    } while (b === a);

    const senderJid = msg.key?.participant || msg.participant || msg.sender;
    const sender = senderJid.split('@')[0];
    const targetA = a.split('@')[0];
    const targetB = b.split('@')[0];

    // هنا الصورة المحلية
    const imagePath = path.join(__dirname, '..', 'resources', 'خطوبه.jpg');

    const text = `
*🧬 اعــلان خــطــوبــه 🧬*

👑 الشاهد: @${sender}
❯💗 ╎الـخــاطــب : @${targetA}
❯🥹 ╎الــمـخـطــوبــه : @${targetB}

💌 متنسوش تعزمونا علي الفرح 🎉
>𝑩𝒀 𝑨𝑹𝑻𝑯𝑼𝑹 🌓¦ 𝑨𝑩𝑫𝑶𝑼 卍
`;

    await sock.sendMessage(msg.key.remoteJid, {
      image: fs.readFileSync(imagePath),
      caption: text,
      mentions: [senderJid, a, b] // زي المعاهده بالظبط
    }, { quoted: msg });
  }
};