const fs = require("fs");
const path = require("path");

module.exports = {
  command: "يورو",
  description: "قطوة تقول مياو (فويس MP3)",
  usage: ".يورو",
  category: "ترفيه",

  async execute(sock, msg) {
    try {
      // مسار ملف الصوت في نفس مجلد البوت الأساسي
      const voicePath = path.join(process.cwd(), "yoru.mp3");

      if (!fs.existsSync(voicePath)) {
        return sock.sendMessage(
          msg.key.remoteJid,
          { text: "⚠️ ملف yoru.mp3 غير موجود في مجلد البوت!" },
          { quoted: msg }
        );
      }

      const voiceBuffer = fs.readFileSync(voicePath);

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          audio: voiceBuffer,
          mimetype: "audio/mpeg", // MP3
          ptt: true
        },
        { quoted: msg }
      );

    } catch (error) {
      console.error('❌ خطأ في أمر "يورو":', error);
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: `حصل خطأ:\n${error.message}` },
        { quoted: msg }
      );
    }
  }
};