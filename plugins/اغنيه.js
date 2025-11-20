const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
    command: 'اغنيه',
    description: 'تحميل أغنية من يوتيوب مع التفاصيل',
    category: 'tools',
    usage: '.اغنيه [اسم الأغنية]',

    async execute(sock, msg) {
        const from = msg.key.remoteJid;
        const body = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
        const args = body.trim().split(/\s+/).slice(1);
        const query = args.join(' ');

        if (!query) {
            return await sock.sendMessage(from, {
                text: '❗ اكتب اسم الأغنية. مثال:\n.اغنيه-يوت Despacito'
            }, { quoted: msg });
        }

        const tempFile = path.join(__dirname, 'temp_song.mp3');
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

        try {
            await sock.sendMessage(from, { text: `🔎 جاري البحث عن "${query}"...` }, { quoted: msg });

            const ytdlpPath = '/data/data/com.termux/files/usr/bin/yt-dlp'; // اتأكد إن المسار ده صح
            const infoFile = path.join(__dirname, 'info.json');

            // 1- نجيب معلومات الفيديو
            const info = spawn(ytdlpPath, [
                `ytsearch1:${query}`,
                '--skip-download',
                '--print-json'
            ]);

            let rawData = '';
            info.stdout.on('data', data => {
                rawData += data.toString();
            });

            info.on('close', async code => {
                if (code !== 0 || !rawData) {
                    return await sock.sendMessage(from, {
                        text: '❌ فشل الحصول على تفاصيل الفيديو.'
                    }, { quoted: msg });
                }

                let videoData;
                try {
                    videoData = JSON.parse(rawData);
                } catch (e) {
                    return sock.sendMessage(from, { text: '❌ خطأ في قراءة بيانات الفيديو.' }, { quoted: msg });
                }

                const title = videoData.title || 'غير معروف';
                const uploader = videoData.uploader || 'غير معروف';
                const uploadDate = videoData.upload_date
                    ? `${videoData.upload_date.slice(6,8)}/${videoData.upload_date.slice(4,6)}/${videoData.upload_date.slice(0,4)}`
                    : 'غير معروف';
                const duration = videoData.duration_string || 'غير معروف';
                const thumb = videoData.thumbnail || null;

                // 2- ابعت الصورة + التفاصيل
                if (thumb) {
                    await sock.sendMessage(from, {
                        image: { url: thumb },
                        caption: `🎶 | ${title}\n🎤 القناة: ${uploader}\n⏱️ المدة: ${duration}\n📅 التاريخ: ${uploadDate}\n\n𝑨𝑹𝑻𝑯𝑼𝑹 ⚡`
                    }, { quoted: msg });
                }

                // 3- نحمّل الصوت
                const ytdlp = spawn(ytdlpPath, [
                    '-x', '--audio-format', 'mp3',
                    '--output', tempFile,
                    `ytsearch1:${query}`
                ]);

                ytdlp.stderr.on('data', data => {
                    console.error(`stderr: ${data}`);
                });

                ytdlp.on('close', async code => {
                    if (code !== 0) {
                        return await sock.sendMessage(from, {
                            text: '❌ حدث خطأ أثناء تحميل الصوت. تأكد أن yt-dlp مثبت ويعمل.'
                        }, { quoted: msg });
                    }

                    if (fs.existsSync(tempFile)) {
                        await sock.sendMessage(from, {
                            audio: fs.readFileSync(tempFile),
                            mimetype: 'audio/mp4',
                            fileName: `${title}.mp3`
                        }, { quoted: msg });
                        fs.unlinkSync(tempFile);
                    } else {
                        await sock.sendMessage(from, {
                            text: '❌ لم يتم العثور على الملف الصوتي.'
                        }, { quoted: msg });
                    }
                });
            });

        } catch (err) {
            console.error('خطأ:', err);
            await sock.sendMessage(from, {
                text: `❌ فشل التحميل:\n${err.message}`
            }, { quoted: msg });
        }
    }
};