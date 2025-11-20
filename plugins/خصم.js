const fs = require("fs");
const path = require("path");

const pointsFile = path.join(__dirname, "../data/ranks.json");
let points = {};

if (fs.existsSync(pointsFile)) {
    points = JSON.parse(fs.readFileSync(pointsFile));
}

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

// LIDs المسموح لهم بتنفيذ الأمر
const allowed = [
    "YOUR_LID@lid", // ضع هنا LID الخاص بك
    "4836854628523@lid",
    "163780591915033@lid",
    "227552333414482@lid",
    "104806312050733@lid",
    "187797965168665@lid",
    "110866695483574@lid"
];

module.exports = {
    command: "خصم",
    category: "admin",
    description: "خصم نقاط من عضو بصيغة k و m",

    async execute(sock, msg, args) {

        const senderLid = (msg.key.participant || msg.key.remoteJid).split("@")[0] + "@lid";

        if (!allowed.includes(senderLid)) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: "🚫 هذا الأمر مخصص للإدارة فقط."
            }, { quoted: msg });
        }

        // استخراج الشخص والكمية
        let targetLid, targetJid, rawAmount;

        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
            targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0]; // JID الحقيقي للمنشن
            targetLid = targetJid.split("@")[0] + "@lid"; // LID لتخزين النقاط
            const text = msg.message.extendedTextMessage.text || "";
            const words = text.trim().split(/\s+/);
            rawAmount = words[words.length - 1]; // آخر كلمة = الكمية
        } else if (args[0] && args[1]) {
            targetJid = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
            targetLid = args[0].replace(/[^0-9]/g, "") + "@lid";
            rawAmount = args[1];
        }

        if (!targetLid || !rawAmount) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: "❗ استخدم:\n```\n.خصم @منشن 5k\n.خصم 540419314 500k\n```"
            }, { quoted: msg });
        }

        const amount = toNumber(rawAmount);
        if (!amount || amount < 1) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: "❗ الصيغة غير صحيحة. الأمثلة:\n5k – 200k – 1m"
            }, { quoted: msg });
        }

        // التأكد من وجود النقاط للشخص
        if (!points[targetLid]) points[targetLid] = 0;
        const prevPoints = points[targetLid];

        // خصم النقاط
        points[targetLid] = Math.max(0, prevPoints - amount);

        fs.writeFileSync(pointsFile, JSON.stringify(points, null, 2));

        return sock.sendMessage(msg.key.remoteJid, {
            text:
`🛑 تم خصم النقاط بنجاح

👤 المستخدم: *@${targetJid.split("@")[0]}*
➖ تم خصم: *${formatK(amount)}*
💰 رصيده السابق: *${formatK(prevPoints)}*
💰 رصيده الحالي: *${formatK(points[targetLid])}*`,
            mentions: [targetJid]
        }, { quoted: msg });

    }
};