const fs = require('fs');
const path = require('path');
const pendingFile = path.join(__dirname, '../data/pending.json');

function loadPending() {
    if (fs.existsSync(pendingFile)) return JSON.parse(fs.readFileSync(pendingFile));
    return {};
}

function savePending(pending) {
    fs.writeFileSync(pendingFile, JSON.stringify(pending, null, 2));
}

module.exports = {
    command: 'لا',
    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const senderLid = sender.split('@')[0] + '@lid';

        let pending = loadPending();
        if (!pending[senderLid]) return;

        delete pending[senderLid];
        savePending(pending);

        await sock.sendMessage(chatId, { text: '> ❌ تم إلغاء عملية الشراء.' }, { quoted: msg });
    }
};