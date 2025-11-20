const fs = require("fs");
const path = require("path");

const ranksFile = path.join(__dirname, "../data/ranks.json");

function loadJSON(file) {
    try {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, "utf8").trim();
            if (!content) return {};
            return JSON.parse(content);
        }
        return {};
    } catch(e) {
        console.log(`⚠ خطأ بتحميل الملف ${file}, سيتم إعادة إنشاءه فارغ.`);
        return {};
    }
}

function formatBalance(num) {
    if(num >= 1000000) return (num/1000000).toFixed(1) + "m";
    if(num >= 1000) return (num/1000).toFixed(1) + "k";
    return num.toString();
}

const medals = ["🥇","🥈","🥉"];

module.exports = {
    command: "رانك",
    category: "تفاعلي",
    description: "عرض أعلى 5 أعضاء بالرصيد بشكل فخم",

    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;
        const balances = loadJSON(ranksFile);

        const top5 = Object.entries(balances)
            .filter(([lid, bal]) => bal < 10000000)
            .sort((a,b) => b[1]-a[1])
            .slice(0,5)
            .map(([lid, bal], index) => {
                const medal = medals[index] || "";
                const number = `${index+1}️⃣`;
                return `${number} ${medal} *${lid}* — *「 🏦 ${formatBalance(bal)} 」*`;
            });

        const reply = top5.length
            ? `*⫷⋆⋅ ━╼ الرانك الأعلى 🏆 ╾━ ⋅⋆⫸*\n\n${top5.join("\n")}\n\n*شارك وتفاعل حتى تتصدر!*`
            : "❌ لا يوجد أعضاء بالرصيد حتى الآن.";

        await sock.sendMessage(chatId, { text: reply }, { quoted: msg });
    }
};