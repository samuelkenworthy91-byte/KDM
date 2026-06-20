import { cards } from '../data/cards.js';
import {
  generalFightingArts
} from '../data/fightingArts.js';
import { resources } from '../data/resources.js';
import { equipment } from '../data/equipment.js';
import { createSurvivor, createGearInstance } from './saveLogic.js';
import { adjustRestOutcomeOddsForPrinciples } from './principleEffects.js';

const living = survivor => survivor?.alive !== false && Number(survivor?.hp) > 0;
export const DEFAULT_REST_OUTCOME_ODDS = { negative: 30, neutral: 40, positive: 30 };

export function getRestParty(party = [], activeSurvivor = null) {
  const members = (party || []).filter(living);
  if (members.length) return members;
  return living(activeSurvivor) ? [activeSurvivor] : [];
}

function updatePartyMember(party, survivorId, updater) {
  return party.map(survivor => survivor.id === survivorId ? updater(survivor) : survivor);
}

function pickRandom(array) {
  if (!array || !array.length) return null;
  return array[Math.floor(Math.random() * array.length)];
}

export function getRestOutcomeOdds(settlement = {}, baseOdds = DEFAULT_REST_OUTCOME_ODDS) {
  return adjustRestOutcomeOddsForPrinciples(settlement, baseOdds);
}

export function getRestOutcomeCategory(settlement = {}, random = Math.random) {
  const odds = getRestOutcomeOdds(settlement);
  const roll = Math.max(0, Math.min(99.999, random() * 100));
  if (roll < odds.negative) return 'negative';
  if (roll < odds.negative + odds.neutral) return 'neutral';
  return 'positive';
}

function getGearLocationId(item = {}) {
  return item.buildingId || item.locationId || item.craftingLocationId || null;
}

function isActiveRestStopGear(item = {}) {
  return Boolean(
    item.id &&
    item.implemented !== false &&
    !item.deprecated &&
    !item.hiddenFromCrafting &&
    item.itemType !== 'consumable' &&
    item.loadoutCategory !== 'consumable'
  );
}

function getUnlockedRestStopGear(settlement = {}) {
  const unlockedLocations = new Set([
    ...(settlement.builtInnovations || []),
    ...(settlement.unlockedLocations || []),
    ...(settlement.unlockedBuildings || []),
    ...(settlement.unlockedCraftingLocations || [])
  ]);

  return equipment.filter(item =>
    isActiveRestStopGear(item) &&
    unlockedLocations.has(getGearLocationId(item))
  );
}

function isWeaponGear(item = {}) {
  return Boolean(isActiveRestStopGear(item) && item.weaponType && item.itemType === 'weapon');
}

function isArmourGear(item = {}) {
  return Boolean(isActiveRestStopGear(item) && (item.itemType === 'armor' || item.loadoutCategory === 'armor'));
}

function isToolGear(item = {}) {
  return Boolean(isActiveRestStopGear(item) && !isWeaponGear(item) && !isArmourGear(item));
}

function generateRandomSurvivorName() {
  const prefixes = ['Aga', 'Bar', 'Dax', 'Ere', 'Fen', 'Gyl', 'Hek', 'Iva', 'Jor', 'Kyl'];
  const suffixes = ['m', 'n', 'th', 'ra', 'lo', 'us', 'ia', 'da', 'on', 'el'];
  return pickRandom(prefixes) + pickRandom(suffixes);
}

export function resolveRestStopChoice(state, choiceId, options = {}) {
  const sourceParty = Array.isArray(state.runParty) && state.runParty.length
    ? state.runParty
    : getRestParty([], state.runSurvivor);
  const party = getRestParty(sourceParty, state.runSurvivor);
  const activeId = options.survivorId || state.runSurvivor?.id || party[0]?.id;
  const target = party.find(survivor => survivor.id === activeId);
  
  const base = {
    ...state,
    runParty: sourceParty,
    appliedEffects: []
  };

  if (!party.length && choiceId !== 'scoutTheDark') {
    return { ...base, applied: false, reason: 'No living survivor is available.' };
  }

  // 1. Heal Party
  if (choiceId === 'healParty') {
    const healingResults = [];
    const runParty = sourceParty.map(survivor => {
      if (!living(survivor)) return survivor;
      const healAmount = Math.max(1, Math.round(survivor.maxHp * 0.25));
      const beforeHp = Math.max(0, survivor.hp || 0);
      const afterHp = Math.min(survivor.maxHp, beforeHp + healAmount);
      healingResults.push({
        survivorId: survivor.id,
        survivorName: survivor.name,
        beforeHp,
        afterHp,
        maxHp: survivor.maxHp,
        healed: afterHp - beforeHp
      });
      return {
        ...survivor,
        hp: afterHp
      };
    });
    return {
      ...base,
      runParty,
      healingResults,
      applied: true,
      outcomeText: 'The party tends to their wounds and finds a moment of respite.'
    };
  }

  // 2. Share Stories
  if (choiceId === 'shareStories') {
    const reward = options.storyReward || 'survival'; // 'memory' or 'survival'
    if (reward === 'memory') {
      const settlement = {
        ...state.settlement,
        stash: {
          ...(state.settlement?.stash || {}),
          memory: (state.settlement?.stash?.memory || 0) + 1
        }
      };
      return {
        ...base,
        settlement,
        applied: true,
        outcomeText: 'Tales of old provide new insights for the settlement.'
      };
    } else {
      const runParty = sourceParty.map(survivor => {
        if (!living(survivor)) return survivor;
        return {
          ...survivor,
          survival: Math.min(survivor.maxSurvival || 3, (survivor.survival || 0) + 1)
        };
      });
      return {
        ...base,
        runParty,
        applied: true,
        outcomeText: 'Shared determination bolsters everyone\'s will to live.'
      };
    }
  }

  // 3. Practice
  if (choiceId === 'practice') {
    if (!target) return { ...base, applied: false, reason: 'Select a survivor to practice.' };
    const roll = Math.random() * 100;
    if (roll < 25) {
      // Success: random Fighting Art
      const available = generalFightingArts.filter(art =>
        !(target.fightingArts || []).includes(art.id)
      );
      const art = pickRandom(available);
      if (art) {
        const updater = s => ({
          ...s,
          fightingArts: [...(s.fightingArts || []), art.id]
        });
        const runParty = updatePartyMember(sourceParty, target.id, updater);
        const settlement = {
          ...state.settlement,
          survivors: (state.settlement?.survivors || []).map(s =>
            s.id === target.id ? updater(s) : s
          )
        };
        return {
          ...base,
          runParty,
          settlement,
          applied: true,
          outcomeText: `${target.name} discovers a new technique under pressure: ${art.name}.`
        };
      } else {
        return {
          ...base,
          applied: true,
          outcomeText: `${target.name} practices intensely but has reached their limit of traditional techniques.`
        };
      }
    } else {
      // Failure: 1 wound
      const runParty = updatePartyMember(sourceParty, target.id, s => ({
        ...s,
        hp: Math.max(0, (s.hp || 0) - 1)
      }));
      return {
        ...base,
        runParty,
        applied: true,
        outcomeText: `${target.name} pushes too hard and sustains an injury.`
      };
    }
  }

  // 4. Forage
  if (choiceId === 'forage') {
    const outcomeCategory = getRestOutcomeCategory(state.settlement);
    let resourceId = null;
    let outcomeText = '';

    if (outcomeCategory === 'negative') {
      outcomeText = 'The search yielded nothing but dust and shadow.';
    } else if (outcomeCategory === 'neutral') {
      const resourceIds = ['hide', 'organ', 'bone'];
      resourceId = pickRandom(resourceIds);
      outcomeText = resourceId === 'organ'
        ? 'Recovered a preserved organ.'
        : `Found a useful ${resourceId}.`;
    } else {
      // Random quarry resource
      const currentQuarryId = state.currentQuarryId || state.monster?.quarryId;
      const quarryResources = Object.values(resources).filter(r => r.creatureId === currentQuarryId);
      if (quarryResources.length) {
        const r = pickRandom(quarryResources);
        resourceId = r.id;
        outcomeText = `Found a rare ${r.name} from the local area.`;
      } else {
        resourceId = 'scrap';
        outcomeText = 'Found some generic scrap in the absence of local quarry remains.';
      }
    }

    const runResources = [...(state.runResources || [])];
    if (resourceId) runResources.push(resourceId);

    return {
      ...base,
      runResources,
      outcomeCategory,
      odds: getRestOutcomeOdds(state.settlement),
      applied: true,
      outcomeText
    };
  }

  // 5. Scout the Dark
  if (choiceId === 'scoutTheDark') {
    const outcomeCategory = getRestOutcomeCategory(state.settlement);

    if (outcomeCategory === 'negative') {
      // Encounter (standard fight node)
      return {
        ...base,
        outcomeCategory,
        odds: getRestOutcomeOdds(state.settlement),
        applied: true,
        nextNodeType: 'fight',
        outcomeText: 'Scouting reveals a hidden threat! Prepare for an immediate confrontation.'
      };
    } else if (outcomeCategory === 'neutral') {
      // Quiet route
      return {
        ...base,
        outcomeCategory,
        odds: getRestOutcomeOdds(state.settlement),
        applied: true,
        outcomeText: 'The path ahead is clear and quiet. No extra rewards or dangers found.'
      };
    } else if (Math.random() < 0.5) {
      // New Survivor
      const name = generateRandomSurvivorName();
      let survivor = createSurvivor(name); // This gives hp:30, maxHp:30, etc.

      const unlockedGear = getUnlockedRestStopGear(state.settlement);
      const weaponPool = unlockedGear.filter(isWeaponGear);
      const armourPool = unlockedGear.filter(isArmourGear);
      const toolPool = unlockedGear.filter(isToolGear);

      // Helper to pick one random item from an array
      const pickOne = (arr) => {
        if (!arr || arr.length === 0) return null;
        return arr[Math.floor(Math.random() * arr.length)];
      };

      // Pick gear for the survivor: 1 weapon, 2 armour, 1 tool
      let selectedWeapon, selectedArmor1, selectedArmor2, selectedTool;
      let attempts = 0;
      const maxAttempts = 5;
      do {
        selectedWeapon = pickOne(weaponPool);
        selectedArmor1 = pickOne(armourPool);
        selectedArmor2 = pickOne(armourPool); // independent pick (may be same)
        selectedTool = pickOne(toolPool);
        attempts++;
        if (attempts >= maxAttempts) break;
      } while (!selectedWeapon || !selectedArmor1 || !selectedArmor2 || !selectedTool);

      // Create gear instances
      const boundGear = [];
      if (selectedWeapon) boundGear.push(createGearInstance(selectedWeapon.id));
      if (selectedArmor1) boundGear.push(createGearInstance(selectedArmor1.id));
      if (selectedArmor2) boundGear.push(createGearInstance(selectedArmor2.id));
      if (selectedTool) boundGear.push(createGearInstance(selectedTool.id));

      // Final safety: if we still don't have 4 items, fill with any equippable gear from pools (should not happen with fallbacks)
      if (boundGear.length < 4) {
        const needed = 4 - boundGear.length;
        const allPools = [...weaponPool, ...armourPool, ...toolPool];
        for (let i = 0; i < needed; i++) {
          const randomGear = pickOne(allPools);
          if (randomGear) {
            boundGear.push(createGearInstance(randomGear.id));
          }
        }
      }

      // Assign bound gear to survivor
      survivor.boundGear = boundGear;
      // Add survivor to settlement
      const settlement = {
        ...state.settlement,
        survivors: [...(state.settlement?.survivors || []), survivor]
      };
      return {
        ...base,
        settlement,
        outcomeCategory,
        odds: getRestOutcomeOdds(state.settlement),
        applied: true,
        outcomeText: `A lost soul named ${survivor.name} was found wandering the dark and has joined the settlement, equipped with 1 weapon, 2 armour pieces and 1 tool.`
      };
    } else {
      // Random gear from unlocked building
      const availableGear = getUnlockedRestStopGear(state.settlement);
      const gear = pickRandom(availableGear);

      if (gear) {
        const settlement = {
          ...state.settlement,
          armory: [...(state.settlement?.armory || []), createGearInstance(gear.id)]
        };
        return {
          ...base,
          settlement,
          outcomeCategory,
          odds: getRestOutcomeOdds(state.settlement),
          applied: true,
          outcomeText: `Found a discarded but functional ${gear.name}. It has been added to the settlement's armory.`
        };
      } else {
        const runResources = [...(state.runResources || []), 'scrap'];
        return {
          ...base,
          runResources,
          outcomeCategory,
          odds: getRestOutcomeOdds(state.settlement),
          applied: true,
          outcomeText: 'Found useful scrap in the dark. No unlocked non-consumable gear was available to scavenge.'
        };
      }
    }
  }

  return { ...base, applied: false, reason: 'Unknown rest choice.' };
}

export function getForgettableRestCards() { return []; }
export function revealNextMapNodes(map = []) { return map; }
