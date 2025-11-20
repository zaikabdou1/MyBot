const fs = require('fs');
const path = require('path');

const pointsFile = path.join(__dirname, '../data/ranks.json');
const xpFile = path.join(__dirname, '../data/xp.json');
const levelsFile = path.join(__dirname, '../data/levels.json');

let points = fs.existsSync(pointsFile) ? JSON.parse(fs.readFileSync(pointsFile)) : {};
let xp = fs.existsSync(xpFile) ? JSON.parse(fs.readFileSync(xpFile)) : {};
let levels = fs.existsSync(levelsFile) ? JSON.parse(fs.readFileSync(levelsFile)) : {};

const ARISE_LEVEL = '𝐀𝐑𝐈𝐒𝐄 𝐋𝐄𝐕𝐄𝐋';

const rankTitles = [
  '🛡️ جندي ⚔️',
  '🗡️ محارب 🏹',
  '🎖️ ملازم 🏰',
  '🐎 فارس ⚡',
  '🔥 مارشال 💥',
  '💎 جنرال ⚜️',
  '🌟 قائد أعلى ✨',
  '🌑 ملك الظلال 👑'
];

const rankThresholds = [
  0,
  100_000,
  300_000,
  700_000,
  1_500_000,
  3_000_000,
  6_000_000,
  10_000_000
];

function formatK(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'm';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}

function saveData() {
  fs.writeFileSync(pointsFile, JSON.stringify(points, null, 2));
  fs.writeFileSync(xpFile, JSON.stringify(xp, null, 2));
  fs.writeFileSync(levelsFile, JSON.stringify(levels, null, 2));
}

function ensureUser(sender) {
  if (!points[sender]) points[sender] = 0;
  if (!xp[sender]) xp[sender] = 0;
  if (!levels[sender]) levels[sender] = { level: 0, title: rankTitles[0], purchases: 0 };
}

// تحديث مستوى العضو بناءً على XP التراكمي
function updateLevel(sender) {
  ensureUser(sender);
  let newLevel = 0;
  for (let i = 0; i < rankThresholds.length; i++) {
    if (xp[sender] >= rankThresholds[i]) newLevel = i;
  }
  levels[sender].level = newLevel;
  levels[sender].title = rankTitles[newLevel];
  saveData();
}

// إضافة نقاط: يزيد الرصيد والـ XP → تحديث المستوى
function addPoints(sender, amount) {
  ensureUser(sender);
  points[sender] += amount;
  xp[sender] += amount; // تراكمي
  updateLevel(sender);
}

// خصم نقاط: ينقص الرصيد فقط
function subtractPoints(sender, amount) {
  ensureUser(sender);
  points[sender] -= amount;
  if (points[sender] < 0) points[sender] = 0;
  saveData();
}

// شراء: ينقص الرصيد ويزيد الشارات
function purchase(sender, cost) {
  ensureUser(sender);
  if (points[sender] < cost) return false;
  points[sender] -= cost;
  levels[sender].purchases += 1;
  saveData();
  return true;
}

// عرض الرصيد والحالة
module.exports = {
  command: 'رصيدي',
  category: 'info',
  description: 'اعرض رصيدك، XP، ورتبتك في ARISE LEVEL 🎯',

  async execute(sock, msg) {
    const sender = msg.key.participant || msg.key.remoteJid;
    ensureUser(sender);
    updateLevel(sender);

    const { title, level } = levels[sender];
    const formattedPoints = formatK(points[sender]);

    await sock.sendMessage(msg.key.remoteJid, {
      text: `رصيدك الحالي 💰: *${formattedPoints}* نقطة\n` +
            `${ARISE_LEVEL}: *${title}*\n` +
            `> *Level ${level}*`
    }, { quoted: msg });
  }
};

module.exports.addPoints = addPoints;
module.exports.subtractPoints = subtractPoints;
module.exports.purchase = purchase;
module.exports.getStatus = (sender) => {
  ensureUser(sender);
  return {
    points: points[sender],
    xp: xp[sender],
    title: levels[sender].title,
    level: levels[sender].level,
    purchases: levels[sender].purchases
  };
};