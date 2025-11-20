const characters = [
  "آكيتو", "هازوكو", "رينكو", "كازومي", "يوتارو", "شينجي", "ماكيه", "هاروتو", "كيوكا", "ميساكي",
  "رينما", "تسوكاسا", "أوكاي", "كايشي", "ميتسورو", "هاروكو", "أينو", "ساتورو", "توشيرو", "ريوكي",
  "سوميكو", "إيتارو", "كازوما", "هيناتا", "يوي", "شون", "ريوما", "كاغامي", "هاروكي", "ميسو",
  "تاكومي", "ناغي", "كوتارو", "هيسا", "رينكو", "ياماتو", "أورا", "سوكو", "تورو", "ناري",
  "كازوهيرو", "ريزو", "شينوبو", "هاروما", "كاتسومي", "ريكي", "كوروما", "إينوي", "ميسارو", "هاكارو",
  "تينما", "ريوسو", "شيرو", "يوكا", "تاكا", "مايكي", "هاروتشي", "رينجي", "كوتو", "سايكي",
  "توسو", "هيساكو", "رينكوما", "كازوكي", "ميها", "شيمورا", "يوهارو", "كاتارو", "نوبو", "تايتو",
  "كازوميكي", "ميسوتا", "هارومي", "ريوه", "توشيروما", "كايتو", "شينسو", "يوهيا", "تاكي", "هاروتوما",
  "رينكويو", "كازوماكي", "شينيا", "ميسوتاكو", "يوهاري", "هاروكومي", "تاكاهيرو", "رينسو", "كوتاروما", "ميساكو",
  "هارويا", "ريوكو", "شينسوما", "يوكاري", "كازوميها", "هاروتا", "ميساروما", "رينكا", "توشي", "هيساكي"
];

const fs = require('fs');
const path = require('path');
const pointsFile = path.join(__dirname, '../data/ranks.json');
let points = {};

// تحميل النقاط من الملف
if (fs.existsSync(pointsFile)) {
  points = JSON.parse(fs.readFileSync(pointsFile));
}

// دالة لحفظ النقاط فورًا
function savePoints() {
  fs.writeFileSync(pointsFile, JSON.stringify(points, null, 2));
}

// دالة لإضافة نقاط بطريقة آمنة
function addPoints(lid, amount) {
  if (!points[lid]) points[lid] = 0;
  points[lid] += amount;
  savePoints();
  return points[lid];
}

// دالة لتنسيق النقاط بصيغة K
function formatPoints(num) {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

module.exports = {
  command: 'كتابه',
  category: 'games',
  description: 'فعالية: من يكتب اسم الشخصية أولاً يفوز!',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;

    // اختيار شخصية عشوائية
    const selected = characters[Math.floor(Math.random() * characters.length)];

    await sock.sendMessage(chatId, {
      text: `🎮 *فعالية النسخ!*\n\n🧠 أول واحد يكتب اسم الشخصية التالية بشكل صحيح يفوز:\n\n🔤 *"${selected}"*\n\n⏱️ لديك *10 ثواني* فقط، انطلق!`,
    }, { quoted: msg });

    let answered = false;

    const handler = async ({ messages }) => {
      const reply = messages[0];
      const replyFrom = reply.key.remoteJid;
      const participant = reply.key.participant || reply.key.remoteJid;

      if (
        replyFrom === chatId &&
        !reply.key.fromMe &&
        !answered
      ) {
        const body = reply.message?.conversation || reply.message?.extendedTextMessage?.text;
        if (body && body.trim() === selected) {
          answered = true; // منع أي رد آخر قبل اكتمال النقاط

          // إضافة 1000 نقطة مباشرة
          const winnerLid = participant.split('@')[0] + '@lid';
          const newPoints = addPoints(winnerLid, 1000);

          await sock.sendMessage(chatId, {
            text: `ــــ @${participant.split('@')[0]} ــــ
*🏆 أولاً كتب الاسم الصحيح!*
*🎉 الفوز مبروك 🎉*
🏅 نقاطك الجديدة: *${formatPoints(newPoints)}*`,
            mentions: [participant],
          }, { quoted: reply });

          sock.ev.off('messages.upsert', handler); // وقف الاستماع فورًا
        }
      }
    };

    sock.ev.on('messages.upsert', handler);

    setTimeout(() => {
      if (!answered) {
        sock.sendMessage(chatId, {
          text: `❌ انتهى الوقت!\nالاسم الصحيح كان: *"${selected}"*`,
        }, { quoted: msg });
        sock.ev.off('messages.upsert', handler);
      }
    }, 10000); // 10 ثواني فقط
  }
};