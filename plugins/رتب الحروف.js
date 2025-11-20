const words = [
  "ناروتو", "ساسكي", "كيوبي", "شارينغان", "ميكاسا", "إيرين", "لوفي", "زورو",
  "تشوبر", "غوكو", "فيجيتا", "غون", "كيلوا", "هيسوكا", "تانجيرو", "نيزوكو",
  "سايتاما", "جينوس", "دراجون", "نيجي", "هيناتا", "شينوبو", "لاك", "يوتا", "اكاي", "رينغان", "كورومي", "مونكي"
];

const fs = require('fs');
const path = require('path');
const pointsFile = path.join(__dirname, '../data/ranks.json');
let points = {};

// تحميل النقاط من الملف إذا موجود
if (fs.existsSync(pointsFile)) {
  points = JSON.parse(fs.readFileSync(pointsFile));
}

// حفظ النقاط
function savePoints() {
  fs.writeFileSync(pointsFile, JSON.stringify(points, null, 2));
}

// دالة لتحويل النقاط للـ k
function formatPoints(num) {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

module.exports = {
  command: "رتب",
  category: "game",
  description: "لعبة ترتيب الحروف",

  async execute(sock, m) {
    const chatId = m.key.remoteJid;
    if (!chatId.endsWith('@g.us')) {
      return sock.sendMessage(chatId, { text: '❌ هذا الأمر يعمل فقط في المجموعات.' }, { quoted: m });
    }

    const randomWord = words[Math.floor(Math.random() * words.length)];
    const shuffled = randomWord.split('').sort(() => Math.random() - 0.5).join(' ');

    await sock.sendMessage(chatId, {
      text: `🔤 رتب الحروف التالية لتكون كلمة صحيحة:\n*${shuffled}*\n\n⏳ لديك 30 ثانية فقط!`
    }, { quoted: m });

    const correctAnswer = randomWord;

    const handler = async ({ messages }) => {
      const msg = messages[0];
      const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
      const from = msg.key.remoteJid;
      if (from !== chatId) return;

      if (body?.toLowerCase() === correctAnswer.toLowerCase()) {
        const sender = msg.key.participant || msg.key.remoteJid;
        const senderLid = sender.split('@')[0] + '@lid';

        if (!points[senderLid]) points[senderLid] = 0;
        points[senderLid] += 1000; // تعديل الكسب ليكون 5k
        savePoints();

        clearTimeout(timer);
        sock.ev.off('messages.upsert', handler);

        await sock.sendMessage(chatId, {
          text: `🎉 أحسنت! الكلمة هي *${correctAnswer}*\n🏆 الفائز: @${sender.split('@')[0]}\n🧮 نقاطك: *${formatPoints(points[senderLid])}*
          
    𝑩𝒀 𝑨𝑹𝑻𝑯𝑼𝑹 🌓¦ 𝑨𝑩𝑫𝑶𝑼 卍`,
          mentions: [sender]
        }, { quoted: msg });
      }
    };

    sock.ev.on('messages.upsert', handler);

    const timer = setTimeout(() => {
      sock.ev.off('messages.upsert', handler);
      sock.sendMessage(chatId, { text: `⌛ انتهى الوقت!\n❌ الكلمة كانت: *${correctAnswer}*` }, { quoted: m });
    }, 30000);
  }
};