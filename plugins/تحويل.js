const fs = require("fs");
const path = require("path");

const pointsFile = path.join(__dirname, "../data/ranks.json");
const transferFile = path.join(__dirname, "../data/lastTransfer.json");

let points = fs.existsSync(pointsFile) ? JSON.parse(fs.readFileSync(pointsFile)) : {};
let lastTransfer = fs.existsSync(transferFile) ? JSON.parse(fs.readFileSync(transferFile)) : {};

// يحول 5k → 5000 و 2m → 2000000
function toNumber(str) {
    str = str.toLowerCase();
    if (str.endsWith("k")) return parseFloat(str) * 1000;
    if (str.endsWith("m")) return parseFloat(str) * 1000000;
    return parseInt(str);
}

function formatK(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "m";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
}

// LIDs المسموح لهم بصلاحية "خاصية المشرف"
const specialAllowed = [
    "4836854628523@lid",
    "163780591915033@lid",
    "187797965168665@lid",
    "110866695483574@lid"
];

// الحد العادي للتحويل
const MAX_TRANSFER = 300000; // 300k
const COOLDOWN = 7 * 24 * 60 * 60 * 1000; // أسبوع بالمللي ثانية

// الحد للمشرفين والمدة 2 ساعة
const SPECIAL_MAX_TRANSFER = 2000000; // 2m
const SPECIAL_COOLDOWN = 2 * 60 * 60 * 1000; // ساعتين

module.exports = {
    command: "تحويل",
    category: "user",
    description: "تحويل نقاط لشخص آخر بالمنشن، مع قيود خاصة للمشرفين",

    async execute(sock, msg, args) {
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const senderLid = senderJid.split("@")[0] + "@lid";
        const chatId = msg.key.remoteJid;

        // التحقق من المنشن
        if (!msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
            return sock.sendMessage(chatId, { text: "❗ استخدم: `.تحويل @العضو 50k`" }, { quoted: msg });
        }

        const targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        const targetLid = targetJid.split("@")[0] + "@lid";

        // الكمية
        const text = msg.message.extendedTextMessage.text || "";
        const words = text.trim().split(/\s+/);
        const rawAmount = words[words.length - 1];
        const amount = toNumber(rawAmount);

        if (!amount || amount < 1) {
            return sock.sendMessage(chatId, { text: "❗ اكتب كمية صالحة للتحويل. أمثلة: 5k – 50k" }, { quoted: msg });
        }

        // تحديد الحد والزمن بناءً على المشرف أو المستخدم العادي
        let maxTransfer = MAX_TRANSFER;
        let cooldown = COOLDOWN;

        if (specialAllowed.includes(senderLid)) {
            maxTransfer = SPECIAL_MAX_TRANSFER;
            cooldown = SPECIAL_COOLDOWN;
        }

        if (amount > maxTransfer) {
            return sock.sendMessage(chatId, { text: `❌ الحد الأقصى للتحويل هو ${formatK(maxTransfer)}.` }, { quoted: msg });
        }

        // التحقق من الكولداون
        const now = Date.now();
        if (lastTransfer[senderLid] && now - lastTransfer[senderLid] < cooldown) {
            const remaining = cooldown - (now - lastTransfer[senderLid]);
            const hours = Math.floor(remaining / (60 * 60 * 1000));
            const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
            return sock.sendMessage(chatId, { text: `❌ يمكنك التحويل مرة أخرى بعد ${hours} ساعة و ${minutes} دقيقة.` }, { quoted: msg });
        }

        // التحقق من رصيد المرسل
        const senderPoints = points[senderLid] || 0;
        if (senderPoints < amount) {
            return sock.sendMessage(chatId, { text: "❌ ليس لديك رصيد كافي للتحويل." }, { quoted: msg });
        }

        // إجراء التحويل
        points[senderLid] -= amount;
        if (!points[targetLid]) points[targetLid] = 0;
        points[targetLid] += amount;

        // تحديث آخر تحويل
        lastTransfer[senderLid] = now;

        fs.writeFileSync(pointsFile, JSON.stringify(points, null, 2));
        fs.writeFileSync(transferFile, JSON.stringify(lastTransfer, null, 2));

        return sock.sendMessage(chatId, {
            text:
`✅ تم تحويل *${formatK(amount)}* نقاط

👤 من: *@${senderLid.split("@")[0]}*
👤 إلى: *@${targetLid.split("@")[0]}*

رصيدك الحالي: *${formatK(points[senderLid])}*
رصيد المستلم: *${formatK(points[targetLid])}*`,
            mentions: [senderJid, targetJid]
        }, { quoted: msg });
    }
};