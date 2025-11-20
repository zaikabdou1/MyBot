const fs = require("fs");
const path = require("path");

const pointsFile = path.join(__dirname, "../data/ranks.json");
let points = {};

if (fs.existsSync(pointsFile)) {
    points = JSON.parse(fs.readFileSync(pointsFile));
}

function toNumber(str) {
    if (!str) return 1;
    str = str.toLowerCase();
    if (str.endsWith("k")) return Math.floor(parseFloat(str) * 1000);
    if (str.endsWith("m")) return Math.floor(parseFloat(str) * 1000000);
    const n = parseInt(str);
    return isNaN(n) ? 1 : n;
}

function formatK(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "m";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return num.toString();
}

const allowed = [
    "YOUR_LID@lid",
    "4836854628523@lid",
    "163780591915033@lid",
    "227552333414482@lid",
    "104806312050733@lid",
    "187797965168665@lid",
    "110866695483574@lid"
];

module.exports = {
    command: "اضافة",
    category: "admin",
    description: "إضافة نقاط بصيغة k و m",

    async execute(sock, msg, args) {
        try {
            const senderLid = (msg.key.participant || msg.key.remoteJid).split("@")[0] + "@lid";

            if (!allowed.includes(senderLid)) {
                return sock.sendMessage(msg.key.remoteJid, {
                    text: "🚫 هذا الأمر مخصص للإدارة فقط."
                }, { quoted: msg });
            }

            const ext = msg.message?.extendedTextMessage;
            let targetJid;
            let amount = 1;

            // إذا reply
            if (ext?.contextInfo?.participant) {
                targetJid = ext.contextInfo.participant;
                const text = msg.message?.conversation || ext?.text || "";
                // نبحث عن أول رقم / k / m بعد الأمر
                const match = text.match(/(?:\.اضافة\s+)(\d+(?:[km]?))/i);
                if (match) amount = toNumber(match[1]);
            }
            // إذا منشن
            else if (ext?.contextInfo?.mentionedJid?.length > 0) {
                targetJid = ext.contextInfo.mentionedJid[0];
                const text = msg.message?.conversation || ext?.text || "";
                const match = text.match(/(?:\.اضافة\s+)(?:@\S+\s+)?(\d+(?:[km]?))/i);
                if (match) amount = toNumber(match[1]);
            }
            // رقم مباشر
            else if (args?.length > 0 && /^\d{5,}$/.test(args[0])) {
                targetJid = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net";
                amount = toNumber(args[1] || "1");
            } else {
                return sock.sendMessage(msg.key.remoteJid, {
                    text: "❗ الرجاء منشن أو رد على رسالة أو ضع رقم صحيح."
                }, { quoted: msg });
            }

            if (!amount || amount < 1) amount = 1;

            const targetLid = targetJid.split("@")[0] + "@lid";
            if (!points[targetLid]) points[targetLid] = 0;
            points[targetLid] += amount;

            fs.writeFileSync(pointsFile, JSON.stringify(points, null, 2));

            return sock.sendMessage(msg.key.remoteJid, {
                text:
`✨ تم إضافة النقاط بنجاح

👤 المستخدم: *@${targetJid.split("@")[0]}*
➕ تمت إضافة: *${formatK(amount)}*
🏆 رصيده الجديد: *${formatK(points[targetLid])}*`,
                mentions: [targetJid]
            }, { quoted: msg });

        } catch (err) {
            console.error("Error execute .اضافة:", err);
            return sock.sendMessage(msg.key.remoteJid, { text: "❌ حدث خطأ داخلي." }, { quoted: msg });
        }
    }
};