const fs = require('fs');
const path = require('path');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const dbFile = path.resolve(__dirname, '../data/members.json');
const imageDir = path.resolve(__dirname, '../resources');

function loadDB() {
  if (!fs.existsSync(dbFile)) return {};
  return JSON.parse(fs.readFileSync(dbFile));
}

function saveDB(data) {
  const dir = path.dirname(dbFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
}

module.exports = {
  command: 'سجل',
  category: 'tools',
  description: 'تسجيل بيانات بطاقة العضو.',
  async execute(sock, msg) {
    const senderFull = msg.key.participant || msg.key.remoteJid;
    const sender = senderFull.split('@')[0];
    const db = loadDB();
    db[sender] = db[sender] || {};

    if (!db[sender].name && msg.pushName) db[sender].name = msg.pushName;
    if (!db[sender].number) db[sender].number = sender;
    if (!db[sender].joinedAt) db[sender].joinedAt = new Date().toLocaleString('ar-EG');

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.body || '';

    const [_, fieldRaw, ...valueArr] = text.trim().split(' ');
    const value = valueArr.join(' ');

    const fields = {
      لقب: 'nickname',
      انمي: 'anime',
      عمر: 'age',
      جنس: 'gender',
      دولة: 'country',
    };

    if (fieldRaw === 'صورة') {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const image = quoted?.imageMessage;

      if (!image) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: '❗️يرجى الرد على صورة مع هذا الأمر: .سجل صورة'
        }, { quoted: msg });
      }

      try {
        const buffer = await downloadMediaMessage(
          { message: quoted },
          'buffer',
          {},
          { reuploadRequest: sock.updateMediaMessage }
        );

        if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });
        const filePath = path.join(imageDir, `${sender}.jpg`);
        fs.writeFileSync(filePath, buffer);

        db[sender].image = filePath;
        saveDB(db);

        return sock.sendMessage(msg.key.remoteJid, {
          text: '✅ تم حفظ الصورة في مجلد resources.'
        }, { quoted: msg });
      } catch (err) {
        return sock.sendMessage(msg.key.remoteJid, {
          text: '❌ حصل خطأ أثناء تحميل الصورة.',
        }, { quoted: msg });
      }
    }

    if (fieldRaw === 'جاهز') {
      db[sender].ready = true;
      if (!db[sender].id) {
        db[sender].id = Math.floor(100 + Math.random() * 899);
      }
      saveDB(db);
      return sock.sendMessage(msg.key.remoteJid, {
        text: '🎉 تم تفعيل بطاقتك بنجاح! استخدم .بطاقتي لعرضها.'
      }, { quoted: msg });
    }

    const field = fields[fieldRaw];
    if (!field || !value) {
      return sock.sendMessage(msg.key.remoteJid, {
        text:
`❗️ استخدم الأمر كده:
.سجل لقب <لقبك>
.سجل انمي <اسم الانمي المفضل>
.سجل عمر <عمرك>
.سجل جنس <ذكر / أنثى>
.سجل دولة <بلدك>
.سجل صورة (بالرد على صورة)
.سجل جاهز (لتفعيل البطاقة)
.سجل-حذف (لحذف بياناتك بالكامل)`
      }, { quoted: msg });
    }

    db[sender][field] = value;
    saveDB(db);

    await sock.sendMessage(msg.key.remoteJid, {
      text: `✅ تم حفظ ${fieldRaw}: ${value}`
    }, { quoted: msg });
  }
};