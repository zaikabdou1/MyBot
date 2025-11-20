const fs = require("fs");
const path = require("path");

// ====================================================================
// شخصيات بوصف أسهل
// ====================================================================
const characters = [
  { name: "لوفي", hints: ["يتمدد", "قبعة قش", "من ون بيس"] },
  { name: "زورو", hints: ["ثلاث سيوف", "أخضر الشعر", "من ون بيس"] },
  { name: "غوكو", hints: ["شعره يقف", "سايان", "دراغون بول"] },
  { name: "ناروتو", hints: ["هوكاجي", "كوراما", "نينجا"] },
  { name: "ساسكي", hints: ["شارينغان", "رفيق بطل القصة", "من ناروتو"] },
  { name: "ميكاسا", hints: ["سيوف", "تحمي إيرين دائماً", "هجوم العمالقة"] },
  { name: "إيرين", hints: ["حرية", "يتحول لعملاق", "هجوم العمالقة"] },
  { name: "تانجيرو", hints: ["سياف", "رائحة قوية", "قاتل الشياطين"] },
  { name: "غون", hints: ["صنارة", "قوي رغم صغر سنه", "هنتر x هنتر"] },
  { name: "كيلوا", hints: ["سرعة", "من عائلة قتلة", "هنتر x هنتر"] },
];

// ====================================================================
// ملف الرصيد
// ====================================================================
const pointsFile = path.join(__dirname, '../data/ranks.json');
let points = {};

if (fs.existsSync(pointsFile)) {
  points = JSON.parse(fs.readFileSync(pointsFile));
}

function savePoints() {
  fs.writeFileSync(pointsFile, JSON.stringify(points, null, 2));
}

function formatK(num) {
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

// خلط عشوائي
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// ====================================================================
// اللعبة
// ====================================================================
module.exports = {
  command: "تخمين",
  category: "game",
  description: "لعبة تخمين شخصية أنمي",

  async execute(sock, m) {
    const chatId = m.key.remoteJid;

    if (!chatId.endsWith('@g.us')) {
      return sock.sendMessage(chatId, { text: '❌ هذا الأمر يعمل فقط في المجموعات.' }, { quoted: m });
    }

    const character = characters[Math.floor(Math.random() * characters.length)];
    const correctAnswer = character.name;

    await sock.sendMessage(chatId, {
      text: `🎮 بدأت لعبة التخمين!\n⏳ تلميح جديد كل *20 ثانية*.\nاكتب اسم الشخصية للفوز بالرصيد!`
    }, { quoted: m });

    const shuffledHints = shuffleArray([...character.hints]);
    let hintIndex = 0;
    let hintTimer;

    // الجوائز: 3k → 2k → 1k
    const rewards = [3000, 2000, 1000];
    let reward = rewards[0];

    const sendHint = async () => {
      if (hintIndex < shuffledHints.length) {
        reward = rewards[hintIndex] || 100;

        await sock.sendMessage(chatId, {
          text: `💡 التلميح ${hintIndex + 1}: ${shuffledHints[hintIndex]}\n💰 الجائزة: ${formatK(reward)} رصيد`
        });

        hintIndex++;
        hintTimer = setTimeout(sendHint, 20000); // 20 ثانية
      } else {
        sock.ev.off('messages.upsert', handler);
        await sock.sendMessage(chatId, {
          text: `⌛ انتهى الوقت!\n❌ الشخصية كانت: *${correctAnswer}*`
        }, { quoted: m });
      }
    };

    const handler = async ({ messages }) => {
      const msg = messages[0];
      const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
      const from = msg.key.remoteJid;
      if (from !== chatId) return;

      if (body?.toLowerCase() === correctAnswer.toLowerCase()) {
        const sender = msg.key.participant || msg.key.remoteJid;

        if (!points[sender]) points[sender] = 0;
        points[sender] += reward;
        savePoints();

        clearTimeout(hintTimer);
        sock.ev.off('messages.upsert', handler);

        await sock.sendMessage(chatId, {
          text: `🎉 صحيح! الشخصية هي *${correctAnswer}*\n🏆 الفائز: @${sender.split('@')[0]}\n💰 رصيدك الآن: *${formatK(points[sender])}* (+${formatK(reward)})`,
          mentions: [sender]
        }, { quoted: msg });
      }
    };

    sock.ev.on('messages.upsert', handler);
    sendHint();
  }
};