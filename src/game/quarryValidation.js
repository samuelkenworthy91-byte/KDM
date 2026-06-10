import { getCreatureBehaviour } from '../data/creatureBehaviours.js';
import { getMonsterBaneId, fightingArts } from '../data/fightingArts.js';
import { quarryList } from '../data/quarries.js';
import { resources } from '../data/resources.js';
import { equipmentList } from '../data/equipment.js';

export function validateQuarryContent() {
  const warnings = [];

  quarryList.forEach(quarry => {
    const behaviour = getCreatureBehaviour(quarry.id);
    const recipes = equipmentList.filter(recipe => recipe.quarryId === quarry.id);
    if (quarry.huntable && !quarry.behaviourId) {
      warnings.push(`${quarry.id}: Missing behaviourId`);
    }
    if (!quarry.tier || !Number.isFinite(quarry.tierRank)) {
      warnings.push(`${quarry.id}: Missing monster tier metadata`);
    }
    if (!quarry.levelScaling || !quarry.tierScaling ||
      !quarry.levelRewardProfile || !quarry.tierRewardProfile) {
      warnings.push(`${quarry.id}: Missing level/tier scaling or reward profiles`);
    }
    if (quarry.huntable && !behaviour) {
      warnings.push(`${quarry.id}: Missing behaviour pack`);
    }
    if (behaviour && new Set(behaviour.intents?.map(intent => intent.id)).size < 4) {
      warnings.push(`${quarry.id}: Behaviour pack has fewer than 4 intents`);
    }
    behaviour?.intents?.forEach(intent => {
      if (!intent.tellText?.trim()) warnings.push(`${quarry.id}/${intent.id}: Intent missing tellText`);
      if (!intent.revealedText?.trim()) warnings.push(`${quarry.id}/${intent.id}: Intent missing revealedText`);
      if (!Array.isArray(intent.effects) || !intent.effects.length) {
        warnings.push(`${quarry.id}/${intent.id}: Intent has no effects`);
      }
    });
    if (behaviour && !behaviour.levelScaling) {
      warnings.push(`${quarry.id}: Behaviour pack missing levelScaling`);
    }
    if (behaviour && (!behaviour.levelIntents?.[1] ||
      !behaviour.levelIntents?.[2] || !behaviour.levelIntents?.[3])) {
      warnings.push(`${quarry.id}: Behaviour pack missing level intent pools`);
    }
    if (quarry.behaviourType === 'unique' && quarry.fallbackBehaviourId) {
      warnings.push(`${quarry.id}: Quarry claims unique behaviour but uses fallback behaviour`);
    }
    const actualType = quarry.huntable
      ? (behaviour && !quarry.fallbackBehaviourId ? 'unique' : 'fallback')
      : 'none';
    if (quarry.behaviourType !== actualType) {
      warnings.push(`${quarry.id}: Quarry info label does not match behaviour type`);
    }
    if (quarry.role === 'quarry' && quarry.huntable && !recipes.length) {
      warnings.push(`${quarry.id}: Quarry has no location/workshop recipes`);
    }
    if (!quarry.uniqueResources?.length) {
      warnings.push(`${quarry.id}: Quarry has no unique resources`);
    }
    if (!quarry.lootByLevel || !Object.values(quarry.lootByLevel).some(level => level?.length)) {
      warnings.push(`${quarry.id}: Quarry has no loot table`);
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
