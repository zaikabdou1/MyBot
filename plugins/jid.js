module.exports = {
  command: "جيدي",
  category: "tools",
  description: "يعرض JID القروب",

  async execute(sock, m) {
    const jid = m.key.remoteJid;

    if (!jid.endsWith("@g.us")) {
      return sock.sendMessage(jid, { text: "❌ هذا ليس جروب." }, { quoted: m });
    }

    await sock.sendMessage(jid, {
      text: `🆔 JID القروب:\n${jid}`
    }, { quoted: m });
  }
};