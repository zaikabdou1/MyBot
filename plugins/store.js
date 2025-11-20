const fs = require('fs');
const path = require('path');

const ranksFile = path.join(__dirname, '../data/ranks.json');
function loadRanks() { return fs.existsSync(ranksFile) ? JSON.parse(fs.readFileSync(ranksFile)) : {}; }
function formatPoints(num) { if(num>=1e6) return (num/1e6).toFixed(1)+'m'; if(num>=1e3) return (num/1e3).toFixed(1)+'k'; return num.toString(); }

module.exports = {
    command: 'متجر',
    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;
        const ranks = loadRanks();
        const sender = msg.key.participant || msg.key.remoteJid;
        const senderLid = sender.split('@')[0] + '@lid';
        const userPoints = ranks[senderLid] || 0;

        const reply = `*━╼  مــتجر الـمـمـلـكـة 〔 🏰 〕 ╾━* 

✦ ⋅⊰ 💠 *عــناصــر المــتجر* 💠 ⊱ ⋅ ✦

*˼‏①˹┆⇇* *「 تغــيير لقــب 」🖋️*
*˼‏②˹┆⇇*  *تخريــب لــقب ⌝ 3 ايام ⌞ 💥*
*˼‏③˹┆⇇* *「 حــجز لــقب ⌝ شــهــر ⌞ 🏷️*
*˼‏④˹┆⇇* *تغــيير أفــاتار نقابة ⌝ يوم ⌞ 🖼️*
*˼‏⑤˹┆⇇*  *طــلب زيارة  ⌝ يومين ⌞ ✈️*
*˼‏⑥˹┆⇇*  *طــلب إعــفاء جزئــي ⌝ يوم ⌞ 📝*
*˼‏⑦˹┆⇇*  *تثبيت رسالة ⌝ ساعة ⌞ 📌*
*˼‏⑧˹┆⇇* *「 نخبة بوت ⌝ 3 أيام ⌞ 」🪙*
*˼‏⑨˹┆⇇* *「 حماية 」💎*
*˼‏⑩˹┆⇇* *「 إنشاء  أمر خاص بك 」🖥️*
*˼‏⑪˹┆⇇* *「 وضع اسمك على النقابة 」⛩️*

*-----------------------*
 *_للشــراء ⚡ ↯ :_* 
> شــراء رقم_العنصر
 *_مــــثــال 💡 ↯ :_* 
> شــراء 1

❍ *رصيدك الحالي: ⌝ ${formatPoints(userPoints)} ⌞*
`;
        await sock.sendMessage(chatId, { text: reply }, { quoted: msg });
    }
};