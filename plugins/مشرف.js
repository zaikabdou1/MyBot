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
    command: 'مشرف',
    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const senderLid = sender.split('@')[0] + '@lid';

        let pending = loadPending();
        if (!pending[senderLid] || pending[senderLid].itemNum !== 1) {
            return sock.sendMessage(chatId, { text: "❌ لا يوجد طلب تخريب لقب قيد الانتظار." }, { quoted: msg });
        }

        // تعيين الخيار للمشرف (option index = 1)
        pending[senderLid].option = 1;
        savePending(pending);

        // إعلام المستخدم أن الخيار تم تحديده ويمكنه استخدام .نعم أو .لا
        const reply = `
> تم اختيار خيار المشرف لعنصر *"تخريب لقب"*!

*❐↵   _تخريب لقب المشرف بتغييره إلى لقب ساخر لمدة 3 أيام_*  

> *لا يمكنك تغيير ألقاب الأدميرال وما فوق*  
> الآن أرسل *.نعم* لإتمام الشراء.  
> ارسل *.لا* لإلغاء الشراء.
`;
        await sock.sendMessage(chatId, { text: reply }, { quoted: msg });
    }
};