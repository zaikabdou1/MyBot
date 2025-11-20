const axios = require('axios');

module.exports = {
  command: ['تيك'],
  category: 'tools',
  description: 'جلب إيديت/AMV بجودة ممتازة فقط — بدون اعتماد على مشاهدات أو لايكات.',
  status: 'on',
  version: '9.1',

  async execute(sock, msg) {
    const allowedUsers = ['213773231685', '104806312050733', '44178721526009', '97341407268963', '227552333414482'];
    const sender = msg.key.participant || msg.key.remoteJid;
    const cleanSender = String(sender).replace(/[^0-9]/g, '');

    if (!allowedUsers.includes(cleanSender)) {
      return sock.sendMessage(msg.key.remoteJid, { text: `🚫 هذا الأمر مخصص للمصرح لهم فقط.` }, { quoted: msg });
    }

    const text = (
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      ''
    ).trim();

    const query = text.replace(/^[.,،]?(تيك|اغنيه|جلب)\s*/i, '').trim();
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: `⚠️ اكتب اسم الإيديت أو الأنمي لتحصل على نتائج.` }, { quoted: msg });

    await sock.sendMessage(msg.key.remoteJid, { react: { text: "🔍", key: msg.key } });

    const axiosOpts = { timeout: 12000, headers: { 'User-Agent': 'Mozilla/5.0' } };

    try {
      let candidates = [];

      // TikWM Search
      try {
        const resp = await axios.get(`https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(query)}`, axiosOpts);
        const data = resp?.data?.data?.videos;
        if (Array.isArray(data)) {
          candidates.push(...data.map(v => ({
            title: v.title || v.desc || '',
            cover: v.cover || v.origin_cover || null,
            share: v.share_url || v.url || null,
            noWater: v.play || v.no_watermark || null,
            duration: parseInt(v.duration) || 0,
            likes: parseInt(v.likes) || 0,
            source: 'tikwm'
          })));
        }
      } catch {}

      // Tiklydown Search
      try {
        const r2 = await axios.get(`https://api.tiklydown.eu.org/api/search?keywords=${encodeURIComponent(query)}`, axiosOpts);
        const items = r2?.data?.results;
        if (Array.isArray(items)) {
          candidates.push(...items.map(it => ({
            title: it.title || it.desc || '',
            cover: it.cover || it.thumbnail || null,
            share: it.share_url || it.url || null,
            noWater: null,
            duration: parseInt(it.duration_seconds) || 0,
            likes: parseInt(it.likes) || 0,
            source: 'tikly'
          })));
        }
      } catch {}

      if (!candidates.length) {
        return sock.sendMessage(msg.key.remoteJid, { text: `❌ لم أجد شيء لـ: ${query}` }, { quoted: msg });
      }

      // فلترة جودة الزمن فقط
      candidates = candidates.filter(c => c.duration >= 6 && c.duration <= 240);

      // إزالة التكرارات
      const uniq = [];
      const seen = new Set();
      for (const c of candidates) {
        const k = (c.share || c.title).slice(0,200);
        if (!seen.has(k)) { seen.add(k); uniq.push(c); }
      }

      // ترتيب حسب الإعجابات واختيار أعلى 6
      uniq.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      const topCandidates = uniq.slice(0, 6);

      // خلط النتائج للحصول على تنويع
      topCandidates.sort(() => Math.random() - 0.5);

      // جلب روابط بدون علامة مائية - مع تفضيل HD
      for (const cand of topCandidates) {
        if (cand.noWater) {
          cand.finalVideo = cand.noWater;
          continue;
        }

        if (cand.source === 'tikly' && cand.share) {
          try {
            const dl = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(cand.share)}`, axiosOpts);
            cand.finalVideo = dl?.data?.video?.hdplay || dl?.data?.video?.no_watermark || dl?.data?.video || null;
            continue;
          } catch {}
        }

        if (cand.source === 'tikwm' && cand.share) {
          try {
            const dl2 = await axios.get(`https://www.tikwm.com/api/video/play?url=${encodeURIComponent(cand.share)}`, axiosOpts);
            cand.finalVideo = dl2?.data?.data?.hdplay || dl2?.data?.data?.play || null;
            continue;
          } catch {}
        }
      }

      // اختيار فقط اللي فعلاً نقدر نرسلها
      let playable = topCandidates.filter(c => c.finalVideo);

      if (!playable.length) {
        return sock.sendMessage(msg.key.remoteJid, { text: `⚠️ لم أجد رابط صالح للتحميل.` }, { quoted: msg });
      }

      // اختيار واحد عشوائياً من الأعلى 6 لايكات
      const chosen = playable[Math.floor(Math.random() * playable.length)];

      const cap = `🎬 ${chosen.title || 'بدون عنوان'}\n🔗 مصدر: ${chosen.source} | 👍 ${chosen.likes || 0} لايك`;

      if (chosen.cover) {
        try {
          await sock.sendMessage(msg.key.remoteJid, { image: { url: chosen.cover }, caption: cap }, { quoted: msg });
        } catch {}
      }

      await sock.sendMessage(msg.key.remoteJid, {
        video: { url: chosen.finalVideo },
        caption: `✅ تم جلب أفضل جودة.`
      }, { quoted: msg });

      await sock.sendMessage(msg.key.remoteJid, { react: { text: "🔥", key: msg.key } });

    } catch (err) {
      console.error('Error تيك:', err.message);
      return sock.sendMessage(msg.key.remoteJid, { text: `❌ خطأ داخلي.` }, { quoted: msg });
    }
  }
};