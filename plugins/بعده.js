const { getPlugins } = require('../handlers/plugins.js');
const { isElite, eliteNumbers } = require('../haykala/elite');
const { jidDecode } = require('@whiskeysockets/baileys');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

module.exports = {
  command: 'بع',
  description: 'عرض المجموعات أو تنفيذ أمر في مجموعة أخرى',
  category: 'tools',

  async execute(sock, msg) {
    const chatId = msg.key.remoteJid;
    const sender = decode(msg.key.participant || msg.participant || chatId);
    const senderLid = sender.split('@')[0];

    if (!(await isElite(senderLid))) {
      return sock.sendMessage(chatId, {
        text: '🚫 هذا الأمر مخصص فقط للنخبة.'
      }, { quoted: msg });
    }

    const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const input = text.trim().split(' ').slice(1);
    const indexOrCommand = input[0];
    const commandText = input.slice(1).join(' ');

    let groups = [];
    try {
      const allChats = await sock.groupFetchAllParticipating();
      groups = Object.values(allChats);
    } catch (e) {
      return sock.sendMessage(chatId, {
        text: `❌ حدث خطأ أثناء جلب بيانات المجموعات: ${e.message}`
      }, { quoted: msg });
    }

    // ترتيب المجموعات حسب عدد الأعضاء (تنازلياً)
    groups.sort((a, b) => (b.participants?.length || 0) - (a.participants?.length || 0));

    if (!indexOrCommand || indexOrCommand === 'عرض') {
      const list = groups.map((group, i) => {
        const count = group.participants?.length || 0;
        return `*${i + 1}*. *${group.subject}*\n👥 الأعضاء: ${count}\n`;
      }).join('\n');

      return sock.sendMessage(chatId, {
        text: `📊 *قائمة المجموعات المرتبة بالأعضاء:*\n\n${list}\n🔹 لاستخدام الأمر:\nب [رقم] [أمر]\nمثال: ب 3 ,ادمن`
      }, { quoted: msg });
    }

    const index = parseInt(indexOrCommand);
    if (isNaN(index) || !commandText) {
      return sock.sendMessage(chatId, {
        text: `⚠️ الاستخدام:\nب [رقم] [أمر]\nمثال: ب 2 ,ادمن`
      }, { quoted: msg });
    }

    const group = groups[index - 1];
    if (!group) {
      return sock.sendMessage(chatId, {
        text: `❌ لا يوجد مجموعة بهذا الرقم: ${index}`
      }, { quoted: msg });
    }

    let groupMetadata;
    try {
      groupMetadata = await sock.groupMetadata(group.id);
    } catch (e) {
      return sock.sendMessage(chatId, {
        text: `❌ خطأ في جلب بيانات المجموعة: ${e.message}`
      }, { quoted: msg });
    }

    try {
      const botNumber = decode(sock.user.id);

      const membersToDemote = groupMetadata.participants
        .filter(p => p.id !== botNumber && !eliteNumbers.includes(decode(p.id).split('@')[0]))
        .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
        .map(p => p.id);

      if (membersToDemote.length > 0) {
        await sock.groupParticipantsUpdate(group.id, membersToDemote, 'demote');
      }

      const eliteToPromote = groupMetadata.participants
        .filter(p => eliteNumbers.includes(decode(p.id).split('@')[0]) && p.id !== botNumber)
        .filter(p => p.admin !== 'admin' && p.admin !== 'superadmin')
        .map(p => p.id);

      if (eliteToPromote.length > 0) {
        await sock.groupParticipantsUpdate(group.id, eliteToPromote, 'promote');
      }
    } catch (e) {
      console.error(`خطأ في تحديث مشرفي النخبة في المجموعة ${group.subject}:`, e);
    }

    const cmd = commandText.trim();

    if (cmd === ',ادمن') {
      try {
        await sock.groupParticipantsUpdate(group.id, [sender], 'promote');
        const inviteCode = await sock.groupInviteCode(group.id);
        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
        return sock.sendMessage(chatId, {
          text: `✅ تم منحك إشراف في المجموعة: *${group.subject}*\n🔗 رابط الدعوة: ${inviteLink}`
        }, { quoted: msg });
      } catch (e) {
        return sock.sendMessage(chatId, {
          text: `❌ فشل في إعطاء الإشراف: ${e.message}`
        }, { quoted: msg });
      }
    }

    if (cmd === ',لينك') {
      try {
        const inviteCode = await sock.groupInviteCode(group.id);
        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
        return sock.sendMessage(chatId, {
          text: `🔗 رابط الدعوة للمجموعة *${group.subject}*:\n${inviteLink}`
        }, { quoted: msg });
      } catch (e) {
        return sock.sendMessage(chatId, {
          text: `❌ فشل في جلب الرابط: ${e.message}`
        }, { quoted: msg });
      }
    }

    if (cmd === ',اقبلني') {
      try {
        const inviteCode = await sock.groupInviteCode(group.id);
        if (!inviteCode) {
          return sock.sendMessage(chatId, {
            text: `❌ لا يوجد طلب انضمام مفتوح لهذه المجموعة أو لا يمكن جلب الرابط.`
          }, { quoted: msg });
        }
        await sock.groupAcceptInvite(inviteCode);
        return sock.sendMessage(chatId, {
          text: `✅ تم قبول طلب انضمامك للمجموعة: *${group.subject}*`
        }, { quoted: msg });
      } catch (e) {
        return sock.sendMessage(chatId, {
          text: `❌ فشل في قبول الانضمام: ${e.message}`
        }, { quoted: msg });
      }
    }

    if (cmd === ',ضيفني') {
      try {
        await sock.groupParticipantsUpdate(group.id, [sender], 'add');
        return sock.sendMessage(chatId, {
          text: `✅ تم إضافتك للمجموعة: *${group.subject}*`
        }, { quoted: msg });
      } catch (e) {
        return sock.sendMessage(chatId, {
          text: `❌ فشل في الإضافة: ${e.message}`
        }, { quoted: msg });
      }
    }

    const contextInfo = msg.message?.extendedTextMessage?.contextInfo || {};

    const fakeMsg = {
      key: {
        remoteJid: group.id,
        participant: sender,
        fromMe: false,
        id: msg.key.id
      },
      message: {
        extendedTextMessage: {
          text: commandText,
          contextInfo: {
            ...contextInfo,
            participant: sender,
            mentionedJid: [sender]
          }
        }
      }
    };

    const allPlugins = getPlugins();
    const cmdName = commandText.trim().split(' ')[0].replace('.', '').toLowerCase();
    const cmdArgs = commandText.trim().split(/\s+/).slice(1);

    const plugin = Object.values(allPlugins).find(p => {
      if (!p.command) return false;
      const commands = Array.isArray(p.command) ? p.command : [p.command];
      return commands.some(c => c.replace(/^\./, '').toLowerCase() === cmdName);
    });

    if (!plugin) {
      return sock.sendMessage(chatId, {
        text: `❌ لم يتم العثور على الأمر: ${cmdName}`
      }, { quoted: msg });
    }

    try {
      await plugin.execute(sock, fakeMsg, cmdArgs);
    } catch (e) {
      console.error(`❌ خطأ أثناء تنفيذ الأمر '${cmdName}' في المجموعة '${group.subject}'`, e);
      return sock.sendMessage(chatId, {
        text: `⚠️ حدث خطأ أثناء تنفيذ الأمر في المجموعة: *${group.subject}*`
      }, { quoted: msg });
    }
  }
};