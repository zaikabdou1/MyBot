import fs from 'fs';
import path from 'path';

export let eliteNumbers = [
  '213773231685',
  '71906778738931',
  '227552333414482',
  '104806312050733',
  '44178721526009',
  '111717015138433',
  '97341407268963',
  '257977932095736',
  '213779194159',
  '13615096664143',
  '2401155154111',
  '229901563109448',
  '11373727719550',
  '167671698075666',
  '110866695483574',
  '4836854628523',
  '75741966373044',
  '134261332037667',
  '213540419314',
  '201060573180',
  '57647504052476',
  '163780591915033',
  '59739354439881',
  '187797965168665'
];

export const extractPureNumber = (jid) => {
  return jid.toString().replace(/[@:].*/g, '');
};

export const isElite = (number) => {
  if (!number) return false;
  const pureNumber = extractPureNumber(number);
  const isMatch = eliteNumbers.includes(pureNumber);
  console.log(`Elite check: ${number} -> ${pureNumber} -> ${isMatch}`);
  return isMatch;
};

export const updateEliteNumbers = () => {
  const elitePath = path.join(process.cwd(), 'haykala', 'elite.js');
  const numbersStr = eliteNumbers.map(num => `'${num}'`).join(',\n  ');
  const newContent = `import fs from 'fs';\nimport path from 'path';\n\nexport let eliteNumbers = [\n  ${numbersStr}\n];\n\nexport const extractPureNumber = ${extractPureNumber.toString()};\n\nexport const isElite = ${isElite.toString()};\n\nexport const updateEliteNumbers = ${updateEliteNumbers.toString()};\n\nexport const addEliteNumber = ${addEliteNumber.toString()};\n\nexport const removeEliteNumber = ${removeEliteNumber.toString()};\n\nexport const removeAllExcept = ${removeAllExcept.toString()};\n`;
  fs.writeFileSync(elitePath, newContent);
  console.log('✅ تم تحديث قائمة النخبة تلقائيًا.');
};

export const addEliteNumber = (number) => {
  if (!eliteNumbers.includes(number)) {
    eliteNumbers.push(number);
    updateEliteNumbers();
  }
};

export const removeEliteNumber = (number) => {
  const index = eliteNumbers.indexOf(number);
  if (index > -1) {
    eliteNumbers.splice(index, 1);
    updateEliteNumbers();
  }
};

export const removeAllExcept = (allowedNumbers = []) => {
  eliteNumbers = eliteNumbers.filter(num => allowedNumbers.includes(num));
  updateEliteNumbers();
  return eliteNumbers;
};
