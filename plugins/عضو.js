const fs = require('fs');
const path = require('path');

const pendingFile = path.join(__dirname, '../data/pending.json');

// تحميل البيانات
function loadPending() {
    if (fs.existsSync(pendingFile)) return JSON.parse(fs.readFileSync(pendingFile));
    return {};
}

function savePending(pending) {
    fs.writeFileSync(pendingFile, JSON.stringify(pending, null, 2));
}

module.exports = {
    command: 'عضو',
    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const senderLid = sender.split('@')[0] + '@lid';

        let pending = loadPending();
        if (!pending[senderLid] || pending[senderLid].itemNum !== 1) {
            return sock.sendMessage(chatId, { text: "❌ لا يوجد طلب تخريب لقب قيد الانتظار." }, { quoted: msg });
        }

        // تعيين الخيار للعضو (option index = 0)
        pending[senderLid].option = 0;
        savePending(pending);

        // إعلام المستخدم أن الخيار تم تحديده ويمكنه استخدام .نعم أو .لا
        const reply = `
> تم اختيار خيار العضو لعنصر *"تخريب لقب"*!

*❐↵   _تخريب لقب العضو المستهدف وتغييره لمدة 3 أيام لقب ساخر و مزاح_*  

> *مع احترام القوانين أولاً*  
> الآن أرسل *.نعم* لإتمام الشراء.  
> ارسل *.لا* لإلغاء الشراء.
`;
        await sock.sendMessage(chatId, { text: reply }, { quoted: msg });
    }
};