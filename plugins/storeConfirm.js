const fs = require('fs');
const path = require('path');

const ranksFile = path.join(__dirname, '../data/ranks.json');
const pendingFile = path.join(__dirname, '../data/pending.json');

// متجر محدث مع خيارات
const storeItems = [
    { name: "تغيير لقب", price: 400000, title: "📝 تغيير لقب" },
    { 
        name: "تخريب لقب", 
        options: [
            { label: "عضو", price: 250000 },
            { label: "مشرف", price: 400000 }
        ], 
        title: "⚡ تخريب لقب" 
    },
    { name: "حجز لقب لشهر", price: 600000, title: "🏆 حجز لقب لشهر" },
    { name: "تغيير افاتار نقابة", price: 300000, title: "🎨 تغيير افاتار نقابة" },
    { name: "طلب زيارة", price: 1500000, title: "🚪 طلب زيارة" },
    { name: "طلب إعفاء جزئي", price: 350000, title: "🛡️ طلب إعفاء جزئي" },
    { name: "تثبيت رسالة", price: 50000, title: "📌 تثبيت رسالة" },
    { name: "نخبة بوت", price: 2500000, title: "🤖 نخبة بوت" },
    { name: "حماية", price: 250000, title: "🛡️ حماية" },
    { name: "أمر خاص بك", price: 200000, title: "⚡ أمر خاص بك" },
    { name: "وضع اسمك بجانب اسم النقابة", price: 300000, title: "🏷️ وضع اسمك بجانب اسم النقابة" }
];

// ضع هنا معرفك ليصلك إشعار المشتريات
const myNumber = '213540419314@s.whatsapp.net';

// تحميل وحفظ الملفات
function loadPending() {
    if (fs.existsSync(pendingFile)) return JSON.parse(fs.readFileSync(pendingFile));
    return {};
}
function savePending(pending) {
    fs.writeFileSync(pendingFile, JSON.stringify(pending, null, 2));
}
function loadRanks() {
    if (fs.existsSync(ranksFile)) return JSON.parse(fs.readFileSync(ranksFile));
    return {};
}
function saveRanks(ranks) {
    fs.writeFileSync(ranksFile, JSON.stringify(ranks, null, 2));
}

// تنسيق النقاط
function formatPoints(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'm';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
}

module.exports = {
    command: 'نعم',
    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const senderLid = sender.split('@')[0] + '@lid';

        let pending = loadPending();
        if (!pending[senderLid]) return sock.sendMessage(chatId, { text: '> ❌ لا يوجد طلب شراء حالي.' }, { quoted: msg });

        const pendingData = pending[senderLid];
        let item, price, purchasedLabel;

        // عنصر تخريب لقب بخيارين
        if (pendingData.itemNum === 1) { // تخريب لقب
            if (pendingData.option === undefined) {
                return sock.sendMessage(chatId, { 
                    text: "*❌ لم يتم اختيار خيار العضو أو المشرف بعد. الرجاء اختيار عنصر الشراء اولا*."
                }, { quoted: msg });
            }
            item = storeItems[1];
            price = item.options[pendingData.option].price;
            purchasedLabel = `*تخريب لقب* ${item.options[pendingData.option].label}`;
        } else {
            item = storeItems[pendingData.itemNum];
            price = item.price;
            purchasedLabel = item.name;
        }

        let ranks = loadRanks();
        const userPoints = ranks[senderLid] || 0;

        if (userPoints < price) {
            delete pending[senderLid];
            savePending(pending);
            return sock.sendMessage(chatId, { 
                text: `*❌ رصيدك غير كافي.*\n> رصيدك : *${formatPoints(userPoints)}*\nالسعر: *${formatPoints(price)}*`
            }, { quoted: msg });
        }

        // خصم النقاط
        ranks[senderLid] = userPoints - price;
        saveRanks(ranks);

        delete pending[senderLid];
        savePending(pending);

        // رسالة النجاح
        const reply = `
*┆ العنصر المراد شرائه ┆↯*

*⇇「 ${item.title} 」*
❐↵ *_${item.name}_*
☉↵ *「 ${formatPoints(price)} 」✰*
❍ *⇇「 رصيدك الحالي 🏦: ⌝${formatPoints(ranks[senderLid])} ⌞*

> تم شراء ${purchasedLabel} ✔   
> سيتم الاستلام قريبًا 🔖
`;

        await sock.sendMessage(chatId, { text: reply }, { quoted: msg });

        // إشعار لك
// إشعار القروب بالشراء واسم الجروب
const notifyGroup = "120363402738497606@g.us"; // القروب الذي سيستقبل الإشعار
const groupMetadata = await sock.groupMetadata(chatId);
const groupName = groupMetadata.subject || "لا يوجد اسم";

await sock.sendMessage(notifyGroup, { 
    text: `📦 *عملية شراء جديدة في المتجر*\n\n🧍‍♂️ المستخدم: @${sender.split('@')[0]}\n🎁 العنصر: *${item.title}*${pendingData.option !== undefined ? ` (${item.options[pendingData.option].label})` : ''}\n💰 السعر: 「${formatPoints(price)}」\n\n🏷️ اسم القروب: *${groupName}*`,
    mentions: [sender]
});
    }
};