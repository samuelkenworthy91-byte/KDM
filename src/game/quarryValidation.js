import { getCreatureBehaviour } from '../data/creatureBehaviours.js';
import { getMonsterBaneId, fightingArts } from '../data/fightingArts.js';
import { quarryList } from '../data/quarries.js';
import { resources } from '../data/resources.js';

export function validateQuarryContent() {
  const warnings = [];

  quarryList.forEach(quarry => {
    const behaviour = getCreatureBehaviour(quarry.id);
    if (quarry.huntable && !behaviour) {
      warnings.push(`${quarry.id}: no behaviour pack`);
    }
    if (!quarry.uniqueResources?.length) {
      warnings.push(`${quarry.id}: no unique resources`);
    }
    if (!quarry.lootByLevel || !Object.values(quarry.lootByLevel).some(level => level?.length)) {
      warnings.push(`${quarry.id}: no loot table`);
    }
    quarry.uniqueResources?.forEach(resourceId => {
      if (!resources[resourceId]) warnings.push(`${quarry.id}: missing resource ${resourceId}`);
    });
    const baneId = getMonsterBaneId(quarry.id);
    if (!fightingArts[baneId]) warnings.push(`${quarry.id}: no Monster Bane ${baneId}`);
  });

  warnings.forEach(message => console.warn(`[Quarry content] ${message}`));
  return warnings;
}
