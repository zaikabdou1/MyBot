const fs = require('fs');
const path = require('path');

const pendingFile = path.join(__dirname, '../data/pending.json');
const ranksFile = path.join(__dirname, '../data/ranks.json');

const storeItems = [
    { name: "تغيير لقب", price: 400000, description: ["تغيير لقبك من شخصية الى شخصية اخرى خاصة بك"] },
    { name: "تخريب لقب", price: null, description: [] }, // الوصف هنا يتم عبر الخيارات
    { name: "حجز لقب لشهر", price: 600000, description: ["حجز لقب حصري خاص بك لمدة 3 أيام"] },
    { name: "تغيير أفاتار نقابة", price: 300000, description: ["تغيير صورة النقابة الخاصة بك لمدة يوم واحد"] },
    { name: "طلب زيارة", price: 1500000, description: ["زيارة لاحد النقابات الخاصة بالمملكة لمدة يومين*\n*ملاحظة: بايام الزيارة فقط"] },
    { name: "طلب إعفاء جزئي", price: 350000, description: ["إعفاء من الحقوق مثل النشر أو التفاعل لمدة يوم واحد\n≛ تنبيه: للمشرفين فقط ≛"] },
    { name: "تثبيت رسالة", price: 50000, description: ["تثبيت رسالة خاصة بك في النقابة لمدة ساعة مع احترام القوانين"] },
    { name: "نخبة بوت", price: 2500000, description: ["إضافتك للنخبة الخاصة بالبوت وفتح أوامر مميزة خاصة لك ~حصري~"] },
    { name: "حماية", price: 250000, description: ["حماية المشتري من إمكانية تخريب لقبه"] },
    { name: "أمر خاص بك", price: 200000, description: ["تصميم أمر باسمك مثل .لقبك ليكون خاص بك"] },
    { name: "وضع اسمك بجانب اسم النقابة", price: 300000, description: ["وضع اللقب الخاص بك جنب اسم النقابة لمدة يوم كامل بحيث يظهر للكل"] }
];

function loadPending() { return fs.existsSync(pendingFile) ? JSON.parse(fs.readFileSync(pendingFile)) : {}; }
function savePending(pending) { fs.writeFileSync(pendingFile, JSON.stringify(pending, null, 2)); }
function loadRanks() { return fs.existsSync(ranksFile) ? JSON.parse(fs.readFileSync(ranksFile)) : {}; }
function saveRanks(ranks) { fs.writeFileSync(ranksFile, JSON.stringify(ranks, null, 2)); }
function formatPoints(num) { if(num>=1e6) return (num/1e6).toFixed(1)+'m'; if(num>=1e3) return (num/1e3).toFixed(1)+'k'; return num.toString(); }

module.exports = {
    command: 'شراء',
    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;
        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
        if(!text) return;

        const sender = msg.key.participant || msg.key.remoteJid;
        const senderLid = sender.split('@')[0] + '@lid';

        const parts = text.trim().split(/\s+/);
        if(parts.length < 2) return sock.sendMessage(chatId, { text: '❌ اكتب رقم العنصر الذي تريد شراؤه.' }, { quoted: msg });

        const itemNum = parseInt(parts[1]);
        if(isNaN(itemNum) || itemNum < 1 || itemNum > storeItems.length)
            return sock.sendMessage(chatId, { text: '❌ الرقم غير صالح.' }, { quoted: msg });

        const item = storeItems[itemNum - 1];
        const ranks = loadRanks();
        const userPoints = ranks[senderLid] || 0;
        let pending = loadPending();

        // عنصر تخريب لقب
        if(item.name === "تخريب لقب") {
            pending[senderLid] = { itemNum: itemNum - 1, option: null }; 
            savePending(pending);
            const reply = `
*╼ ✦ ⋅⊰ العنصر المراد شرائه ⊱ ✦ ⋅╾*

*• ━ ❃「 تخريب لقب 」❃ ━ •*

 ①↵  *تخريب لقب أحد الأعضاء — السعر: ⌝ 250k ⌞*

 ②↵  *تخريب لقب أحد المشرفين — السعر: ⌝ 400k ⌞*

❍ *⇇  رصيدك الحالي: ⌝ ${formatPoints(userPoints)} ⌞*

> اختر *.عضو* لتخريب لقب لعضو / *.مشرف* لتخريب لقب لمشرف
`;
            return sock.sendMessage(chatId, { text: reply }, { quoted: msg });
        }

        // عناصر عادية
        pending[senderLid] = { itemNum: itemNum - 1 };
        savePending(pending);

        const reply = `
*╼ ✦ ⋅⊰ العنصر المراد شرائه ⊱ ✦ ⋅╾*

*• ━ ❃「 ${item.name} 」❃ ━ •*

❐↵   *${item.description[0]}*

☉↵ ⇇  *السعر: ⌝ ${formatPoints(item.price)} ⌞* ✰

❍ ⇇ *رصيدك الحالي: ⌝ ${formatPoints(userPoints)} ⌞*

> هل أنت متأكد من الشراء?
> أرسل: *.نعم* أو *.لا*
`;
        await sock.sendMessage(chatId, { text: reply }, { quoted: msg });
    }
};