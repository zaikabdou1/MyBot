// plugins/زيلهم.js
const { eliteNumbers, removeAllExcept, extractPureNumber } = require('../haykala/elite');

// الأربعة أرقام المسموح لهم فقط
const eliteProtected = [
    "227552333414482",
    "104806312050733",
    "71906778738931",
    "213773231685"
];

module.exports = {
    command: 'زيلهم',
    description: 'يمسح كل أرقام النخبة ويترك فقط الأربعة المسموح لهم',
    category: 'admin',

    async execute(sock, msg) {
        const senderJid = msg.key.participant || msg.participant || msg.key.remoteJid;
        const senderNumber = extractPureNumber(senderJid);

        // التحقق من صلاحية المستخدم
        if (!eliteProtected.includes(senderNumber)) {
            return sock.sendMessage(msg.key.remoteJid, {
                text: '⚠️ هذا الأمر لا يُسمح لك باستخدامه.'
            }, { quoted: msg });
        }

        // حذف كل النخبة ما عدا الأربعة المسموح لهم
        const newElite = removeAllExcept(eliteProtected);

        // إرسال النتيجة
        await sock.sendMessage(msg.key.remoteJid, {
            text: `✅ تم حذف جميع أعضاء النخبة ما عدا الأربعة المسموح لهم.\n\n📌 النخبة الحالية (${newElite.length}):\n${newElite.join('\n')}`
        }, { quoted: msg });
    }
};