const modes = {
  نوب: [-3, 3, -3, 3, '+-', 15000],
  سهل: [-10, 10, -10, 10, '/+-', 20000],
  متوسط: [-40, 40, -20, 20, '/+-', 40000],
  صعب: [-100, 100, -70, 70, '/+-', 60000],
  صعب2: [-999999, 999999, -999999, 999999, '/', 99999],
  مستحيل: [-99999999999, 99999999999, -99999999999, 999999999999, '/', 30000],
  مستحيل2: [-999999999999999, 999999999999999, -999, 999, '/', 30000]
};

const operators = {
  '+': '+',
  '-': '-',
  '*': '×',
  '/': '÷'
};

function randomInt(from, to) {
  if (from > to) [from, to] = [to, from];
  from = Math.floor(from);
  to = Math.floor(to);
  return Math.floor((to - from) * Math.random() + from);
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function genMath(mode) {
  let [a1, a2, b1, b2, ops, time] = modes[mode];
  let a = randomInt(a1, a2);
  let b = randomInt(b1, b2);
  let op = pickRandom([...ops]);

  let result = (new Function(`return ${a} ${op.replace('/', '*')} ${b < 0 ? `(${b})` : b}`))();
  if (op == '/') [a, result] = [result, a];

  return {
    str: `${a} ${operators[op]} ${b}`,
    mode,
    time,
    result
  };
}

module.exports = {
  command: ['رياضيات'],
  category: 'ترفيه',
  description: '🧮 لعبة مسائل رياضية بمستويات مختلفة',

  async execute(sock, m, args = [], extra = {}) {
    const { usedPrefix, command } = extra;

    if (!sock.math) sock.math = {};

    // 📝 ناخد النص كامل بعد الأمر (زي أمر شات)
    const body = m.message?.extendedTextMessage?.text ||
                 m.message?.conversation || '';
    const lower = body.toLowerCase().trim();
    const parts = lower.split(/\s+/); 
    const mode = parts[1]; // الكلمة اللي بعد .رياضيات

    if (!mode) {
      return sock.sendMessage(m.key.remoteJid, {
        text: `🧮 المستويات المتوفرة:\n\n${Object.keys(modes).join(' | ')}\n\n📌 مثال: ${(usedPrefix || '.')} ${command || 'رياضيات'} متوسط`
      }, { quoted: m });
    }

    if (!(mode in modes)) {
      return sock.sendMessage(m.key.remoteJid, {
        text: `🧮 المستويات المتوفرة:\n\n${Object.keys(modes).join(' | ')}\n\n📌 مثال: ${(usedPrefix || '.')} ${command || 'رياضيات'} متوسط`
      }, { quoted: m });
    }

    let id = m.key.remoteJid;
    if (id in sock.math) {
      return sock.sendMessage(id, {
        text: '⚠️ لسه محدش جاوب على السؤال الحالي!'
      }, { quoted: sock.math[id][0] });
    }

    let math = genMath(mode);
    sock.math[id] = [
      await sock.sendMessage(id, {
        text: `▢ السؤال:\n*${math.str}* = ?\n\n⏳ الوقت: ${(math.time / 1000).toFixed(0)} ثانية`
      }, { quoted: m }),
      math,
      4,
      setTimeout(() => {
        if (sock.math[id]) {
          sock.sendMessage(id, {
            text: `⏳ الوقت انتهى!\n✅ الإجابة الصحيحة: *${math.result}*`
          }, { quoted: sock.math[id][0] });
          // ❌ مش هنمسح السؤال بعد ما يخلص
          delete sock.math[id];
        }
      }, math.time)
    ];

    // 👇 مستمع للرسائل عشان يشيك مين جاوب صح
    sock.ev.on('messages.upsert', async ({ messages }) => {
      let msg = messages[0];
      if (!msg.message || !sock.math[id]) return;

      let body = msg.message.conversation || msg.message.extendedTextMessage?.text;
      if (!body) return;

      let answer = parseFloat(body.trim());
      if (answer === sock.math[id][1].result) {
        await sock.sendMessage(id, {
          text: `🎉 مبروك! إجابتك صحيحة 👌\n✅ الحل: *${sock.math[id][1].result}*
   𝑩𝒀 𝑨𝑹𝑻𝑯𝑼𝑹⚡¦ 𝑨𝑩𝑫𝑶𝑼 卍`
        }, { quoted: msg });

        clearTimeout(sock.math[id][3]);
        // ❌ مش هنمسح السؤال هنا كمان
        delete sock.math[id];
      }
    });
  }
};