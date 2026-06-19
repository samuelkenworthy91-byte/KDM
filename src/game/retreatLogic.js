import { getRetreatConsequence } from '../data/retreatConsequences.js';
import { quarries } from '../data/quarries.js';
import { resources } from '../data/resources.js';
import { addResources } from './craftingLogic.js';
import {
  createDeathResolution,
  getMemoryBalance,
  queueDeathResolutions
} from './memoryEconomy.js';

function pick(items, random) {
  if (!items.length) return null;
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}

function removeRandomResources(stash, count, predicate, random) {
  const next = { ...stash };
  const removed = [];
  for (let index = 0; index < count; index += 1) {
    const available = Object.keys(next).filter(resourceId =>
      next[resourceId] > 0 && predicate(resourceId)
    );
    const resourceId = pick(available, random);
    if (!resourceId) break;
    next[resourceId] -= 1;
    removed.push(resourceId);
  }
  return { stash: next, removed };
}

function addDisorder(survivor, disorderId) {
  return {
    ...survivor,
    disorders: [...new Set([...(survivor.disorders || []), disorderId])]
  };
}

function addInjury(survivor, injuryId) {
  return {
    ...survivor,
    injuries: [...new Set([...(survivor.injuries || []), injuryId])]
  };
}

function addPanic(survivor) {
  return {
    ...survivor,
    personalDeckAdditions: [
      ...(survivor.personalDeckAdditions || []),
      { cardId: 'panic', sourceType: 'curse', reason: "Coward's Mark" }
    ]
  };
}

function mergePartyConditions(settlementSurvivors, party) {
  return settlementSurvivors.map(survivor => {
    const returning = party.find(member => member.id === survivor.id);
    if (!returning || survivor.alive === false) return survivor;
    const alive = returning.hp > 0 &&
      returning.alive !== false &&
      returning.isAlive !== false;
    return {
      ...survivor,
      hp: alive ? returning.hp : 0,
      alive,
      isAlive: alive,
      boundGear: alive ? [...(returning.boundGear || survivor.boundGear || [])] : [],
      injuries: [...new Set([...(survivor.injuries || []), ...(returning.injuries || [])])],
      scars: [...new Set([...(survivor.scars || []), ...(returning.scars || [])])],
      disorders: [...new Set([...(survivor.disorders || []), ...(returning.disorders || [])])],
      hitLocations: returning.hitLocations || survivor.hitLocations,
      treatmentNotes: returning.treatmentNotes || survivor.treatmentNotes,
      woundHistory: returning.woundHistory || survivor.woundHistory,
      personalDeckAdditions: returning.personalDeckAdditions || survivor.personalDeckAdditions,
      survival: returning.survival ?? survivor.survival,
      causeOfDeath: alive ? survivor.causeOfDeath : returning.causeOfDeath || survivor.causeOfDeath
    };
  });
}

function updateSurvivor(survivors, survivorId, updater) {
  return survivors.map(survivor =>
    survivor.id === survivorId ? updater(survivor) : survivor
  );
}

export function resolveHuntRetreat({
  settlement,
  party = [],
  gatheredResources = [],
  quarryId,
  quarryLevel,
  huntResultId,
  random = Math.random,
  roll
}) {
  const ledger = settlement.huntRewardLedger?.[huntResultId];
  if (ledger?.retreatResolved && ledger.retreatResult) {
    return { settlement, result: ledger.retreatResult, duplicate: true };
  }

  let d20Roll = roll || Math.floor(random() * 20) + 1;
  if (settlement.temporarySettlementModifiers?.nextRetreatWorse) {
    d20Roll = Math.min(d20Roll, Math.floor(random() * 20) + 1);
  }
  const consequence = getRetreatConsequence(d20Roll);
  const newlyDeadParty = party.filter(member =>
    (member.hp <= 0 || member.alive === false || member.isAlive === false) &&
    settlement.survivors?.some(survivor => survivor.id === member.id && survivor.alive !== false)
  );
  let survivors = mergePartyConditions(settlement.survivors || [], party);
  let stash = { ...(settlement.stash || {}) };
  let population = Math.max(0, (settlement.population || 0) - newlyDeadParty.length);
  let settlementMemory = getMemoryBalance(settlement);
  let armory = [...(settlement.armory || [])];
  let keptResources = [...gatheredResources];
  const resourcesLost = [];
  const affectedSurvivorIds = [];
  const affectedDetails = [];
  const graveEntries = newlyDeadParty.map(survivor => ({
    survivorName: survivor.name,
    survivorId: survivor.id,
    killedBy: survivor.causeOfDeath || 'Injuries sustained during the hunt',
    quarryId,
    quarryLevel,
    lanternYear: settlement.lanternYear,
    gearLostCount: survivor.boundGear?.length || 0,
    gearLostNames: (survivor.boundGear || []).map(gear => gear.equipmentId),
    timestamp: new Date().toISOString()
  }));
  let temporarySettlementModifiers = {
    ...(settlement.temporarySettlementModifiers || {}),
    nextRetreatWorse: false
  };
  let quarryRetreatModifiers = { ...(settlement.quarryRetreatModifiers || {}) };

  const living = () => survivors.filter(survivor => survivor.alive !== false && survivor.hp > 0);
  const livingParty = () => party.filter(member =>
    member.alive !== false &&
    member.hp > 0 &&
    survivors.some(survivor => survivor.id === member.id && survivor.alive !== false)
  );
  const chooseLiving = candidates => pick(candidates.length ? candidates : living(), random);
  const changeSurvivor = (survivorId, updater) => {
    survivors = updateSurvivor(survivors, survivorId, updater);
    if (survivorId) affectedSurvivorIds.push(survivorId);
  };

  switch (consequence.id) {
    case 'starvationInTheDark': {
      const victim = chooseLiving(living());
      if (victim) {
        const lostGear = victim.boundGear || [];
        changeSurvivor(victim.id, survivor => ({
          ...survivor,
          alive: false,
          hp: 0,
          boundGear: []
        }));
        population = Math.max(0, population - 1);
        graveEntries.push({
          survivorName: victim.name,
          survivorId: victim.id,
          killedBy: 'Starved after retreat',
          gearLostCount: lostGear.length,
          gearLostNames: lostGear.map(gear => gear.equipmentId),
          timestamp: new Date().toISOString()
        });
        affectedDetails.push(`${victim.name} died from starvation after the retreat.`);
      } else {
        population = Math.max(0, population - 2);
        affectedDetails.push('Population decreased by 2.');
      }
      break;
    }
    case 'theFireGoesLow':
      if (settlementMemory < 2) population = Math.max(0, population - 1);
      settlementMemory = Math.max(0, settlementMemory - 2);
      affectedDetails.push('Settlement Memory decreased by up to 2.');
      break;
    case 'brokenNerve': {
      const target = chooseLiving(living());
      if (target) changeSurvivor(target.id, survivor =>
        addDisorder(survivor, random() < 0.5 ? 'paranoia' : 'nightTerrors'));
      break;
    }
    case 'spoiledSupplies': {
      const removal = removeRandomResources(
        stash,
        3,
        resourceId => Boolean(resources[resourceId]?.basicResource),
        random
      );
      stash = removal.stash;
      resourcesLost.push(...removal.removed);
      if (removal.removed.length) {
        affectedDetails.push(`Resources spoiled: ${removal.removed.join(', ')}.`);
      }
      break;
    }
    case 'theWoundedAreHeavy': {
      const target = chooseLiving(livingParty());
      if (target) changeSurvivor(target.id, survivor => addInjury(survivor, 'crackedRibs'));
      break;
    }
    case 'somethingFollowed':
      temporarySettlementModifiers.followedBySomething =
        (temporarySettlementModifiers.followedBySomething || 0) + 1;
      affectedDetails.push('The next hunt starts with +1 monster aggression.');
      break;
    case 'childrenHeardIt':
      population = Math.max(0, population - 1);
      affectedDetails.push('Population decreased by 1.');
      break;
    case 'lostTools':
      if (armory.length) {
        const gear = pick(armory, random);
        armory = armory.filter(item => item.instanceId !== gear.instanceId);
        affectedDetails.push(`Armory item destroyed: ${gear.equipmentId || gear.instanceId}.`);
      } else {
        const removal = removeRandomResources(
          stash,
          2,
          resourceId => ['scrap', 'bone'].includes(resourceId),
          random
        );
        stash = removal.stash;
        resourcesLost.push(...removal.removed);
        if (removal.removed.length) {
          affectedDetails.push(`Tools lost: ${removal.removed.join(', ')}.`);
        }
      }
      break;
    case 'bitterBlame': {
      const target = chooseLiving(living());
      if (target) changeSurvivor(target.id, survivor =>
        addDisorder(survivor, random() < 0.5 ? 'quietMadness' : 'paranoia'));
      break;
    }
    case 'emptyHands': {
      const lossCount = Math.floor(keptResources.length / 2);
      for (let index = 0; index < lossCount; index += 1) {
        const resourceId = pick(keptResources, random);
        keptResources.splice(keptResources.indexOf(resourceId), 1);
        resourcesLost.push(resourceId);
      }
      break;
    }
    case 'feveredReturn': {
      const target = chooseLiving(livingParty());
      if (target) changeSurvivor(target.id, survivor => addInjury(survivor, 'deepCut'));
      break;
    }
    case 'theSettlementWaitedTooLong':
      temporarySettlementModifiers.delayedWork = true;
      affectedDetails.push('The next innovation costs 1 extra basic resource.');
      break;
    case 'badOmen':
      settlementMemory = Math.max(0, settlementMemory - 1);
      affectedDetails.push('Settlement Memory decreased by 1.');
      break;
    case 'stolenInTheNight': {
      let removal = removeRandomResources(
        stash,
        1,
        resourceId => ['rare', 'strange', 'level3Rare'].includes(resources[resourceId]?.type),
        random
      );
      if (!removal.removed.length) {
        removal = removeRandomResources(stash, 2, () => true, random);
      }
      stash = removal.stash;
      resourcesLost.push(...removal.removed);
      if (removal.removed.length) {
        affectedDetails.push(`Resources stolen: ${removal.removed.join(', ')}.`);
      }
      break;
    }
    case 'cowardsMark': {
      const target = chooseLiving(livingParty());
      if (target) changeSurvivor(target.id, survivor =>
        survivor.disorders?.includes('cowardice')
          ? addPanic(survivor)
          : addDisorder(survivor, 'cowardice'));
      break;
    }
    case 'graveDebt':
      temporarySettlementModifiers.graveDebt = true;
      affectedDetails.push('Grave unrest will increase the cost of the next death.');
      break;
    case 'theBeastLearns':
      quarryRetreatModifiers[quarryId] = {
        ...(quarryRetreatModifiers[quarryId] || {}),
        aggression: (quarryRetreatModifiers[quarryId]?.aggression || 0) + 1
      };
      affectedDetails.push(`${quarries[quarryId]?.name || quarryId} gains +1 aggression next fight.`);
      break;
    case 'fracturedGear': {
      const carriers = livingParty().filter(member => member.boundGear?.length);
      const target = chooseLiving(carriers);
      if (target?.boundGear?.length) {
        const gear = pick(target.boundGear, random);
        changeSurvivor(target.id, survivor => ({
          ...survivor,
          boundGear: (survivor.boundGear || []).filter(item => item.instanceId !== gear.instanceId)
        }));
        affectedDetails.push(`${target.name}'s ${gear.equipmentId || gear.instanceId} was destroyed.`);
      } else {
        const fallback = chooseLiving(livingParty());
        if (fallback) changeSurvivor(fallback.id, survivor => addInjury(survivor, 'brokenFingers'));
      }
      break;
    }
    case 'darkMercy':
      temporarySettlementModifiers.nextRetreatWorse = true;
      affectedDetails.push('The next retreat rolls twice and takes the worse result.');
      break;
    case 'hardLesson': {
      const target = chooseLiving(livingParty());
      if (target) {
        changeSurvivor(target.id, survivor => ({
          ...survivor,
          nextHuntSurvivalBonus: (survivor.nextHuntSurvivalBonus || 0) + 1
        }));
      }
      break;
    }
    default:
      break;
  }

  stash = addResources(stash, keptResources);
  const affectedSurvivorNames = [...new Set(affectedSurvivorIds)]
    .map(survivorId => survivors.find(survivor => survivor.id === survivorId)?.name || survivorId);
  const result = {
    huntResultId,
    roll: d20Roll,
    consequenceId: consequence.id,
    title: consequence.title,
    lore: consequence.lore,
    consequenceText: consequence.effectText,
    gatheredResourcesKept: keptResources,
    resourcesLost,
    affectedSurvivorIds: [...new Set(affectedSurvivorIds)],
    affectedSurvivorNames,
    affectedDetails,
    quarryId,
    quarryLevel
  };
  const historyEntry = {
    type: 'retreat',
    lanternYear: settlement.lanternYear,
    quarryId,
    quarry: quarries[quarryId]?.name || quarryId,
    quarryLevel,
    partySurvivorIds: party.map(survivor => survivor.id),
    partyMembers: party.map(survivor => survivor.name),
    gatheredResourcesKept: keptResources,
    d20Roll,
    consequenceId: consequence.id,
    consequenceText: consequence.effectText,
    affectedSurvivorIds: result.affectedSurvivorIds,
    affectedSurvivors: affectedSurvivorNames,
    affectedResources: resourcesLost,
    affectedDetails,
    details: [
      `Quarry: ${quarries[quarryId]?.name || quarryId} Level ${quarryLevel}`,
      `Party: ${party.map(survivor => survivor.name).join(', ') || 'None'}`,
      `Resources kept: ${keptResources.join(', ') || 'None'}`,
      `D20 roll: ${d20Roll}`,
      `Consequence: ${consequence.effectText}`,
      ...affectedDetails
    ],
    message: `The hunting party retreated. ${consequence.title}.`,
    timestamp: new Date().toISOString()
  };

  const nextSettlement = queueDeathResolutions({
    ...settlement,
    population,
    memories: settlementMemory,
    settlementMemory,
    stash,
    armory,
    survivors,
    livingSurvivors: survivors.filter(survivor => survivor.alive !== false),
    activeSurvivorId: survivors.some(survivor =>
      survivor.id === settlement.activeSurvivorId && survivor.alive !== false
    ) ? settlement.activeSurvivorId : living()[0]?.id || null,
    graveHistory: [...graveEntries, ...(settlement.graveHistory || [])],
    deadSurvivors: (settlement.deadSurvivors || 0) + graveEntries.length,
    temporarySettlementModifiers,
    quarryRetreatModifiers,
    totalRuns: (settlement.totalRuns || 0) + 1,
    settlementHistory: [...(settlement.settlementHistory || []), historyEntry],
    huntRewardLedger: {
      ...(settlement.huntRewardLedger || {}),
      [huntResultId]: {
        ...(settlement.huntRewardLedger?.[huntResultId] || {}),
        huntResultId,
        retreatResolved: true,
        retreatResult: result
      }
    }
  }, graveEntries.map(entry => createDeathResolution({
    id: entry.survivorId,
    name: entry.survivorName,
    causeOfDeath: entry.killedBy
  }, {
    cause: entry.killedBy,
    huntId: huntResultId,
    lanternYear: settlement.lanternYear,
    timestamp: entry.timestamp
  })));

  return {
    duplicate: false,
    result,
    settlement: nextSettlement
  };
}
