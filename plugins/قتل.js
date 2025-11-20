const path = require('path');

module.exports = {
  command: ['قتل'],
  description: 'مزاح: اختيار قتـل عضو عشوائي في الجروب',
  category: 'ترفيه',
  group: true,

  async execute(sock, msg) {
    const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
    const participants = groupMetadata.participants.map(v => v.id);

    if (participants.length < 2) {
      return sock.sendMessage(msg.key.remoteJid, {
        text: '⚠️ مش كفاية أعضاء في الجروب لعمل الجريمة 😅',
      }, { quoted: msg });
    }

    // اختيار القاتل والضحية عشوائيًا
    let a = participants[Math.floor(Math.random() * participants.length)];
    let b;
    do {
      b = participants[Math.floor(Math.random() * participants.length)];
    } while (b === a);

    // الصورة من resources
    const imagePath = path.join(__dirname, '../resources/قتل.jpg');

    const text = `
*🧬 تـم الـإعـلان عـن جـريـمـة 🧬*

⧉🔪 ╎الـقـاتـل : @${a.split('@')[0]}
⧉⚰️ ╎الـمـقـتـول : @${b.split('@')[0]}
تـم الـقـبـض عـلـى الـمُـجـرم ⛓️

> 𝑩𝒚 𝑨𝑹𝑻𝑯𝑼𝑹 🌓¦ 𝑨𝑩𝑫𝑶𝑼卍`;

    await sock.sendMessage(msg.key.remoteJid, {
      image: { url: imagePath }, // الصورة من المجلد
      caption: text,
      mentions: [a, b] // زي معاهده
    }, { quoted: msg });
  }
};