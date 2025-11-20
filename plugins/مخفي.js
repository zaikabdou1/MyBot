module.exports = {
  command: ".",
  description: "منشن الكل بدون المشرفين",
  category: "general",

  async execute(sock, m) {
    try {
      const jid = m.key.remoteJid;
      const metadata = await sock.groupMetadata(jid);
      const participants = metadata.participants;

      // استخراج المشرفين
      const admins = participants
        .filter(p => p.admin === "admin" || p.admin === "superadmin")
        .map(p => p.id);

      // استخراج غير المشرفين
      const nonAdmins = participants
        .filter(p => !admins.includes(p.id))
        .map(p => p.id);

      await sock.sendMessage(jid, {
        text: "منشن غير المشرفين:",
        mentions: nonAdmins
      });

    } catch (e) {
      console.log(e);
      m.reply("خطأ في الأمر.");
    }
  }
};