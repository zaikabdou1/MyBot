const fs = require("fs");
const path = require("path");

const pointsFile = path.join(__dirname, "../data/ranks.json");
let points = fs.existsSync(pointsFile) ? JSON.parse(fs.readFileSync(pointsFile)) : {};

// يحول الرقم إلى صيغة K/M
function formatK(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "m";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
}

// LIDs المسموح لهم بتنفيذ الأمر (الإدارة)
const allowed = [
    "YOUR_LID@lid", // ضع LID الخاص بك
    "4836854628523@lid",
    "163780591915033@lid",
    "104806312050733@lid",
    "227552333414482@lid",
    "187797965168665@lid",
    "110866695483574@lid"
];

module.exports = {
    command: "تصفر",
    category: "admin",
    description: "تصفير رصيد أي عضو وإظهار رصيده السابق",

    async execute(sock, msg, args) {
        const senderLid = (msg.key.participant || msg.key.remoteJid).split("@")[0] + "@lid";
        const chatId = msg.key.remoteJid;

        if (!allowed.includes(senderLid)) {
            return sock.sendMessage(chatId, { text: "🚫 هذا الأمر مخصص للإدارة فقط." }, { quoted: msg });
        }

        // التحقق من المنشن
        if (!msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
            return sock.sendMessage(chatId, { text: "❗ استخدم: `.تصفر @العضو`" }, { quoted: msg });
        }

        const targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        const targetLid = targetJid.split("@")[0] + "@lid";

        const prevPoints = points[targetLid] || 0;
        points[targetLid] = 0;

        fs.writeFileSync(pointsFile, JSON.stringify(points, null, 2));

        return sock.sendMessage(chatId, {
            text:
`🧹 تم تصفير رصيد العضو *@${targetLid.split("@")[0]}*

💰 رصيده السابق كان: *${formatK(prevPoints)}*
✅ رصيده الآن: *0*`,
            mentions: [targetJid]
        }, { quoted: msg });
    }
};