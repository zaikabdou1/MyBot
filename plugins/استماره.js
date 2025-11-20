const welcomeGroups = new Map(); // groupId -> { active: boolean, welcomed: Set<string> }
let listenerRegistered = false;

module.exports = {
  command: 'استماره',
  description: 'يرحب بالأعضاء الجدد برسالة استمارة مع صورة القروب.',
  category: 'group',

  async execute(sock, msg) {
    const groupId = msg.key.remoteJid;

    // دالة مساعدة لاستخراج نص الرسالة مهما كان نوعها
    const getText = (m) => {
      const mm = m.message || {};
      if (mm.conversation) return mm.conversation;
      if (mm.extendedTextMessage?.text) return mm.extendedTextMessage.text;
      if (mm.ephemeralMessage?.message?.extendedTextMessage?.text)
        return mm.ephemeralMessage.message.extendedTextMessage.text;
      if (mm.ephemeralMessage?.message?.conversation)
        return mm.ephemeralMessage.message.conversation;
      return '';
    };

    const text = (getText(msg) || '').trim();

    // إنشاء حالة القروب إذا ما كانت موجودة
    if (!welcomeGroups.has(groupId)) {
      welcomeGroups.set(groupId, { active: false, welcomed: new Set() });
    }
    const state = welcomeGroups.get(groupId);

    // تسجيل المستمع العام مرة واحدة فقط
    if (!listenerRegistered) {
      sock.ev.on('group-participants.update', async (update) => {
        try {
          const gid = update.id;
          const gstate = welcomeGroups.get(gid);
          if (!gstate || !gstate.active) return;
          if (update.action !== 'add') return;

          // جلب صورة القروب (مرة لكل دفعة إرسال)
          let groupPic = await sock.profilePictureUrl(gid, 'image').catch(() => null);

          for (const participant of update.participants || []) {
            // منع التكرار خلال دقيقة
            if (gstate.welcomed.has(participant)) continue;

const welcomeForm = `
@${participant.split('@')[0]}

⟐〘↫استمارة الاستقبال➾〙⟐

 *⌬━─⟐─ ⊱•┇«🏰 »┇•⊰ ─⟐─━⌬* 

*⧉┇اللقب:↫* \`〘 〙\`
> اختر لقب من اسم شخصية (أنمي / مانجا / مانهوا) حسب جنسك ليتم مناداتك فيه داخل القروب

*⧉┇الانمي:↫* \`〘 〙\`
> اكتب اسم العمل اللي أخذت منه الشخصية

*⧉┇طرف مين:↫* \`〘 〙\`
> اذكر الحساب أو الشخص أو القناة اللي أعطتك رابط القروب

_*❦ ══════ •⊰❂🏰 ❂⊱• ══════ ❦*_

*『𝑳.𝑵.𝑹⊰🏰⊱𝑳𝑨𝑵𝑵𝑰𝑺𝑻𝑬𝑹』*
`;

            const media = groupPic
              ? { image: { url: groupPic }, caption: welcomeForm }
              : { text: welcomeForm };

            await sock.sendMessage(gid, { ...media, mentions: [participant] });

            // تمييزه كمرحّب به لمدة 60 ثانية لتفادي التكرار
            gstate.welcomed.add(participant);
            setTimeout(() => gstate.welcomed.delete(participant), 60_000);
          }
        } catch (err) {
          console.error('welcome listener error:', err);
        }
      });

      listenerRegistered = true;
    }

    // أوامر التفعيل/الإيقاف داخل نفس القروب
    if (/^استماره-قفل $/i.test(text)) {
      state.active = false;
      state.welcomed.clear();
      await sock.sendMessage(groupId, { text: '⛔ تم تعطيل الترحيب (استماره) في هذا القروب.' });
      return;
    }

    // تفعيل الترحيب لأوّل مرة أو إعادة التفعيل
    if (!state.active) {
      state.active = true;
      await sock.sendMessage(groupId, {
        text:
          '✅ تم تفعيل  (استماره ) لهذا القروب.\n- اكتب "قفل-استماره " لتعطيله.'
      });
    } else {
      // لو مفعّل مسبقًا
      await sock.sendMessage(groupId, { text: 'ℹ️ الترحيب (استماره) مفعّل بالفعل في هذا القروب.' });
    }
  }
};