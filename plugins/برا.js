const { eliteNumbers } = require('../haykala/elite.js'); // نخبة من الملف

module.exports = {
  command: 'برا',
  description: 'يطرد العضو من الجروب (النخبة فقط)',
  category: 'admin',
  usage: '.برا @ أو بالرد على رسالة',

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0];

    // نخبة البوت من الملف
    const elite = eliteNumbers;

    // هذه الأرقام فقط تقدر تطرد النخبة — ثابتة داخل الكود
    const allowedToKickElite = [
      "227552333414482",
      "104806312050733",
      "71906778738931",
      "44178721526009"
      // زيد إذا تحتاج
    ];

    // لازم يكون داخل جروب
    if (!jid.endsWith('@g.us')) {
      return sock.sendMessage(jid, { text: 'هذا الأمر يعمل داخل الجروبات فقط.' }, { quoted: msg });
    }

    // بس النخبة تستعمل الأمر
    if (!elite.includes(sender)) {
      return sock.sendMessage(jid, { text: 'هذا الأمر مخصص للنخبة فقط.' }, { quoted: msg });
    }

    // تحديد الهدف
    const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    const reply = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const target = (mention?.[0] || reply);

    if (!target) {
      return sock.sendMessage(jid, { text: 'منشن الشخص أو رد عليه للطرد.' }, { quoted: msg });
    }

    const targetNum = target.split('@')[0];

    // منع النخبة من طرد النخبة (إلا المسموح)
    if (elite.includes(targetNum) && !allowedToKickElite.includes(sender)) {
      return sock.sendMessage(jid, {
        text: 'محاولة طرد نخبة؟ ما تقدر 😎'
      }, { quoted: msg });
    }

    // تنفيذ الطرد
    try {
      await sock.groupParticipantsUpdate(jid, [target], 'remove');
      await sock.sendMessage(jid, { text: 'تم طرد الرقاصة 👋' });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: 'البوت ما عنده صلاحيات كافية.'
      }, { quoted: msg });
    }
  }
};