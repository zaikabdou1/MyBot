const axios = require('axios');

module.exports = {
  command: 'صورة',
  description: 'جلب صورة من الإنترنت بناءً على كلمة بحث',
  category: 'fun',
  usage: '.صورة <كلمة البحث>',

  async execute(sock, msg) {
    const args = msg.body.split(' ').slice(1);
    const keyword = args.join(' ');
    if (!keyword) {
      return sock.sendMessage(msg.key.remoteJid, { text: 'اكتب كلمة للبحث عن صورة مثل: .صورة قطة' }, { quoted: msg });
    }
    try {
      const res = await axios.get(`https://api.waifu.pics/sfw/${encodeURIComponent(keyword)}`);
      // ملاحظة: هذه API قد لا تدعم كل الكلمات بالعربية → يمكن تغييرها لاحقًا.
      const imageUrl = res.data.url;
      await sock.sendMessage(msg.key.remoteJid, {
        image: { url: imageUrl },
        caption: `📷 صورة لــ «${keyword}»`
      }, { quoted: msg });
    } catch (err) {
      console.error('خطأ في أمر صورة:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '⚠️ لم أتمكن من جلب صورة. جرب كلمة أخرى.' }, { quoted: msg });
    }
  }
};
