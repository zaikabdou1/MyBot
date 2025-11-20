const fs = require('fs');
const path = require('path');

const blockedGroupsFile = path.join(__dirname, '..', 'data', 'blockedGroups.json');

// تأكد أن الملف موجود دائماً
if (!fs.existsSync(blockedGroupsFile)) {
    fs.writeFileSync(blockedGroupsFile, JSON.stringify([]));
}

function loadBlockedGroups() {
    try {
        const data = fs.readFileSync(blockedGroupsFile, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        console.error('❌ خطأ في قراءة blockedGroups.json:', err.message);
        return [];
    }
}

function saveBlockedGroups(list) {
    try {
        fs.writeFileSync(blockedGroupsFile, JSON.stringify(list, null, 2));
    } catch (err) {
        console.error('❌ خطأ في حفظ blockedGroups.json:', err.message);
    }
}

module.exports = {
    command: 'فك-بان',
    description: '🔓 إلغاء حظر البوت عن الجروب الحالي',
    usage: '.فك-بان',
    category: 'DEVELOPER',
    group: true,

    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;

        // تأكد أننا داخل جروب
        if (!chatId.endsWith('@g.us')) {
            return sock.sendMessage(chatId, {
                text: '❌ هذا الأمر يعمل فقط داخل الجروبات.'
            }, { quoted: msg });
        }

        let blockedGroups = loadBlockedGroups();
        const index = blockedGroups.findIndex(g => g.trim() === chatId.trim());

        if (index === -1) {
            return sock.sendMessage(chatId, {
                text: `⚠️ هذا الجروب غير محظور أساساً.`
            }, { quoted: msg });
        }

        // إزالة الجروب من القائمة
        blockedGroups.splice(index, 1);
        saveBlockedGroups(blockedGroups);

        await sock.sendMessage(chatId, {
            text: `✅ تم فك الحظر عن هذا الجروب بنجاح!\nيمكن الآن للبوت العمل مجددًا هنا.`
        }, { quoted: msg });
    }
};