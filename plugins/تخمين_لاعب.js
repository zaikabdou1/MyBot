const fs = require("fs");
const path = require("path");

// ====================================================================
// دالة تحويل الرقم إلى K و M
// ====================================================================
function formatKM(num) {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

// ====================================================================
// قائمة اللاعبين مع تلميحات دقيقة
// ====================================================================
const players = [
  {
    name: "ميسي",
    hints: [
      "🐐 لاعب يعتبره الكثير أفضل من لمس الكرة",
      "🎯 تمريرات ساحرة ولمسة خرافية",
      "🏟️ يلعب لنادي إنتر ميامي"
    ]
  },
  {
    name: "رونالدو",
    hints: [
      "⚡ أقوى بدنياً وأسرع من الرصاص",
      "🎯 الهداف التاريخي لدوري الأبطال",
      "🏟️ محترف في النصر السعودي"
    ]
  },
  {
    name: "صلاح",
    hints: [
      "⚡ ملك السرعة في إنجلترا",
      "🎯 هداف ليفربول الأول",
      "🇪🇬 فرعون مصر"
    ]
  },
  {
    name: "نيمار",
    hints: [
      "🎭 مهاري واستعراضي بشكل جنوني",
      "⚡ يحب المراوغات واللمسات الخفيفة",
      "🏟️ يلعب للهلال السعودي"
    ]
  },
  {
    name: "هالاند",
    hints: [
      "🦾 ماكينة تسجيل أهداف",
      "❄️ وجه جامد… ما يبتسم إلا بعد هدف",
      "🏟️ نجم مانشستر سيتي"
    ]
  },
  {
    name: "دي بروين",
    hints: [
      "🎯 ملك صناعة اللعب",
      "⚡ تمريراته تشق الجدار",
      "🇧🇪 نجم منتخب بلجيكا"
    ]
  },
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

// خلط عشوائي
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// ====================================================================
// اللعبة
// ====================================================================
module.exports = {
  command: "لاعب",
  category: "game",
  description: "لعبة تخمين لاعب كرة قدم مع تلميحات كل 30 ثانية",

  async execute(sock, m) {
    const chatId = m.key.remoteJid;
    if (!chatId.endsWith('@g.us')) {
      return sock.sendMessage(chatId, { text: '❌ هذا الأمر يعمل فقط في المجموعات.' }, { quoted: m });
    }

    // اختيار لاعب عشوائي
    const player = players[Math.floor(Math.random() * players.length)];
    const correctAnswer = player.name;

    await sock.sendMessage(chatId, {
      text: `⚽ بدأت لعبة تخمين اللاعب!\n⏳ تلميح جديد كل 30 ثانية.\n💰 الجوائز: 3K – 2K – 1K`
    }, { quoted: m });

    const shuffledHints = shuffleArray([...player.hints]);
    let hintIndex = 0;
    let hintTimer;

    // الجوائز: 3K – 2K – 1K
    const rewards = [3000, 2000, 1000];
    let reward = rewards[0];

    const sendHint = async () => {
      if (hintIndex < shuffledHints.length) {
        reward = rewards[hintIndex] || 1000;

        await sock.sendMessage(chatId, {
          text: `💡 التلميح ${hintIndex + 1}:\n${shuffledHints[hintIndex]}\n\n💰 الجائزة: *${formatKM(reward)}*`
        });

        hintIndex++;
        hintTimer = setTimeout(sendHint, 30000);

      } else {
        sock.ev.off('messages.upsert', handler);
        await sock.sendMessage(chatId, { 
          text: `⌛ انتهى الوقت!\n🙁 اللاعب كان: *${correctAnswer}*`
        }, { quoted: m });
      }
    };

    const handler = async ({ messages }) => {
      const msg = messages[0];
      const body =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text;

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
          text:
            `🎉 إجابة صحيحة!\n` +
            `👤 اللاعب: *${correctAnswer}*\n` +
            `🏆 الفائز: @${sender.split('@')[0]}\n` +
            `💰 رصيدك الآن: *${formatKM(points[sender])}* (+${formatKM(reward)})`,
          mentions: [sender]
        }, { quoted: msg });
      }
    };

    sock.ev.on('messages.upsert', handler);

    sendHint();
  }
};