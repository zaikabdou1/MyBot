// 📄 حظر-جروب.js
const fs = require('fs');
const path = require('path');

const blockedGroupsFile = path.join(__dirname, '..', 'data', 'blockedGroups.json');

// تأكد من وجود ملف الجروبات الممنوعة
if (!fs.existsSync(blockedGroupsFile)) {
    fs.writeFileSync(blockedGroupsFile, JSON.stringify([]));
}

function loadBlockedGroups() {
    try {
        return JSON.parse(fs.readFileSync(blockedGroupsFile, 'utf8'));
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
    command: 'بان-الشات',
    description: '🚫 يمنع البوت من العمل في جروب معين',
    usage: '.بان-الشات <الجروب الحالي>',
    category: 'DEVELOPER',
    group: true, // يشتغل فقط في الجروبات

    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;

        if (!chatId.endsWith('@g.us')) {
            return sock.sendMessage(chatId, {
                text: '❌ هذا الأمر يعمل فقط داخل الجروبات.'
            }, { quoted: msg });
        }

        let blockedGroups = loadBlockedGroups();

        if (blockedGroups.includes(chatId)) {
            return sock.sendMessage(chatId, {
                text: `⚠️ البوت متوقف بالفعل في هذا الجروب: ${chatId}`
            }, { quoted: msg });
        }

        blockedGroups.push(chatId);
        saveBlockedGroups(blockedGroups);

        await sock.sendMessage(chatId, {
            text: `✅ تم حظر البوت من العمل في هذا الجروب: ${chatId}\n\n⚡ ملاحظة: الأمر .جروبي-متبند يظل يعمل مع أي عضو.`
        }, { quoted: msg });
    }
};