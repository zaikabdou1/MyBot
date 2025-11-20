const fs = require('fs');
const { join } = require('path');
const { eliteNumbers } = require('../haykala/elite.js');
const { jidDecode } = require('@whiskeysockets/baileys');

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';
const lastReactionPath = join(__dirname, '../data/last_reaction.json');
const configPath = join(__dirname, '../data/reaction_config.json'); // ✅ السطر الناقص

// تأكد إن ملفات التخزين موجودة
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ status: false }));
}
if (!fs.existsSync(lastReactionPath)) {
    fs.writeFileSync(lastReactionPath, JSON.stringify({ last: null }));
}

const reactions = [
  '❤️', '😂', '🔥', '😎', '🥶', '💯', '👍', '👀', '😈', '🧸', '🫩', '🫦', '👏',
  '🥵', '😮‍💨', '🫠', '🧠', '👻', '💀', '☠️', '👽', '🛐', '🙏', '🙃', '🫶',
  '😵‍💫', '🤓', '🫥', '👺', '😼', '🤡', '🦍', '🦖', '🍷', '🍿', '🪦', '👁️‍🗨️'
];

// لو ملف التخزين مش موجود نعمله
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ status: false }));
}
if (!fs.existsSync(lastReactionPath)) {
    fs.writeFileSync(lastReactionPath, JSON.stringify({ last: null }));
}

module.exports = {
    command: 'رياكت',
    description: '✨ تشغيل أو إيقاف الريأكشن التلقائي على رسائل النخبة',
    usage: '.رياكت',
    category: 'DEVELOPER',

    async execute(sock, msg) {
        try {
            const groupJid = msg.key.remoteJid;
            const sender = decode(msg.key.participant || msg.key.remoteJid);
            const senderLid = sender.split('@')[0];

            if (!eliteNumbers.includes(senderLid)) {
                return await sock.sendMessage(groupJid, {
                    text: '🚫 هذا الأمر مخصص فقط للنخبة 🧠.'
                }, { quoted: msg });
            }

            const config = JSON.parse(fs.readFileSync(configPath));
            config.status = !config.status;
            fs.writeFileSync(configPath, JSON.stringify(config));

            await sock.sendMessage(groupJid, {
                text: `🔁 تم ${config.status ? '✅ *تشغيل*' : '❌ *إيقاف*'} الريأكشن التلقائي على رسائل النخبة ${config.status ? '😎🔥' : '💤🚫'}`
            }, { quoted: msg });

            if (config.status) {
                sock.ev.on('messages.upsert', async ({ messages }) => {
                    const m = messages[0];
                    if (!m.message || !m.key || !m.key.remoteJid.endsWith('@g.us')) return;

                    const sender = decode(m.key.participant || m.key.remoteJid);
                    const senderLid = sender.split('@')[0];

                    const confCheck = JSON.parse(fs.readFileSync(configPath));
                    if (!confCheck.status) return;
                    if (!eliteNumbers.includes(senderLid)) return;

                    const text =
                        m.message.conversation ||
                        m.message.extendedTextMessage?.text ||
                        m.message?.imageMessage?.caption ||
                        '';

                    const lowered = text.toLowerCase();
                    let reaction = null;

                    // اختصارات محددة
                    if (lowered.includes('بوت')) reaction = '🤖';
else if (lowered.includes('بحبك')) reaction = pick(['❤️', '🥀', '🌹']);
else if (lowered.includes('احا')) reaction = '✨';
else if (lowered.match(/بيض|بيضان|مبضون|بيضه|مقلي/)) reaction = pick(['🥚', '🫩', '🍳']);
else if (lowered.match(/هكر|هاكر|اختراق|تسريب/)) reaction = pick(['👩🏻‍💻', '🕵️‍♂️', '📂']);
else if (lowered.match(/موت|انتحار|هموت|قتلتني|عزا/)) reaction = pick(['💀', '☠️', '🪦', '⚰️', '👻', '🕯️']);
else if (lowered.match(/جامد|عاش|خطير|فخم|اسطوره|فشيخ|حلو/)) reaction = pick(['🔥', '💯', '💣', '🎯', '🏆']);
else if (lowered.match(/نايم|نعسان|نوم|كسلان/)) reaction = pick(['😴', '🛏️', '🧸', '🥱', '🛌']);
else if (lowered.match(/صحصح|اصحي|قوم|فوق|يلا بقي/)) reaction = pick(['🧼', '🧠', '📢', '⚡', '⏰']);
else if (lowered.match(/كلب|نباح|نباحه|كلابي/)) reaction = pick(['🐶', '🐕', '🐾', '🐕‍🦺']);
else if (lowered.match(/قط|قطه|مياو|ميو|مياوه|بتتمسح/)) reaction = pick(['🐱', '😺', '🐈', '🐾']);
else if (lowered.match(/فلوس|غني|دفعه|تمن|فاتوره/)) reaction = pick(['💸', '🤑', '💳', '🏦']);
else if (lowered.match(/فقير|معنديش|شحات|مفلّس|حالتي صعبه/)) reaction = pick(['🥲', '😞', '💀', '🪙']);
else if (lowered.match(/خايف|مرعوب|قلقان|مش مطمن|خوف|خضه|صرخه|مفزوع/)) reaction = pick(['😱', '😨', '😰', '😓', '👻', '🙀', '😖', '🫣']);
else if (lowered.match(/الله|سبحان|قران|دعا|صلاه|استغفار/)) reaction = pick(['🛐', '🙏', '🕌', '📿']);
else if (lowered.match(/ازيك|عامل ايه|عاملين ايه|اخبارك/)) reaction = pick(['👋', '🤝', '😊', '🙌']);
else if (lowered.match(/ضحك|نكته|هههه|قهقهه|ضحكني|نكت|خخخ/)) reaction = pick(['😂', '🤣', '😆', '😹']);
else if (lowered.match(/دماغ|مخ|تفكير|فكره/)) reaction = pick(['🧠', '💡', '🧩']);
else if (lowered.match(/عيني|نظره|نظارات|عينين/)) reaction = pick(['👀', '🕶️', '👓']);
else if (lowered.match(/حب|عشق|غرام|قلبي|بحبك اوي|عزيزي|ولهان|بحبك موت|قلبك|نبض|دقات/)) reaction = pick(['💘', '💓', '💕', '💞', '💖', '🥰', '💗', '❤️‍🔥', '🫀']);
else if (lowered.match(/كده|خلاص|مفيش|خلصت/)) reaction = pick(['😐', '😑', '😶', '🫥']);
else if (lowered.match(/نفسيه|زعلان|كئيب|مخنوق|فاشل|ضايع|حزين/)) reaction = pick(['😔', '😢', '😟', '☹️', '🥀', '🪦']);
else if (lowered.match(/خرا|وسخ|زبل|قذاره/)) reaction = '💩';
else if (lowered.match(/سهر|سهران|ليلي|اتاخر|منتظر/)) reaction = pick(['🌙', '🌌', '🕓']);
else if (lowered.match(/قمر|منور|شمعه|فوانيس/)) reaction = pick(['🌝', '🕯️', '✨']);
else if (lowered.match(/برد|تلج|كسفه|تجمد/)) reaction = pick(['🥶', '🧊', '❄️']);
else if (lowered.match(/حر|انيكك|نار|مولع/)) reaction = pick(['🥵', '🌋', '🔥']);
else if (lowered.match(/اكل|جعان|جوعان|غدا|مطبخ|مشاوي/)) reaction = pick(['🍔', '🍲', '🍖']);
else if (lowered.match(/مطر|شتا|برده|هطول|رعد|برق/)) reaction = pick(['🌧️', '☔', '🌂', '🌩️', '⚡']);
else if (lowered.match(/دكتور|مريض|مستوصف|عيا|كحه/)) reaction = pick(['🩺', '🤒', '🏥', '💊']);
else if (lowered.match(/كسمك|كس|كسك/)) reaction = pick(['💥', '🖕', '💣', '🔥', '🤬']);
else if (lowered.match(/نيك|انيكك|متنيك|دخل|خش|ادخل/)) reaction = pick(['🍆', '🍑', '🥵', '🫦', '🤤']);
else if (lowered.match(/شرموطه|شرموط/)) reaction = pick(['👠', '💃', '🫦', '🤡', '👅']);
else if (lowered.match(/منيكه|منيك/)) reaction = pick(['🍑', '🍆', '😈', '🖕', '🔥']);
else if (lowered.match(/قحب|قحبه|قحاب/)) reaction = pick(['👄', '🧻', '🤮', '👠', '💣']);
else if (lowered.match(/عرص|عاهره|عاهر/)) reaction = pick(['🎭', '🤬', '🧠', '🫠', '👺']);
else if (lowered.match(/وسخه|وسخ|متوسخ/)) reaction = pick(['💩', '🤢', '🗑️', '🤮', '🧻']);
else if (lowered.match(/زفت|قرف|مقرف|نيله|تنيل|كليت زفت/)) reaction = pick(['🥴', '🤮', '🧻', '😵‍💫', '🫠', '💀', '🪦', '👻']);
else if (lowered.match(/اخي|تافه|بشع|زباله|معفن|مقلب/)) reaction = pick(['🤡', '🙃', '👎', '🗑️', '🪠', '💩', '🤮', '🧻']);
else if (lowered.match(/غبي|اهبل|متخلف/)) reaction = pick(['🙄', '🫠', '🤓', '🥴', '🤡']);
else if (lowered.match(/زق|هز|بوس/)) reaction = pick(['🍑', '🫦', '👅', '🤤', '👄']);
else if (lowered.match(/تناك|متناك|اتناك/)) reaction = pick(['🔥', '🥵', '🍆', '🫦', '🤬']);
else if (lowered.match(/روبوت|الي|ذكاء اصطناعي/)) reaction = pick(['🤖', '🧠', '💻']);
else if (lowered.match(/اه|اوف|ايه ده|صدمه|مصدوم/)) reaction = pick(['😳', '🙀', '😶‍🌫️', '😦', '😵', '🤯']);
else if (lowered.match(/حيوان|خروف|بقره|ماعز|حماره|دجاجه/)) reaction = pick(['🐑', '🐄', '🐐', '🐔']);
else if (lowered.match(/سفر|طياره|مشوار/)) reaction = pick(['✈️', '🧳', '🗺️']);
else if (lowered.match(/دموع|عيطت|عيط/)) reaction = pick(['😭', '😢', '🥺']);
else if (lowered.match(/رايق|هادي/)) reaction = pick(['🧘', '🌿', '😌']);
else if (lowered.match(/جمال|جميله|وسيم/)) reaction = pick(['😍', '💅', '🌟']);
else if (lowered.match(/جحيم|قرف|يخربيت/)) reaction = pick(['👹', '🔥', '💢']);
else if (lowered.match(/كيوت|لطيف/)) reaction = pick(['🐣', '🧸', '🎀']);
else if (lowered.match(/بكرا|قدام|مستقبل/)) reaction = pick(['🕰️', '📅', '⏳']);
else if (lowered.match(/حظ|نصيب|قدر/)) reaction = pick(['🎲', '🪄', '🔮']);
else if (lowered.match(/كلام|حروف|نصوص/)) reaction = pick(['📜', '✒️', '📝']);
else if (lowered.match(/دم|قتال/)) reaction = pick(['🩸', '⚔️', '🧟']);
else if (lowered.match(/عروسه|جواز/)) reaction = pick(['💍', '👰', '🤵']);
else if (lowered.match(/صوتك|سمعني/)) reaction = pick(['🎧', '🔊', '🎤']);
else if (lowered.match(/وقت|ساعه/)) reaction = pick(['🕒', '⏱️', '⌛']);
                    else if (lowered.match(/حيوان|خروف|بقره/)) reaction = pick(['🐑', '🐄']);
                    else {
                        const last = JSON.parse(fs.readFileSync(lastReactionPath)).last;
                        let filtered = reactions.filter(r => r !== last);
                        reaction = filtered[Math.floor(Math.random() * filtered.length)];
                    }

                    // حفظ آخر ريأكشن
                    fs.writeFileSync(lastReactionPath, JSON.stringify({ last: reaction }));

                    await sock.sendMessage(m.key.remoteJid, {
                        react: {
                            text: reaction,
                            key: m.key,
                        }
                    }).catch(() => {});
                });
            }

        } catch (err) {
            console.error('❌ خطأ في أمر ريأكت:', err);
            await sock.sendMessage(msg.key.remoteJid, {
                text: `💥 حصل خطأ:\n\n❗ ${err.message || err.toString()}`
            }, { quoted: msg });
        }
    }
};

// دالة اختيار عشوائي
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}