const dir = [
  'https://telegra.ph/file/cc6d4378b0f69321fc411.mp4',
  'https://telegra.ph/file/7a9aa4eea49f57a6b4bbd.mp4',
  'https://telegra.ph/file/4a88571acda4a27a63e1a.mp4',
  'https://telegra.ph/file/efc14834b500cc4bdf9c8.mp4',
  'https://telegra.ph/file/c955e7ca813d4de8a19df.mp4',
  'https://telegra.ph/file/7956de26d4668a54e7ae2.mp4',
  'https://telegra.ph/file/ba1d8ef255b92dc55203b.mp4',
  'https://telegra.ph/file/0b6e8ced9862ab599ed29.mp4',
  'https://telegra.ph/file/40026324773266c520930.mp4',
  'https://telegra.ph/file/9b34e07ee9df9dc1e7e99.mp4',
  'https://telegra.ph/file/67b0e866a983ef7c22154.mp4',
  'https://telegra.ph/file/423af6af01b0479955aeb.mp4',
  'https://telegra.ph/file/0f70a2398490d0171e685.mp4',
  'https://telegra.ph/file/f7fab2c5a69c983099964.mp4',
  'https://telegra.ph/file/22a442314b4b3733baf32.mp4',
  'https://telegra.ph/file/7d0b69a05aaf954cf27d5.mp4',
  'https://telegra.ph/file/7a0a811c505b96e737cda.mp4',
  'https://telegra.ph/file/06e3664532dd3e69bbcfa.mp4',
  'https://telegra.ph/file/f83a7ff1219afc2b6cc08.mp4',
  'https://telegra.ph/file/7fbf46c96271b91498006.mp4', 
  'https://telegra.ph/file/d6269a1f7f2bf94a406df.mp4', 
 'https://telegra.ph/file/8034305ce5330ebc11a99.mp4', 
 'https://telegra.ph/file/5c70fbac268fb54ff847e.mp4',  
'https://telegra.ph/file/f2a6bec5b7635364d6768.mp4',  
'https://telegra.ph/file/d7f5799da8e64b9aff5aa.mp4',
  'https://telegra.ph/file/261100ff5fe590b08e35d.mp4',
 'https://telegra.ph/file/6214d68e0da156ef8e54a.mp4',
'https://telegra.ph/file/960bece94cac521c5fd68.mp4',
'https://telegra.ph/file/759c10b0e0a1605ae9716.mp4',
'https://telegra.ph/file/1d4d8d50e19929f4870f6.mp4',
'https://telegra.ph/file/07941ba2e117fea621e5d.mp4',
'https://telegra.ph/file/5fb988f765cd747cde120.mp4',
'https://telegra.ph/file/5ddb8eec9a8d4883dde9c.mp4',
'https://telegra.ph/file/bc4cafca3f25376e7cb2e.mp4',
'https://telegra.ph/file/2243a5e4d437536f7dc8b.mp4',
'https://telegra.ph/file/65ffa16e5eaee2715e713.mp4',
'https://telegra.ph/file/d1ae62ec93fdfbfb44f11.mp4',
'https://telegra.ph/file/539d50387958f5d58e76c.mp4',
'https://telegra.ph/file/aa6c00ce3e0e07d6775dd.mp4',
'https://telegra.ph/file/6a8818cad48e79495390a.mp4',
'https://telegra.ph/fil e/141b6f6cda402a8de3c3e.mp4',
'https://telegra.ph/file/1180e55bd2cf29924c8d2.mp4',
'https://telegra.ph/file/38bde47b6402f2bfb06aa.mp4', 
'https://telegra.ph/file/32344686758198df923a1.mp4',
'https://telegra.ph/file/38bc86129afa59776ec41.mp4',
'https://telegra.ph/file/db3c8672cde1ca5e6552a.mp4',
'https://telegra.ph/file/830101289dc6bd39811bb.mp4',
'https://telegra.ph/file/822c53d16b73d2dde32d3.mp4',
'https://telegra.ph/file/886982e1eebd12cd53395.mp4',
'https://telegra.ph/file/7d2cdc5219bf3a551aa63.mp4',
'https://telegra.ph/file/0ac041f0b5a3afc29e017.mp4',
'https://telegra.ph/file/ea5e5e24b7fb66974473d.mp4',
'https://telegra.ph/file/92c7e1232a8bf6363e4f9.mp4',
'https://telegra.ph/file/961d4145ccc3e7f1c01ad.mp4',
'https://telegra.ph/file/7678a0f51d614c4c16f13.mp4',
'https://telegra.ph/file/0bd52734057a8a8edb95e.mp4',
'https://telegra.ph/file/02ca204f4e6a35f857574.mp4',
'https://telegra.ph/file/fdee2c0ae99a871c879f2.mp4',
'https://telegra.ph/file/c390eb0c4663ec4c58e9f.mp4',
'https://telegra.ph/file/e53d1ca92142e93a9d3b8.mp4',
'https://telegra.ph/file/0584a114a36c10db6a611.mp4',
'https://telegra.ph/file/6b04390e25c21b28b482c.mp4',
'https://telegra.ph/file/de7eda58ae3b945410c19.mp4',
'https://telegra.ph/file/8be0819b1a9ccafd74653.mp4',
'https://telegra.ph/file/3affb77764c72e541c9c7.mp4',
'https://telegra.ph/file/75299bee060e8342daf3c.mp4',
'https://telegra.ph/file/a64a814e561242128d11e.mp4',
'https://telegra.ph/file/28db308ee36082e5bb9fd.mp4',
'https://telegra.ph/file/540faab16cbdcb568b241.mp4',
'https://telegra.ph/file/77d4d5e03015da8411f71.mp4',
'https://telegra.ph/file/cc672124f0b8afe2dd020.mp4',
'https://telegra.ph/file/638a8885025af228f6de6.mp4',
'https://telegra.ph/file/e108c60492a2dc2b9d48f.mp4',
'https://telegra.ph/file/2105fb2cbfee931204e12.mp4',
'https://telegra.ph/file/af4397b8abac12bd81c76.mp4',
'https://telegra.ph/file/703dc161569560d4b9533.mp4',
'https://telegra.ph/file/381cbc23153d4a979300c.mp4',
'https://telegra.ph/file/6fa34083e9d0605de39ca.mp4',
'https://telegra.ph/file/f5fa34862faba7c29875a.mp4',
'https://telegra.ph/file/9419ab2ddbb1f62193e3f.mp4',
'https://telegra.ph/file/5d3493f1eaff7e69d578d.mp4',
'https://telegra.ph/file/a821c3b25bbfa406a4da0.mp4',
'https://telegra.ph/file/9d33ae0a2830d03c820c2.mp4',
'https://telegra.ph/file/a8cb1c29be302dc938dbe.mp4',
'https://telegra.ph/file/a907cc16f4ae28171d0dd.mp4',
'https://telegra.ph/file/f3ac58e739933a6c3654e.mp4',
'https://telegra.ph/file/c5e36f2a11976f3c9b1f9.mp4',
'https://telegra.ph/file/3aba3b86aced4c00e3b05.mp4',
    'https://telegra.ph/file/03cc6997426e99c687e6a.mp4',
    'https://telegra.ph/file/5a9f45e1842da8a02510d.mp4',
    'https://i.imgur.com/OAbYGlz.mp4',
    'https://i.imgur.com/Pad6zvr.mp4',
    'https://telegra.ph/file/5df925bf07f7b35c566a9.mp4',
    'https://telegra.ph/file/296446e7bda8435cff317.mp4',
    'https://telegra.ph/file/fd5af468337aa6b983c63.mp4',
    'https://telegra.ph/file/ab1e1700e30be96ad23ae.mp4',
    'https://i.imgur.com/NILGHXC.mp4',
    'https://i.imgur.com/dztvsNW.mp4',
    'https://telegra.ph/file/b16bae2461e7e8f708714.mp4',
    'https://telegra.ph/file/9e75b87f61514b2ac1891.mp4',
    'https://telegra.ph/file/a0baddc3b867f94343e39.mp4',
    'https://telegra.ph/file/e27c0b4190d2d107fe92a.mp4',
    'https://telegra.ph/file/dc0c1f36245ea087e179c.mp4',
    'https://telegra.ph/file/2b961f5f333cb8e0a71b5.mp4',
    'https://telegra.ph/file/034fbe32c484b4c1fb879.mp4',
    'https://telegra.ph/file/22d52f7feb7f6c8cf48ab.mp4',
    'https://telegra.ph/file/00bb241d3408dc711f4c7.mp4',
    'https://telegra.ph/file/0f519faa00b985a225097.mp4',
    'https://telegra.ph/file/a8ff62adaac7b36e020ef.mp4',
    'https://telegra.ph/file/491d97b8e5aad56ce8a62.mp4',
    'https://telegra.ph/file/bb6f549a4aa04370656af.mp4',
    'https://telegra.ph/file/565c34124ead8a15497b2.mp4',
    'https://telegra.ph/file/9c51f97917ed5fd88a6f6.mp4',
    'https://telegra.ph/file/900377152f73574238d51.mp4',
    'https://telegra.ph/file/e7fb1642655952aea07ec.mp4',
    'https://telegra.ph/file/11bd0474398abde00d99c.mp4',
    'https://telegra.ph/file/85f5a1b00e49f9352461e.mp4',
    'https://telegra.ph/file/f41d31cf3c95623ae311e.mp4',
    'https://i.imgur.com/yPcceZE.mp4',
    'https://telegra.ph/file/996aaeedce16a8b5a7964.mp4',
    'https://telegra.ph/file/3ce27541be63bdad47bdd.mp4',
    'https://telegra.ph/file/b36ef01fc267e4f331caf.mp4',
    'https://i.imgur.com/3DDgCzb.mp4',
    'https://i.imgur.com/8QDdUHo.mp4'
];

// دالة لاستخراج الرقم من JID
function extractNumber(jid) {
  return jid.replace(/[^0-9]/g, '');
}

// الأرقام المسموح لها فقط
const allowedUsers = [
  "213773231685",
  "104806312050733",
  "227552333414482"
];

module.exports = {
  command: ['غراي'],
  description: 'ارسال فيديو عشوائي 🎬',
  category: 'edit',
  usage: 'غراي',
  group: true,

  async execute(conn, msg) {
    const sender = msg.key.participant || msg.key.remoteJid;
    const senderNumber = extractNumber(sender);

    // تحقق من الرقم المسموح
    if (!allowedUsers.includes(senderNumber)) {
      return await conn.sendMessage(msg.key.remoteJid, { text: "🚫 هذا الأمر حصري للأرقام المصرح لها فقط." }, { quoted: msg });
    }

    // اختيار فيديو عشوائي
    const file = dir[Math.floor(Math.random() * dir.length)];

    await conn.sendMessage(msg.key.remoteJid, {
      video: { url: file },
      caption: `「✧|𝑭𝑹𝑶𝑴 𝑨𝑹𝑻𝑯𝑼𝑹⚡|✧」`
    }, { quoted: msg });
  }
};