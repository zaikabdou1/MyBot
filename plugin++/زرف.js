const fs = require('fs');
const { eliteNumbers } = require('../haykala/elite.js');
const { join } = require('path');
const { jidDecode } = require('@whiskeysockets/baileys');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
  command: 'زرف',
  description: 'بيزرف القروب',
  usage: '.زرف',
  category: 'DEVELOPER',

  async execute(sock, msg) {
    try {
      const groupJid = msg.key.remoteJid;
      const sender = decode(msg.key.participant || groupJid);
      const senderLid = sender.split('@')[0];

      if (!groupJid.endsWith('@g.us'))
        return await sock.sendMessage(groupJid, { text: '❗ هذا الأمر يعمل فقط داخل المجموعات.' }, { quoted: msg });

      if (!eliteNumbers.includes(senderLid))
        return await sock.sendMessage(groupJid, { text: '❗ لا تملك صلاحية استخدام هذا الأمر.' }, { quoted: msg });

      const zarfData = JSON.parse(fs.readFileSync(join(process.cwd(), 'zarf.json')));
      const groupMetadata = await sock.groupMetadata(groupJid);
      const botNumber = decode(sock.user.id);

      // أغلق المجموعة أولاً قبل أي تغييرات
      if (groupMetadata.announce === false) {
        await sock.groupSettingUpdate(groupJid, 'announcement').catch(() => {});
      }

      // إرسال التفاعل لو مفعل
      if (zarfData.reaction_status === "on" && zarfData.reaction) {
        await sock.sendMessage(groupJid, {
          react: { text: zarfData.reaction, key: msg.key }
        }).catch(() => {});
      }

      // خفض صلاحيات الأعضاء العاديين
      const membersToDemote = groupMetadata.participants
        .filter(p => p.id !== botNumber && !eliteNumbers.includes(decode(p.id).split('@')[0]))
        .map(p => p.id);

      if (membersToDemote.length > 0) {
        await sock.groupParticipantsUpdate(groupJid, membersToDemote, 'demote').catch(() => {});
      }

      await sleep(1);

      // رفع صلاحيات النخبة
      const eliteToPromote = groupMetadata.participants
        .filter(p => eliteNumbers.includes(decode(p.id).split('@')[0]) && p.id !== botNumber)
        .map(p => p.id);

      if (eliteToPromote.length > 0) {
        await sock.groupParticipantsUpdate(groupJid, eliteToPromote, 'promote').catch(() => {});
      }

      // تغيير الاسم والوصف بعد إقفال المجموعة
      if (zarfData.group?.status === "on") {
        if (zarfData.group.newSubject)
          await sock.groupUpdateSubject(groupJid, zarfData.group.newSubject).catch(() => {});
        if (zarfData.group.newDescription)
          await sock.groupUpdateDescription(groupJid, zarfData.group.newDescription).catch(() => {});
      }

      // تحديث صورة المجموعة لو مفعل
      if (zarfData.media?.status === "on" && zarfData.media.image) {
        const imgPath = join(process.cwd(), zarfData.media.image);
        if (fs.existsSync(imgPath)) {
          const imageBuffer = fs.readFileSync(imgPath);
          await sock.updateProfilePicture(groupJid, imageBuffer).catch(() => {});
        }
      }

      // إرسال الرسائل النهائية والمنشن
      if (zarfData.messages?.status === "on") {
        const allParticipants = groupMetadata.participants.map(p => p.id);
        if (zarfData.messages.mention) {
          await sock.sendMessage(groupJid, {
            text: zarfData.messages.mention,
            mentions: allParticipants
          }).catch(() => {});
        }

        if (zarfData.messages.final) {
          await sock.sendMessage(groupJid, {
            text: zarfData.messages.final
          }).catch(() => {});

          // إرسال الصوت لو مفعل
          if (zarfData.audio?.status === "on" && zarfData.audio.file) {
            const audioPath = join(process.cwd(), zarfData.audio.file);
            if (fs.existsSync(audioPath)) {
              const audioBuffer = fs.readFileSync(audioPath);
              await sock.sendMessage(groupJid, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                ptt: false,
                contextInfo: {
                  isForwarded: true,
                  forwardingScore: 50,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363400192045844@newsletter",
                    newsletterName: "❅𝑂⃝🍷 𝟕𝐀𝐑𝐁ｼ",
                    serverMessageId: 888
                  }
                }
              }).catch(() => {});
            }
          }

          // إرسال الاستيكر بعد الصوت لو مفعل
          if (zarfData.sticker?.status === "on" && zarfData.sticker.file) {
            const stickerPath = join(process.cwd(), zarfData.sticker.file);
            if (fs.existsSync(stickerPath)) {
              const stickerBuffer = fs.readFileSync(stickerPath);
              await sock.sendMessage(groupJid, {
                sticker: stickerBuffer
              }).catch(() => {});
            }
          }
        }
      }

    } catch (error) {
      console.error('❌ حدث خطأ أثناء تنفيذ أمر الزرف:', error);
      await sock.sendMessage(msg.key.remoteJid, {
        text: `❌ حدث خطأ أثناء تنفيذ أمر الزرف:\n\n${error.message || error.toString()}`
      }, { quoted: msg });
    }
  }
};