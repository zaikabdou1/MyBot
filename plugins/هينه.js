const { eliteNumbers } = require('../haykala/elite.js');
const { jidDecode } = require('@whiskeysockets/baileys');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

const insults = [
  "يا عديم الفائدة، حتى الظل يهرب منك! 🕳️",
  "ذكاءك ضايع بين السطور، حتى جوجل ما يلقاك! 🤦‍♂️",
  "يا وجه النحس، حتى الحظ يتهرب منك! 💀",
  "كل ما تتكلم، الذكاء ينقص في العالم! 🌎⬇️",
  "وجودك مثل الواي فاي الضعيف، يرفع الضغط بس! 📶😤",
  "يا ثقيل الدم، حتى الصبر زهق منك! 🐌",
  "يا وجه النكد، حتى الشمس تغيب لو شافتك! 🌥️",
  "من كثر غبائك، لو دخلت اختبار صبر، بتخسر من أول ثانية! ⏱️🤯",
  "حتى الكيبورد يرفض يكتب اسمك من القهر! ⌨️😒",
  "يا نكبة، وجودك لحاله Bug في النظام! 🪲💻",
  "ذكاءك أقل من شحن بطارية 1%! 🔋🤡",
  "يا عالة على البشرية، حتى الآلة الحاسبة تتحير فيك! 🧮❓",
  "من كثر ما تفلسف، الهواء نفسه تعب من سماعك! 💨🙄",
  "يا مسخرة الكون، حتى الصمت يستحي منك! 🤫😂",
  "لو كان في مسابقة أغبى شخص، بتفوز بدون منافسة! 🏆🤪"
];

module.exports = {
  command: 'هينه',
  description: 'يرسل إهانة عشوائية لمن ترد عليه أو تذكره بالمنشن',
  usage: '.هينه (بالرد أو المنشن)',
  category: 'تسلية',

  async execute(sock, msg) {
    try {
      const groupJid = msg.key.remoteJid;

      // يعمل فقط داخل المجموعات
      if (!groupJid.endsWith('@g.us')) {
        return await sock.sendMessage(groupJid, { text: '❗ هذا الأمر يعمل فقط داخل المجموعات.' }, { quoted: msg });
      }

      // فك شفرة المُرسل (يسمح للجميع)
      const sender = decode(msg.key.participant || msg.key.remoteJid);

      // تحديد الهدف (الشخص اللي نرد عليه أو نمنشنه)
      let targetJid = null;

      // لو المستخدم ردّ على رسالة
      if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
        targetJid = msg.message.extendedTextMessage.contextInfo.participant;
      }
      // أو كتب منشن في الرسالة
      else if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
      }
      // أو كتب @رقم في النص
      else if (msg.message?.conversation && extractMentionedUser(msg.message.conversation)) {
        targetJid = extractMentionedUser(msg.message.conversation);
      }

      // لو ما فيه هدف محدد
      if (!targetJid) {
        return await sock.sendMessage(groupJid, { text: '❗ يرجى الرد على شخص أو منشنه بالأمر.' }, { quoted: msg });
      }

      // اختار إهانة عشوائية
      const insult = insults[Math.floor(Math.random() * insults.length)];

      // أرسل الرسالة مع منشن للهدف
      await sock.sendMessage(groupJid, {
        text: `@${targetJid.split('@')[0]} ${insult}`,
        mentions: [targetJid]
      }, { quoted: msg });

    } catch (err) {
      console.error('❌ خطأ في أمر هينه:', err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ حدث خطأ أثناء تنفيذ الأمر:\n${err.message}`
      }, { quoted: msg });
    }
  }
};

// دالة لاستخراج المنشن من النص (مثل @213...)
function extractMentionedUser(text) {
  const match = text.match(/@(\d+)/);
  return match ? `${match[1]}@s.whatsapp.net` : null;
}