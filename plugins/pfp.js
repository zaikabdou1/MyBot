const { extractPureNumber } = require('../haykala/elite');

module.exports = {
  command: 'ملف',
  category: 'إدارة',
  description: 'عرض معلومات الشخص أو من تم منشنه أو كتابة رقمه.',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;

    try {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      const contextParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
      const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
      const parts = text.trim().split(/\s+/);

      let target;

      // 1. منشن
      if (mentioned?.length) {
        target = mentioned[0];

      // 2. رد على شخص
      } else if (contextParticipant) {
        target = contextParticipant;

      // 3. رقم مباشر بعد الأمر
      } else if (parts[1]) {
        let rawNumber = parts[1].trim();
        // إزالة كل شيء غير رقم
        let pureNumber = rawNumber.replace(/[^\d]/g, '');

        // لو بدأ بصفر، اعتبر أنه رقم محلي وأضف رمز الدولة (مثال +963 للسوريا)
        if (pureNumber.startsWith('0')) {
          pureNumber = '963' + pureNumber.slice(1);
        }

        // لو الرقم قصير جدًا، نرفض
        if (pureNumber.length < 8) {
          return sock.sendMessage(chatId, { text: '❌ الرقم غير صالح.' }, { quoted: msg });
        }

        target = pureNumber + '@s.whatsapp.net';

      // 4. fallback = المرسل
      } else {
        target = msg.key.participant || msg.key.remoteJid;
      }

      // ====================================
      // جلب المعلومات
      let ppUrl, about, status, lastSeen;

      try {
        ppUrl = await sock.profilePictureUrl(target, "image");
      } catch {
        ppUrl = "https://i.ibb.co/7JQrJJx/avatar-contact.png";
      }

      try {
        const userInfo = await sock.fetchStatus(target);
        about = userInfo.status || "لا يوجد نبذة";
        status = userInfo.setAt ? new Date(userInfo.setAt * 1000).toLocaleString('ar-SA') : "غير متوفر";
      } catch {
        about = "لا يوجد نبذة";
        status = "غير متوفر";
      }

      try {
        lastSeen = (await sock.fetchPrivacySettings(target)).lastSeen || "مخفي";
      } catch {
        lastSeen = "مخفي";
      }

      let number = target.replace(/@s\.whatsapp\.net$/, '');

      const caption = `*『 معلومات المستخدم 』*\n\n` +
                      `📞 *الرقم:* @${number}\n` +
                      `📝 *النبذة:* ${about}\n` +
                      `⏱️ *آخر تحديث للنبذة:* ${status}\n` +
                      `👁️ *آخر ظهور:* ${lastSeen}\n\n` +
                      `👈 بواسطة: ⚡ 𝑨𝑹𝑻𝑯𝑼𝑹`;

      await sock.sendMessage(chatId, {
        image: { url: ppUrl },
        caption,
        mentions: [target]
      }, { quoted: msg });

    } catch (err) {
      console.error("خطأ أثناء تنفيذ أمر pfp:", err);
      return sock.sendMessage(chatId, {
        text: '❌ حدث خطأ أثناء جلب المعلومات، حاول لاحقًا.'
      }, { quoted: msg });
    }
  }
};