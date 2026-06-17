import { auditEquipmentCardSignatures } from '../src/utils/equipmentCardAudit.js';

const groups = auditEquipmentCardSignatures({ minimumGroupSize: 2 });
const top = groups.slice(0, Number(process.argv[2]) || 12);

console.log(`Duplicate mechanical-signature groups: ${groups.length}`);
top.forEach((group, index) => {
  console.log(`\n#${index + 1} signature: ${group.signature}`);
  console.log(`cards: ${group.count}`);
  console.log(`equipment: ${group.equipmentNames.join(' | ')}`);
  console.log(`card names: ${group.cardNames.join(' | ')}`);
  console.log('current effects:');
  group.currentEffects.forEach(entry => {
    console.log(`- ${entry.equipmentName} / ${entry.cardName}: ${JSON.stringify(entry.effects)}`);
  });
});

console.log('\nIntentionally allowed groups: small starter/basic duplicates and explicitly documented placeholders only.');
