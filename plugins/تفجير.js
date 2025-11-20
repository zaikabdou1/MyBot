// plugins/تفجير.js
/**
 * أمر: تفجير
 * الوصف: يرسل رسائل متتالية (دز) في الخاص للشخص الذي رُدّت عليه أو تم منشنه.
 * المسار: plugins/تفجير.js
 * ملاحظة: مقيّد للاستخدام فقط من 3 أرقام محددة.
 */

const path = require('path');

// محاولة استدعاء ملف النخبة لو موجود (لكن لن نستخدمه الآن)
let eliteData = {};
try {
  eliteData = require(path.join(__dirname, '..', 'haykala', 'elite.js'));
} catch (e) {
  // لا مشكلة إن لم يوجد الملف
  // console.warn('[تفجير] لم أتمكن من تحميل haykala/elite.js:', e.message || e);
}

// مساعدة لتطبيع الأرقام (نحذف الجزء @... لو موجود)
const normalizeNumber = (s) => String(s || '').replace(/@.*$/, '').replace(/\D+/g, '');

// مجموعة الأرقام المسموح لها (3 أرقام فقط)
const allowedNumbers = new Set([
  '213773231685',
  '104806312050733',
  '71906778738931',
  '257977932095736',
  '227552333414482'
]);

const ensureJid = raw => {
  if (!raw) return null;
  if (raw.includes('@')) return raw;
  return `${raw}@s.whatsapp.net`;
};

module.exports = {
  command: 'تفجير',
  description: 'يرسل عدد من الدزات في الخاص للشخص الذي رُدّت عليه أو تم منشنه. (خاص بثلاثة أرقام فقط)',
  usage: 'تفجير <عدد؟>  — مثال: .تفجير 50  أو .تفجير  (الافتراضي 100)',
  category: 'النخبة',

  async execute(sock, msg, args = []) {
    try {
      const groupJid = msg.key.remoteJid;
      // يعمل فقط داخل المجموعات
      if (!groupJid || !groupJid.endsWith('@g.us')) {
        return await sock.sendMessage(msg.key.remoteJid || (msg.key.participant || msg.key.remoteJid), {
          text: '⚠️ هذا الأمر يعمل داخل المجموعات فقط.',
          quoted: msg,
        });
      }

      // من نفّذ الأمر
      const invokerRaw = msg.key.participant || msg.key.remoteJid || '';
      const invokerNumber = normalizeNumber(invokerRaw);

      // تحقق من الثلاثة أرقام المسموح لها
      if (!allowedNumbers.has(invokerNumber)) {
        console.log(`🚫 محاولة غير مصرح بها من الرقم: ${invokerNumber}`);
        return await sock.sendMessage(groupJid, {
          text: '🚫 هذا الأمر مخصص فقط لثلاثة أرقام محددة.',
          quoted: msg,
        });
      }

      // استخرج الـ context بمرونة (دعم لعدة تراكيب)
      const ctx1 = msg.message?.extendedTextMessage?.contextInfo;
      const ctx2 = msg.message?.contextInfo;
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message?.quoted;
      // محاولة الحصول على الـ participant أو mentioned
      let target = (ctx1 && ctx1.participant) || (ctx2 && ctx2.participant) || null;
      if (!target) {
        const mentioned = (ctx1 && ctx1.mentionedJid) || (ctx2 && ctx2.mentionedJid) || null;
        if (Array.isArray(mentioned) && mentioned.length) target = mentioned[0];
      }
      // بعض النسخ تستخدم quoted?.sender أو quoted?.participant
      if (!target && msg.message?.quoted?.sender) target = msg.message.quoted.sender;
      if (!target && msg.message?.quoted?.participant) target = msg.message.quoted.participant;

      if (!target) {
        return await sock.sendMessage(groupJid, {
          text: '❗ منشن الشخص أو رد على رسالته أولاً حتى أقدر أرسل له في الخاص.',
          quoted: msg,
        });
      }

      const targetJid = ensureJid(target);
      if (!targetJid) {
        return await sock.sendMessage(groupJid, {
          text: '❌ لم أتمكن من تحديد صاحب الرسالة المستهدف.',
          quoted: msg,
        });
      }

      // عدد الرسائل: افتراضي 100، يمكن تغيير عبر الوسيط الأول، وحد أقصى 300
      const requested = parseInt(args[0]) || 100;
      const COUNT = Math.min(Math.max(1, requested), 300);

      // تأكيد البدء في القروب
      await sock.sendMessage(groupJid, {
        text: `⏳ جاري إرسال ${COUNT} رسالة خاصة إلى @${targetJid.split('@')[0]}...`,
        mentions: [targetJid],
        quoted: msg,
      });

      // إرسال الرسائل بالتتابع مع تأخير لحماية الحساب
      const DELAY_MS = 350; // يمكنك زيادة التأخير إن كنت تخاف من حظر
      for (let i = 1; i <= COUNT; i++) {
        try {
          await sock.sendMessage(targetJid, { text: `*على الدوام يلا* 😖 ${i}/${COUNT}` });
        } catch (sendErr) {
          console.error('[تفجير] فشل إرسال رسالة رقم', i, 'إلى', targetJid, sendErr?.message || sendErr);
          // نتابع حتى لو فشل إرسال رسالة واحدة
        }
        await new Promise(r => setTimeout(r, DELAY_MS));
      }

      // تأكيد في القروب
      await sock.sendMessage(groupJid, {
        text: `✅ انتهى: تم إرسال ${COUNT} رسالة خاصة إلى @${targetJid.split('@')[0]}.`,
        mentions: [targetJid],
        quoted: msg,
      });

    } catch (err) {
      console.error('[تفجير] خطأ عام:', err);
      try {
        await sock.sendMessage(msg.key.remoteJid, { text: '❌ حدث خطأ أثناء تنفيذ الأمر.' , quoted: msg});
      } catch (_) {}
    }
  }
};