import {
  getTimelineEntry,
  randomLanternYearEvents
} from '../data/lanternTimeline.js';
import { getNemesisForLanternYear } from '../data/nemesisEncounters.js';
import { quarries } from '../data/quarries.js';

const BASIC_IDS = ['bone', 'hide', 'sinew', 'organ', 'scrap', 'claw'];

function applyEffects(settlement, effects = {}) {
  let next = { ...settlement };
  if (effects.gainSettlementMemory) {
    next.settlementMemory += effects.gainSettlementMemory;
  }
  if (effects.memoryIfNoDeaths && next.deadSurvivors === 0) {
    next.settlementMemory += effects.memoryIfNoDeaths;
  }
  if (effects.memoryIfLowPopulation && next.population < 6) {
    next.settlementMemory += effects.memoryIfLowPopulation;
  }
  if (effects.randomSurvivorSurvival) {
    const living = next.survivors.filter(survivor => survivor.alive !== false);
    const target = living[Math.floor(Math.random() * living.length)];
    if (target) {
      next.survivors = next.survivors.map(survivor => survivor.id === target.id
        ? {
            ...survivor,
            survival: Math.min(
              survivor.maxSurvival || 3,
              (survivor.survival || 0) + effects.randomSurvivorSurvival
            )
          }
        : survivor);
    }
  }
  if (effects.spendFoodResource) {
    const resourceId = ['organ', 'hide'].find(id => (next.stash[id] || 0) > 0);
    if (!resourceId) return next;
    next.stash = {
      ...next.stash,
      [resourceId]: next.stash[resourceId] - effects.spendFoodResource
    };
  }
  if (effects.healAll) {
    next.survivors = next.survivors.map(survivor => survivor.alive === false
      ? survivor
      : { ...survivor, hp: Math.min(survivor.maxHp, survivor.hp + effects.healAll) });
  }
  if (effects.healOne) {
    const target = next.survivors.find(survivor =>
      survivor.alive !== false && survivor.hp < survivor.maxHp
    );
    if (target) {
      next.survivors = next.survivors.map(survivor => survivor.id === target.id
        ? { ...survivor, hp: Math.min(survivor.maxHp, survivor.hp + effects.healOne) }
        : survivor);
    }
  }
  if (effects.populationChance && Math.random() < effects.populationChance) {
    next.population += 1;
  }
  if (effects.populationLoss && !effects.preventPopulationLossCost) {
    next.population = Math.max(0, next.population - effects.populationLoss);
  }
  if (effects.nextRunMonsterBonusHp) {
    next.nextRunBonus = {
      ...next.nextRunBonus,
      nextCombatMonsterBonusHp:
        (next.nextRunBonus?.nextCombatMonsterBonusHp || 0) + effects.nextRunMonsterBonusHp
    };
  }
  if (effects.forgetPanic) {
    const target = next.survivors.find(survivor =>
      survivor.alive !== false &&
      !survivor.forgottenCardIds?.includes('panic') &&
      [...(survivor.personalDeckAdditions || []), ...(survivor.permanentNegativeCards || [])]
        .some(addition => (addition.cardId || addition) === 'panic')
    );
    if (target) {
      next.survivors = next.survivors.map(survivor => survivor.id === target.id
        ? { ...survivor, forgottenCardIds: [...new Set([...(survivor.forgottenCardIds || []), 'panic'])] }
        : survivor);
    }
  }
  if (effects.preventPopulationLossCost) {
    const payment = BASIC_IDS.flatMap(id => Array(next.stash[id] || 0).fill(id))
      .slice(0, effects.preventPopulationLossCost);
    if (payment.length === effects.preventPopulationLossCost) {
      const stash = { ...next.stash };
      payment.forEach(id => { stash[id] -= 1; });
      next.stash = stash;
    } else {
      next.population = Math.max(0, next.population - (effects.populationLoss || 1));
    }
  }
  if (effects.gainBasicResource) {
    const id = BASIC_IDS.find(resourceId => resourceId !== 'claw') || 'bone';
    next.stash = { ...next.stash, [id]: (next.stash[id] || 0) + effects.gainBasicResource };
  }
  if (effects.addInnovationIds) {
    next.innovationDeckState = {
      ...next.innovationDeckState,
      availableInnovationPoolIds: [
        ...new Set([
          ...next.innovationDeckState.availableInnovationPoolIds,
          ...effects.addInnovationIds
        ])
      ]
    };
  }
  return next;
}

export function applyLanternYearTimeline(settlement, year) {
  const fixed = getTimelineEntry(year);
  const event = fixed || randomLanternYearEvents[Math.floor(Math.random() * randomLanternYearEvents.length)];
  let next = applyEffects(settlement, event.effects);

  const innovationIds = event.id === 'deadCounted' && next.deadSurvivors === 0
    ? []
    : event.id === 'childrenListen' && next.population < 6
      ? []
      : event.unlocksInnovationIds || [];
  next.innovationDeckState = {
    ...next.innovationDeckState,
    availableInnovationPoolIds: [
      ...new Set([...next.innovationDeckState.availableInnovationPoolIds, ...innovationIds])
    ]
  };
  const quarryRumours = (event.unlocksQuarryRumours || []).filter(id => quarries[id]?.role === 'quarry');
  next.discoveredQuarries = [...new Set([...next.discoveredQuarries, ...quarryRumours])];
  next.unlockedQuarries = [...new Set([...next.unlockedQuarries, ...quarryRumours])];
  const historyEntry = {
    lanternYear: year,
    id: event.id,
    name: event.name,
    description: event.description.replace('{settlementName}', next.settlementName),
    type: event.type,
    choiceId: null,
    timestamp: new Date().toISOString()
  };
  const nemesis = getNemesisForLanternYear(year);
  return {
    ...next,
    timelineHistory: [...(next.timelineHistory || []), historyEntry],
    lastTimelineEvent: historyEntry,
    pendingTimelineEvent: event.choices?.length
      ? {
          lanternYear: year,
          id: event.id,
          name: event.name,
          description: historyEntry.description,
          choices: event.choices
        }
      : null,
    pendingNemesisEncounter: nemesis
      ? {
          nemesisId: nemesis.id,
          lanternYear: year,
          stage: 'lore',
          selectedSurvivorId: null,
          memorySpent: false,
          healingSpent: false
        }
      : next.pendingNemesisEncounter || null
  };
}

export function resolveLanternTimelineChoice(settlement, choiceId) {
  const pending = settlement.pendingTimelineEvent;
  const choice = pending?.choices?.find(item => item.id === choiceId);
  if (!pending || !choice) return settlement;

  const next = applyEffects(settlement, choice.effects);
  const timelineHistory = (next.timelineHistory || []).map(entry =>
    entry.lanternYear === pending.lanternYear && entry.id === pending.id
      ? { ...entry, choiceId: choice.id, choiceText: choice.text }
      : entry
  );
  const lastTimelineEvent = next.lastTimelineEvent?.id === pending.id
    ? { ...next.lastTimelineEvent, choiceId: choice.id, choiceText: choice.text }
    : next.lastTimelineEvent;

  return {
    ...next,
    timelineHistory,
    lastTimelineEvent,
    pendingTimelineEvent: null
  };
}
