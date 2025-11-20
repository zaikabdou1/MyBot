module.exports = {
  command: ['احصائيات'],
  description: '📊 يعرض إحصائيات مفصلة عن الجروب مثل عدد الأعضاء، المشرفين، المؤسس، وتاريخ الإنشاء.',
  usage: '.إحصائيات',
  category: 'group',

  async execute(sock, msg) {
    const groupJid = msg.key.remoteJid;

    if (!groupJid.endsWith('@g.us')) {
      return sock.sendMessage(groupJid, {
        text: '🚫 𝐓𝐡𝐢𝐬 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐰𝐨𝐫𝐤𝐬 𝐢𝐧 *𝐆𝐑𝐎𝐔𝐏𝐒 𝐎𝐍𝐋𝐘*!'
      }, { quoted: msg });
    }

    try {
      let botProfilePic;
      try {
        botProfilePic = await sock.profilePictureUrl(sock.user.id, 'image');
      } catch {
        botProfilePic = 'https://i.imgur.com/8TnZ4Rv.png';
      }

      const metadata = await sock.groupMetadata(groupJid);
      const groupName = metadata.subject;
      const participants = metadata.participants.length;
      const admins = metadata.participants.filter(p => p.admin);
      const groupOwner = metadata.owner ? `@${metadata.owner.split('@')[0]}` : 'غير معروف';
      const creationDate = new Date(metadata.creation * 1000).toLocaleString('ar-EG');
      const currentTime = new Date().toLocaleString('ar-EG');

      const adminsList = admins.map((a, i) => `┃ 🔹 (${i + 1}) @${a.id.split('@')[0]}`).join('\n') || '⚠️ 𝐍𝐨 𝐚𝐝𝐦𝐢𝐧𝐬 𝐟𝐨𝐮𝐧𝐝.';
      const mentions = [metadata.owner, ...admins.map(a => a.id)].filter(Boolean);

      const messageText = `
╭━━〔 📊 𝐆𝐑𝐎𝐔𝐏 𝐒𝐓𝐀𝐓𝐒 〕━━╮
┃
┃ 🏷️ 𝐍𝐚𝐦𝐞: *${groupName}*
┃ 👥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬: *${participants}*
┃ 📅 𝐂𝐫𝐞𝐚𝐭𝐞𝐝: *${creationDate}*
┃ ⏰ 𝐍𝐨𝐰: *${currentTime}*
┃ 🤖 𝐁𝐨𝐭: *${sock.user.id.split('@')[0]}*
┃ 👑 𝐎𝐰𝐧𝐞𝐫: *${groupOwner}*
╰━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 🎩 𝐀𝐃𝐌𝐈𝐍𝐒 〕━━╮
${adminsList}
╰━━━━━━━━━━━━━━━━━━╯

🧸 𝟕𝐀𝐑𝐁_𝐁𝐎𝐓 𝐢𝐬 𝐚𝐥𝐰𝐚𝐲𝐬 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮 ...
`.trim();

      const message = {
        text: messageText,
        mentions,
        contextInfo: {
          mentionedJid: mentions,
          externalAdReply: {
            title: "📊 𝐆𝐑𝐎𝐔𝐏 𝐒𝐓𝐀𝐓𝐈𝐒𝐓𝐈𝐂𝐒",
            body: "🧸 𝟕𝐀𝐑𝐁_𝐁𝐎𝐓 𝐢𝐬 𝐰𝐚𝐭𝐜𝐡𝐢𝐧𝐠 𝐞𝐯𝐞𝐫𝐲𝐭𝐡𝐢𝐧𝐠!",
            thumbnailUrl: botProfilePic,
            sourceUrl: 'https://wa.me/201116880068',
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      };

      await sock.sendMessage(groupJid, message, { quoted: msg });

    } catch (err) {
      console.error('🚨 𝐄𝐫𝐫𝐨𝐫 𝐢𝐧 𝐬𝐭𝐚𝐭𝐬:', err);
      await sock.sendMessage(groupJid, {
        text: '❌ 𝐀𝐧 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝 𝐰𝐡𝐢𝐥𝐞 𝐟𝐞𝐭𝐜𝐡𝐢𝐧𝐠 𝐠𝐫𝐨𝐮𝐩 𝐬𝐭𝐚𝐭𝐬.'
      }, { quoted: msg });
    }
  }
};