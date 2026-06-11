import {
  getTimelineEventForYear,
  quietYearSummaries
} from '../data/timelineEvents.js';
import { getNemesisForLanternYear } from '../data/nemesisEncounters.js';
import { quarries } from '../data/quarries.js';
import { getProficiencyLevel } from '../data/weaponProficiency.js';

function addUnique(values, value) {
  return [...new Set([...(values || []), value])];
}

function updateNominatedSurvivors(settlement, nominatedSurvivorIds, updater) {
  const ids = new Set(nominatedSurvivorIds || []);
  return {
    ...settlement,
    survivors: settlement.survivors.map(survivor =>
      ids.has(survivor.id) && survivor.alive !== false ? updater(survivor) : survivor
    )
  };
}

function effectText(effect, detail = '') {
  const labels = {
    gainSettlementMemory: `Settlement Memory +${effect.amount}`,
    loseSettlementMemory: `Settlement Memory -${effect.amount}`,
    gainPopulation: `Population +${effect.amount}`,
    losePopulation: `Population -${effect.amount}`,
    gainResource: `Gained ${effect.amount} ${effect.resourceId}`,
    loseResource: `Lost up to ${effect.amount} ${effect.resourceId}`,
    addInnovationToPool: `Innovation path added: ${effect.innovationId}`,
    removeInnovation: `Innovation lost: ${effect.innovationId}`,
    damageBuilding: 'A settlement location was damaged',
    repairBuilding: 'A damaged settlement location was repaired',
    unlockBuilding: `Location unlocked: ${effect.buildingId}`,
    addSurvivorTrait: `Survivor trait gained: ${effect.traitId}`,
    addSurvivorDisorder: `Survivor disorder gained: ${effect.disorderId}`,
    addSurvivorScar: `Survivor scar gained: ${effect.scarId}`,
    addSurvivorInjury: `Survivor injury gained: ${effect.injuryId}`,
    addSurvivorCard: `Personal card gained: ${effect.cardId}`,
    removeSurvivorCard: 'One personal card was removed',
    addPanicToSurvivorDeck: `Survivor gained ${effect.amount || 1} Panic`,
    removePanicFromSurvivorDeck: `Survivor removed ${effect.amount || 1} Panic`,
    addPanicToAllSurvivorDecks: `All living survivors gained ${effect.amount || 1} Panic`,
    removePanicFromAllSurvivorDecks: `All living survivors removed up to ${effect.amount || 1} Panic`,
    gainWeaponXp: `${effect.weaponType} proficiency +${effect.amount || 1} XP`,
    addCampaignPressure: `Campaign pressure +${effect.amount}`,
    reduceCampaignPressure: `Campaign pressure -${effect.amount}`,
    setFutureEventFlag: `Future path changed: ${effect.flag}`,
    unlockQuarryRumour: `A quarry rumour was uncovered`,
    addTemporaryHuntModifier: `Future hunt modifier: ${effect.modifier}`,
    healSurvivor: `Nominated survivor healed ${effect.amount}`,
    healAllSurvivors: `Living survivors healed ${effect.amount}`,
    destroyArmoryItem: 'One armory item was buried',
    makeSurvivorUnavailable: 'Nominated survivor will miss one hunt',
    addHistory: effect.text
  };
  return detail || labels[effect.type] || effect.type;
}

function removePanic(additions, amount) {
  let remaining = amount;
  return (additions || []).filter(addition => {
    const cardId = addition.cardId || addition;
    if (cardId === 'panic' && remaining > 0) {
      remaining -= 1;
      return false;
    }
    return true;
  });
}

function applySurvivorEffect(settlement, effect, nominatedSurvivorIds) {
  return updateNominatedSurvivors(settlement, nominatedSurvivorIds, survivor => {
    if (effect.type === 'addSurvivorTrait') {
      return { ...survivor, traits: addUnique(survivor.traits, effect.traitId) };
    }
    if (effect.type === 'addSurvivorDisorder') {
      return { ...survivor, disorders: addUnique(survivor.disorders, effect.disorderId) };
    }
    if (effect.type === 'addSurvivorScar') {
      return { ...survivor, scars: addUnique(survivor.scars, effect.scarId) };
    }
    if (effect.type === 'addSurvivorInjury') {
      return { ...survivor, injuries: addUnique(survivor.injuries, effect.injuryId) };
    }
    if (effect.type === 'addSurvivorCard' || effect.type === 'addPanicToSurvivorDeck') {
      const cardId = effect.type === 'addSurvivorCard' ? effect.cardId : 'panic';
      const amount = effect.amount || 1;
      return {
        ...survivor,
        personalDeckAdditions: [
          ...(survivor.personalDeckAdditions || []),
          ...Array(amount).fill(null).map(() => ({
            cardId,
            sourceType: cardId === 'panic' ? 'curse' : 'timeline'
          }))
        ]
      };
    }
    if (effect.type === 'removeSurvivorCard') {
      return {
        ...survivor,
        personalDeckAdditions: (survivor.personalDeckAdditions || []).slice(1)
      };
    }
    if (effect.type === 'removePanicFromSurvivorDeck') {
      return {
        ...survivor,
        personalDeckAdditions: removePanic(
          survivor.personalDeckAdditions, effect.amount || 1
        ),
        permanentNegativeCards: removePanic(
          survivor.permanentNegativeCards, effect.amount || 1
        )
      };
    }
    if (effect.type === 'gainWeaponXp') {
      const current = survivor.weaponProficiency?.[effect.weaponType] || { xp: 0 };
      const xp = current.xp + (effect.amount || 1);
      return {
        ...survivor,
        weaponProficiency: {
          ...survivor.weaponProficiency,
          [effect.weaponType]: {
            xp,
            level: getProficiencyLevel(xp),
            mastered: getProficiencyLevel(xp) >= 3
          }
        }
      };
    }
    if (effect.type === 'healSurvivor') {
      return { ...survivor, hp: Math.min(survivor.maxHp, survivor.hp + effect.amount) };
    }
    if (effect.type === 'makeSurvivorUnavailable') {
      return {
        ...survivor,
        unavailableHunts: Math.max(survivor.unavailableHunts || 0, effect.hunts || 1)
      };
    }
    return survivor;
  });
}

export function applyTimelineEffects(settlement, effects = [], context = {}) {
  let next = {
    ...settlement,
    stash: { ...(settlement.stash || {}) },
    timelineFlags: { ...(settlement.timelineFlags || {}) },
    nextRunBonus: { ...(settlement.nextRunBonus || {}) },
    timelineDamagedBuildings: { ...(settlement.timelineDamagedBuildings || {}) }
  };
  const appliedEffects = [];
  const nominatedSurvivorIds = context.nominatedSurvivorIds || [];

  effects.forEach(effect => {
    if (effect.type === 'gainSettlementMemory') {
      next.settlementMemory = (next.settlementMemory || 0) + effect.amount;
    } else if (effect.type === 'loseSettlementMemory') {
      next.settlementMemory = Math.max(0, (next.settlementMemory || 0) - effect.amount);
    } else if (effect.type === 'gainPopulation') {
      next.population += effect.amount;
    } else if (effect.type === 'losePopulation') {
      const ward = next.timelineFlags.populationLossWard || 0;
      if (ward > 0) {
        next.timelineFlags.populationLossWard = ward - 1;
        appliedEffects.push('A previous choice prevented population loss.');
        return;
      }
      next.population = Math.max(0, next.population - effect.amount);
    } else if (effect.type === 'gainResource') {
      next.stash[effect.resourceId] = (next.stash[effect.resourceId] || 0) + effect.amount;
    } else if (effect.type === 'loseResource') {
      next.stash[effect.resourceId] = Math.max(0, (next.stash[effect.resourceId] || 0) - effect.amount);
    } else if (effect.type === 'addInnovationToPool') {
      next.innovationDeckState = {
        ...next.innovationDeckState,
        availableInnovationPoolIds: addUnique(
          next.innovationDeckState.availableInnovationPoolIds,
          effect.innovationId
        )
      };
    } else if (effect.type === 'removeInnovation') {
      next.builtInnovations = (next.builtInnovations || []).filter(id => id !== effect.innovationId);
      next.innovationDeckState = {
        ...next.innovationDeckState,
        builtInnovationIds: (next.innovationDeckState.builtInnovationIds || [])
          .filter(id => id !== effect.innovationId)
      };
    } else if (effect.type === 'damageBuilding') {
      const buildingId = (next.builtInnovations || []).find(id =>
        id !== 'lanternHearth' && !next.timelineDamagedBuildings[id]
      );
      if (buildingId) {
        next.timelineDamagedBuildings[buildingId] =
          next.lanternYear + (effect.duration || 1);
        appliedEffects.push(effectText(effect, `${buildingId} was damaged until a later Lantern Year.`));
        return;
      }
    } else if (effect.type === 'repairBuilding') {
      const buildingId = Object.keys(next.timelineDamagedBuildings)[0];
      if (buildingId) {
        delete next.timelineDamagedBuildings[buildingId];
        appliedEffects.push(effectText(effect, `${buildingId} was repaired.`));
        return;
      }
    } else if (effect.type === 'unlockBuilding') {
      next.builtInnovations = addUnique(next.builtInnovations, effect.buildingId);
    } else if ([
      'addSurvivorTrait', 'addSurvivorDisorder', 'addSurvivorScar',
      'addSurvivorInjury', 'addSurvivorCard', 'removeSurvivorCard',
      'addPanicToSurvivorDeck', 'removePanicFromSurvivorDeck',
      'gainWeaponXp', 'healSurvivor', 'makeSurvivorUnavailable'
    ].includes(effect.type)) {
      next = applySurvivorEffect(next, effect, nominatedSurvivorIds);
    } else if (effect.type === 'addPanicToAllSurvivorDecks') {
      const livingIds = next.survivors.filter(s => s.alive !== false).map(s => s.id);
      next = applySurvivorEffect(next, {
        type: 'addPanicToSurvivorDeck',
        amount: effect.amount
      }, livingIds);
    } else if (effect.type === 'removePanicFromAllSurvivorDecks') {
      const livingIds = next.survivors.filter(s => s.alive !== false).map(s => s.id);
      next = applySurvivorEffect(next, {
        type: 'removePanicFromSurvivorDeck',
        amount: effect.amount
      }, livingIds);
    } else if (effect.type === 'healAllSurvivors') {
      next.survivors = next.survivors.map(survivor => survivor.alive === false
        ? survivor
        : { ...survivor, hp: Math.min(survivor.maxHp, survivor.hp + effect.amount) });
    } else if (effect.type === 'addCampaignPressure') {
      next.campaignPressure = Math.max(0, (next.campaignPressure || 0) + effect.amount);
    } else if (effect.type === 'reduceCampaignPressure') {
      next.campaignPressure = Math.max(0, (next.campaignPressure || 0) - effect.amount);
    } else if (effect.type === 'setFutureEventFlag') {
      next.timelineFlags[effect.flag] = effect.value;
    } else if (effect.type === 'unlockQuarryRumour' && quarries[effect.quarryId]?.role === 'quarry') {
      next.discoveredQuarries = addUnique(next.discoveredQuarries, effect.quarryId);
      next.unlockedQuarries = addUnique(next.unlockedQuarries, effect.quarryId);
    } else if (effect.type === 'addTemporaryHuntModifier') {
      next.nextRunBonus[effect.modifier] =
        (next.nextRunBonus[effect.modifier] || 0) + effect.amount;
    } else if (effect.type === 'destroyArmoryItem') {
      next.armory = (next.armory || []).slice(effect.amount || 1);
    } else if (effect.type === 'addHistory') {
      next.rumourTexts = addUnique(next.rumourTexts, effect.text);
    }
    appliedEffects.push(effectText(effect));
  });

  return { settlement: next, appliedEffects };
}

function createHistoryEntry(eventData, year, overrides = {}) {
  return {
    lanternYear: year,
    id: eventData.id,
    name: eventData.title,
    title: eventData.title,
    description: eventData.description,
    type: eventData.eventType,
    impactLevel: eventData.impactLevel || 1,
    choiceId: null,
    timestamp: new Date().toISOString(),
    ...overrides
  };
}

export function applyLanternYearTimeline(settlement, year) {
  settlement = {
    ...settlement,
    survivors: settlement.survivors.map(survivor => ({
      ...survivor,
      unavailableHunts: Math.max(0, (survivor.unavailableHunts || 0) - 1)
    })),
    timelineDamagedBuildings: Object.fromEntries(
      Object.entries(settlement.timelineDamagedBuildings || {})
        .filter(([, repairYear]) => repairYear > year)
    )
  };
  const nemesis = getNemesisForLanternYear(year);
  const scheduled = getTimelineEventForYear(year, settlement);
  const majorTooSoon = ['major', 'disaster', 'finale'].includes(scheduled?.eventType) &&
    year - (settlement.lastMajorTimelineEventYear ?? -99) <= 1;
  const eventData = nemesis || majorTooSoon ? null : scheduled;

  if (eventData) {
    const historyEntry = createHistoryEntry(eventData, year);
    return {
      ...settlement,
      timelineHistory: [...(settlement.timelineHistory || []), historyEntry],
      lastTimelineEvent: historyEntry,
      pendingTimelineEvent: {
        ...eventData,
        name: eventData.title,
        lanternYear: year
      },
      pendingNemesisEncounter: nemesis
        ? {
            nemesisId: nemesis.id,
            lanternYear: year,
            stage: 'lore',
            selectedSurvivorId: null,
            memorySpent: false,
            healingSpent: false
          }
        : settlement.pendingNemesisEncounter || null
    };
  }

  const quiet = quietYearSummaries[year % quietYearSummaries.length];
  const pressureEffects = (settlement.campaignPressure || 0) >= 3
    ? [{ type: 'addTemporaryHuntModifier', modifier: 'nextCombatMonsterBonusHp', amount: 1, uses: 1 }]
    : [];
  const quietResult = nemesis
    ? { settlement, appliedEffects: [] }
    : applyTimelineEffects(settlement, [...quiet.effects, ...pressureEffects], { quietYear: true });
  const description = nemesis
    ? 'A deliberate threat reaches the edge of the lanternlight. Ordinary settlement stories fall silent.'
    : `${quiet.description}${pressureEffects.length ? ' The pressure beyond the settlement hardens the next hunt.' : ''}`;
  const historyEntry = createHistoryEntry({
    ...quiet,
    eventType: nemesis ? 'nemesis' : 'quiet',
    impactLevel: nemesis ? 4 : 1
  }, year, { description, appliedEffects: quietResult.appliedEffects });

  return {
    ...quietResult.settlement,
    timelineHistory: [...(quietResult.settlement.timelineHistory || []), historyEntry],
    settlementHistory: [...(quietResult.settlement.settlementHistory || []), {
      type: nemesis ? 'nemesisReveal' : 'quietYear',
      lanternYear: year,
      title: historyEntry.title,
      text: description,
      effects: quietResult.appliedEffects,
      timestamp: historyEntry.timestamp
    }],
    lastTimelineEvent: historyEntry,
    pendingTimelineEvent: null,
    pendingNemesisEncounter: nemesis
      ? {
          nemesisId: nemesis.id,
          lanternYear: year,
          stage: 'lore',
          selectedSurvivorId: null,
          memorySpent: false,
          healingSpent: false
        }
      : quietResult.settlement.pendingNemesisEncounter || null
  };
}

export function resolveLanternTimelineChoice(settlement, choiceId, nominatedSurvivorIds = []) {
  const pending = settlement.pendingTimelineEvent;
  const choice = pending?.choices?.find(item => item.id === choiceId);
  if (!pending || !choice) return settlement;
  if (choice.requiresNomination && !nominatedSurvivorIds.length) return settlement;

  const result = applyTimelineEffects(settlement, choice.effects, { nominatedSurvivorIds });
  const nominatedNames = result.settlement.survivors
    .filter(survivor => nominatedSurvivorIds.includes(survivor.id))
    .map(survivor => survivor.name);
  const timelineHistory = (result.settlement.timelineHistory || []).map(entry =>
    entry.lanternYear === pending.lanternYear && entry.id === pending.id
      ? {
          ...entry,
          choiceId: choice.id,
          choiceText: choice.label,
          nominatedSurvivorIds,
          nominatedSurvivorNames: nominatedNames,
          appliedEffects: result.appliedEffects
        }
      : entry
  );
  const isMajor = ['major', 'disaster', 'finale'].includes(pending.eventType);
  const settlementHistoryEntry = {
    type: 'timelineEvent',
    lanternYear: pending.lanternYear,
    eventId: pending.id,
    title: pending.title,
    chosenOption: choice.label,
    nominatedSurvivorIds,
    nominatedSurvivorNames: nominatedNames,
    effects: result.appliedEffects,
    historyText: pending.historyText,
    timestamp: new Date().toISOString()
  };
  const lastTimelineResult = {
    eventId: pending.id,
    title: pending.title,
    choiceLabel: choice.label,
    storyText: choice.storyText,
    nominatedSurvivorNames: nominatedNames,
    appliedEffects: result.appliedEffects
  };

  return {
    ...result.settlement,
    timelineHistory,
    lastTimelineEvent: timelineHistory.find(entry =>
      entry.lanternYear === pending.lanternYear && entry.id === pending.id
    ) || result.settlement.lastTimelineEvent,
    pendingTimelineEvent: null,
    lastTimelineResult,
    timelineFlags: { ...(result.settlement.timelineFlags || {}) },
    campaignPressure: result.settlement.campaignPressure || 0,
    lastMajorTimelineEventYear: isMajor
      ? pending.lanternYear
      : result.settlement.lastMajorTimelineEventYear,
    resolvedTimelineEventIds: addUnique(
      result.settlement.resolvedTimelineEventIds,
      pending.id
    ),
    settlementHistory: [
      ...(result.settlement.settlementHistory || []),
      settlementHistoryEntry
    ]
  };
}
