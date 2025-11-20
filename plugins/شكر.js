module.exports = {
  status: "on",
  name: 'Dev Info',
  command: ['شكر'],
  category: 'معلومات',
  description: 'يعرض معلومات عن مطور البوت',
  hidden: false,
  version: '1.0',

  async execute(sock, msg) {
    try {
      const info = `
✨ شكرًا على تلك الأيام الجميلة التي عبرت كالحلم...

قد لا تعود، لكن أثرها باقٍ في القلب.

🕊️ بعض اللحظات لا تُنسى،  
لأنها كانت صادقة، دافئة، ومليئة بالسلام.`;

      await sock.sendMessage(msg.key.remoteJid, { text: info }, { quoted: msg });

    } catch (error) {
      console.error('❌ Dev Info Error:', error);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ حصل خطأ أثناء عرض معلومات المطور.' }, { quoted: msg });
    }
  }
};