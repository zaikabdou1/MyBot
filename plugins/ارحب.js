module.exports = {
  command: 'ارحب',
  desc: 'يرحب بعضو باستخدام منشن أو رقم مع لقبه',
  usage: '.ارحب @العضو أو رقمه لقبه',
  group: true,

  async execute(sock, msg) {
    try {
      const args = msg.args || [];
      const contextInfo = msg.message?.extendedTextMessage?.contextInfo || {};
      const mentioned = contextInfo.mentionedJid || msg.mentionedJid || [];

      if (!Array.isArray(args) || args.length < 2) {
        return await sock.sendMessage(msg.key.remoteJid, {
          text: '❗ الاستخدام: .ارحب @العضو أو رقمه لقبه\nمثال: .ارحب @123456789 زورو أو .ارحب 201065826587 زورو',
        }, { quoted: msg });
      }

      let targetJid;

      if (mentioned.length > 0) {
        targetJid = mentioned[0];
      } else if (/^\d{8,15}$/.test(args[0])) {
        targetJid = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      } else {
        return await sock.sendMessage(msg.key.remoteJid, {
          text: '❗ لم يتم العثور على العضو. تأكد من عمل منشن أو إدخال رقم صحيح.',
        }, { quoted: msg });
      }

      const nickname = args.slice(1).join(' ');
      const username = targetJid.split('@')[0];

      // جلب اسم وصورة الجروب
      let groupName = 'المجموعة';
      let groupPfp = 'https://telegra.ph/file/22c42dbad294ef3ee1a37.jpg'; // احتياطي
      if (msg.key.remoteJid.endsWith('@g.us')) {
        try {
          const metadata = await sock.groupMetadata(msg.key.remoteJid);
          groupName = metadata.subject || groupName;
          try {
            groupPfp = await sock.profilePictureUrl(msg.key.remoteJid, 'image');
          } catch {
            // تجاهل الخطأ، نستخدم الصورة الاحتياطية
          }
        } catch (e) {
          console.log("⚠️ فشل في جلب بيانات الجروب:", e.message);
        }
      }

      // جلب صورة المستخدم أو fallback لصورة القروب
      let userPfp;
      try {
        userPfp = await sock.profilePictureUrl(targetJid, 'image');
      } catch {
        userPfp = groupPfp; // لو ما عنده صورة، نستخدم صورة القروب
      }

      // رسالة الترحيب
      const welcomeMessage = `
*『𝑳.𝑵.𝑹⊰🏰⊱𝑳𝑨𝑵𝑵𝑰𝑺𝑻𝑬𝑹』*
❃━━═✦•〘•🏰•〙•✦═━━❃

*⬤↫ مرحبًا بك في عائلتنا الصغيرة، يسرنا وجودك بيننا 🤍💫*
*↫ نتمنى أن تستمتع بوقتك وتتفاعل معنا.*

*. ● اللقب 🗣️:* 〖${nickname}〗
*. ● المنشن 🖋️:* 〖@${username}〗
*. ● الجروب 🧑‍🧑‍🧒‍🧒:* 〖${groupName}〗

❃━━═✦•〘•👑•〙•✦═━━❃
*. ● رابط الإعلانات 📢:* 〖♨️〗
*. ● رابط الصحيفة 📜:* 〖🏰〗
━━━   https://chat.whatsapp.com/CPsbzmyN2Yw3sYbUMWAVri?mode=ems_copy_t   ━━━

❴✾❵──━━━━❨🏰❩━━━━──❴✾❵
*𝑳.𝑵.𝑹⊰🏰⊱𝑳𝑨𝑵𝑵𝑰𝑺𝑻𝑬𝑹 空╎*
`.trim();

      // إرسال الترحيب بصورة المستخدم أو صورة الجروب
      await sock.sendMessage(msg.key.remoteJid, {
        image: { url: userPfp },
        caption: welcomeMessage,
        mentions: [targetJid],
        contextInfo: { mentionedJid: [targetJid] },
      }, { quoted: msg });

    } catch (err) {
      console.error("❌ خطأ في أمر الترحيب:", err);
      await sock.sendMessage(msg.key.remoteJid, {
        text: '⚠️ حصل خطأ أثناء إرسال رسالة الترحيب.',
      }, { quoted: msg });
    }
  }
};