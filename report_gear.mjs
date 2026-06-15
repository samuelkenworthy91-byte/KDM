import { equipment, equipmentList } from './src/data/equipment.js';
import {
  getGearUnlockState,
  groupGearByArmouryTab
} from './src/utils/gearNormalization.js';

console.log('--- Armoury Deduplication Report ---');
console.log(`Raw merged equipment entries: ${Object.values(equipment).length}`);
console.log(`Final equipmentList size (deduped): ${equipmentList.length}`);

const grouped = groupGearByArmouryTab(equipmentList);
console.log('\n--- Armoury Tabs Created ---');
Object.keys(grouped).sort().forEach(tab => {
  const sources = Object.keys(grouped[tab]);
  const itemCount = Object.values(grouped[tab]).flat().length;
  console.log(`Tab: [${tab}] - ${itemCount} items in ${sources.length} sources`);
  if (tab === 'Unassigned') {
    console.log('  Items in Unassigned:', Object.values(grouped[tab]).flat().map(i => i.name));
  }
});

const foundingSettlement = {
  builtInnovations: ['lanternHearth'],
  discoveredQuarries: ['paleHuntLion'],
  unlockedQuarries: ['paleHuntLion'],
  unlockedRecipeFamilies: ['paleHuntLion']
};
const visibleCount = equipmentList.filter(item =>
  getGearUnlockState(item, foundingSettlement).unlocked
).length;

console.log('\n--- Default Lock State ---');
console.log(`Visible to a founding settlement: ${visibleCount}`);
console.log(`Hidden behind Show locked gear: ${equipmentList.length - visibleCount}`);
