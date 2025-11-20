const fs = require('fs');
const path = require('path');
const { isElite } = require('../haykala/elite.js');
const { jidDecode } = require('@whiskeysockets/baileys');

const dataDir = path.join(__dirname, '..', 'data');
const muteFilePath = path.join(dataDir, 'muted.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(muteFilePath)) fs.writeFileSync(muteFilePath, JSON.stringify([]));

const loadMuted = () => {
  try {
    return JSON.parse(fs.readFileSync(muteFilePath));
  } catch {
    return [];
  }
};

const saveMuted = (data) => {
  try {
    fs.writeFileSync(muteFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("خطأ في حفظ ملف الكتم:", err);
  }
};

const normalizeJid = (jid) => {
  const user = jidDecode(jid)?.user || jid.split('@')[0];
  return `${user}@s.whatsapp.net`;
};

let unwatch = null;

module.exports = {
  command: 'عوي',
  description: 'يكتم كل أعضاء القروب عدا المرسل (للنخبة فقط)',
  category: 'group',
  async execute(sock, m) {
    const chatId = m.key.remoteJid;
    const sender = m.key.participant || m.participant;

    if (!isElite(sender)) return;

    try {
      // جلب جميع أعضاء القروب
      const groupMetadata = await sock.groupMetadata(chatId);
      const participants = groupMetadata.participants.map(p => normalizeJid(p.id));

      // نكتم كل الأعضاء عدا المرسل
      const mutedUsers = loadMuted();
      for (let id of participants) {
        if (id !== normalizeJid(sender) && !mutedUsers.includes(id)) {
          mutedUsers.push(id);
        }
      }

      saveMuted(mutedUsers);

      sock.sendMessage(chatId, { text: `🔇 تم كتم جميع الأعضاء عداك.` }, { quoted: m });

      if (!unwatch) {
        unwatch = watchMutedMessages(sock);
      }

    } catch (err) {
      console.error("حدث خطأ في تنفيذ أمر .عوي:", err);
      sock.sendMessage(chatId, { text: "❌ فشل تنفيذ أمر .عوي." }, { quoted: m });
    }
  }
};

function watchMutedMessages(sock) {
  const listener = async ({ messages }) => {
    const mutedSet = new Set(loadMuted());

    for (const msg of messages) {
      const chatId = msg.key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;
      const normalizedSender = normalizeJid(sender);

      if (mutedSet.has(normalizedSender)) {
        try {
          await sock.sendMessage(chatId, {
            delete: {
              remoteJid: chatId,
              fromMe: false,
              id: msg.key.id,
              participant: sender
            }
          }).catch((err) => console.error("فشل حذف رسالة المكتوم:", err.message));
        } catch (err) {
          console.error("فشل حذف رسالة المكتوم:", err.message);
        }
      }
    }
  };

  sock.ev.on('messages.upsert', listener);
  return () => sock.ev.off('messages.upsert', listener);
}