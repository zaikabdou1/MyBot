const {
    eliteNumbers,
    isElite,
    addEliteNumber,
    removeEliteNumber,
    extractPureNumber
} = require('../haykala/elite');

// قائمة النخبة المحمية (أربعة فقط) ممنوع مسهم أو الإضافة إلا منهم
const eliteProtected = [
    "227552333414482",
    "104806312050733",
    "71906778738931",
    "213773231685"
];

module.exports = {
    command: 'نخبة',
    description: 'إضافة أو إزالة رقم من قائمة النخبة أو عرضها (للنخبة فقط)',
    usage: '.نخبة اضف/ازل/عرض + منشن أو رد أو رقم',
    category: 'zarf',    

    async execute(sock, msg) {
        const senderJid = msg.key.participant || msg.participant || msg.key.remoteJid;
        const senderNumber = extractPureNumber(senderJid);

        if (!isElite(senderNumber)) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: '𝒂𝒓𝒆 𝒚𝒐𝒖 𝒐𝒏𝒆 𝒐𝒇 𝒕𝒉𝒆 𝒔𝒍𝒂𝒗𝒆𝒔?'
            }, { quoted: msg });
        }

        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const parts = text.trim().split(/\s+/);
        const action = parts[1];

        if (!action || !['اضف', 'ازل', 'عرض'].includes(action)) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: '❌ 𝒂𝒄𝒕𝒊𝒐𝒏 𝒓𝒆𝒒𝒖𝒊𝒓𝒆𝒅: 𝒎𝒆𝒏𝒕𝒊𝒐𝒏, 𝒓𝒆𝒑𝒍𝒚 𝒐𝒓 𝒆𝒏𝒕𝒆𝒓 𝒂 𝒗𝒂𝒍𝒊𝒅 𝒏𝒖𝒎𝒃𝒆𝒓'
            }, { quoted: msg });
        }

if (action === 'عرض') {
    if (eliteNumbers.length === 0) {
        return sock.sendMessage(msg.key.remoteJid, {
            text: '❌ لا يوجد أرقام نخبة حالياً.'
        }, { quoted: msg });
    }

    // العنوان المزخرف بالبرق وخط
    const title = '⚡ 𝑬𝒍𝒊𝒕𝒆 𝑷𝒓𝒊𝒗𝒊𝒍𝒆𝒈𝒆𝒔 ⚡';
    const border = '═'.repeat(title.length);
    let output = `═ ${title} ═\n\n`;

    // كل رقم في سطر مستقل يبدأ بـ ║
    eliteNumbers.forEach((num, idx) => {
        const fancyNum = `*_${num}_*`; // غليظ ومائل
        output += `║ ${String(idx + 1).padStart(2)}. ${fancyNum}\n`;
    });

    return sock.sendMessage(msg.key.remoteJid, { text: output }, { quoted: msg });
}

        let targetNumber;

        // رقم مباشر
        if (parts[2] && /^\d{5,}$/.test(parts[2])) {
            targetNumber = extractPureNumber(parts[2]);
        }

        // أو من منشن / رد
        if (!targetNumber) {
            const targetJid =
                msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                msg.message?.extendedTextMessage?.contextInfo?.participant;

            if (!targetJid) {
                return sock.sendMessage(msg.key.remoteJid, {
                    text: '❌ 𝒂𝒄𝒕𝒊𝒐𝒏 𝒓𝒆𝒒𝒖𝒊𝒓𝒆𝒅: 𝒎𝒆𝒏𝒕𝒊𝒐𝒏, 𝒓𝒆𝒑𝒍𝒚 𝒐𝒓 𝒆𝒏𝒕𝒆𝒓 𝒂 𝒗𝒂𝒍𝒊𝒅 𝒏𝒖𝒎𝒃𝒆𝒓'
                }, { quoted: msg });
            }

            targetNumber = extractPureNumber(targetJid);
        }

        // التحقق من الإذن بإضافة النخبة (فقط الأربعة المحميين)
        if (action === 'اضف' && !eliteProtected.includes(senderNumber)) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: '⛔ 𝒚𝒐𝒖 𝒂𝒓𝒆 𝒔𝒕𝒊𝒍𝒍 𝒃𝒆𝒍𝒐𝒘 𝒎𝒚 𝒆𝒍𝒊𝒕𝒆, 𝒄𝒂𝒏‘𝒕 𝒂𝒅𝒅'
            }, { quoted: msg });
        }

        // منع إزالة النخبة عن المحميين
        if (action === 'ازل' && eliteProtected.includes(targetNumber)) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: '⛔ 𝒕𝒐𝒑 𝒐𝒇 𝒎𝒚 𝒆𝒍𝒊𝒕𝒆, 𝒖𝒏𝒕𝒐𝒖𝒄𝒉𝒂𝒃𝒍𝒆'
            }, { quoted: msg });
        }

        if (action === 'اضف') {
            if (eliteNumbers.includes(targetNumber)) {
                return sock.sendMessage(msg.key.remoteJid, {
                    text: '𝒃𝒆 𝒐𝒏𝒆 𝒐𝒇 𝒎𝒚 𝒆𝒍𝒊𝒕𝒆'
                }, { quoted: msg });
            }

            addEliteNumber(targetNumber);
            return sock.sendMessage(msg.key.remoteJid, {
                text: '𝒃𝒆 𝒓𝒆𝒂𝒅𝒚 — 𝒚𝒐𝒖 𝒋𝒖𝒔𝒕 𝒋𝒐𝒊𝒏𝒆𝒅 𝒕𝒉𝒆 𝒄𝒊𝒓𝒄𝒍𝒆 𝒐𝒇 𝒆𝒍𝒊𝒕𝒆.'
            }, { quoted: msg });
        }

        if (action === 'ازل') {
            if (!eliteNumbers.includes(targetNumber)) {
                return sock.sendMessage(msg.key.remoteJid, {
                    text: '𝒎𝒆𝒓𝒆𝒍𝒚 𝒂 𝒔𝒍𝒂𝒗𝒆'
                }, { quoted: msg });
            }

            removeEliteNumber(targetNumber);
            return sock.sendMessage(msg.key.remoteJid, {
                text: '𝒔𝒕𝒂𝒚 𝒈𝒓𝒆𝒂𝒕 𝒂𝒏𝒅 𝒔𝒉𝒊𝒏𝒆 𝒊𝒏 𝒎𝒚 𝒆𝒍𝒊𝒕𝒆'
            }, { quoted: msg });
        }
    }
};