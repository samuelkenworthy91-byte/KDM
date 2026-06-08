import { events } from '../data/events.js';
import { cards } from '../data/cards.js';
import { fightingArts } from '../data/fightingArts.js';
import { resources } from '../data/resources.js';

const RESOURCE_TYPES = {
  any: Object.keys(resources),
  basic: Object.keys(resources).filter(id => resources[id].type === 'basic'),
  monster: Object.keys(resources).filter(id => resources[id].type === 'monster'),
  rare: Object.keys(resources).filter(id => resources[id].type === 'rare'),
  gear: ['bone', 'hide', 'sinew', 'claw', 'monsterTooth', 'scrap']
};

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function getRandomEvent() {
  return randomItem(events);
}

export function addResourceToInventory(runState, resourceId, amount = 1) {
  if (!resources[resourceId] || amount <= 0) {
    return runState;
  }

  return {
    ...runState,
    inventory: {
      ...(runState.inventory || {}),
      [resourceId]: (runState.inventory?.[resourceId] || 0) + amount
    },
    resources: [
      ...(runState.resources || []),
      ...Array.from({ length: amount }, () => resourceId)
    ]
  };
}

export const applyResourceGain = addResourceToInventory;

export function addCardToRunDeck(runState, cardId) {
  if (!cards[cardId]) {
    return runState;
  }

  return {
    ...runState,
    deck: [...(runState.deck || []), cardId]
  };
}

export function addPassiveOrFightingArt(runState, artId) {
  if (!fightingArts[artId]) {
    return runState;
  }

  const currentArts = runState.fightingArts || runState.temporaryFightingArts || [];

  return {
    ...runState,
    fightingArts: [...new Set([...currentArts, artId])],
    temporaryFightingArts: [...new Set([...currentArts, artId])]
  };
}

export function applySettlementMemoryGain(settlement, amount, minimum = 0) {
  return {
    ...settlement,
    settlementMemory: Math.max(minimum, (settlement.settlementMemory || 0) + amount)
  };
}

export function describeAppliedEffects(appliedEffects = []) {
  return appliedEffects.map(effect => effect.text);
}

export function getRandomResourceByType(type = 'any') {
  const pool = RESOURCE_TYPES[type] || RESOURCE_TYPES.any;
  return randomItem(pool);
}

function hasGravesOfTheFallen(settlement) {
  const unlocks = [
    ...(settlement.unlockedUpgrades || []),
    ...(settlement.unlockedInnovations || []),
    ...(settlement.innovations || []),
    ...(settlement.unlocks || [])
  ];

  return unlocks.some(unlock => {
    const id = typeof unlock === 'string' ? unlock : unlock?.id;
    return id === 'gravesOfTheFallen' || id === 'graves-of-the-fallen';
  });
}

function applyEffects(effects, runState, settlement) {
  let nextRunState = { ...runState };
  let nextSettlement = { ...settlement };
  const appliedEffects = [];
  const todoEffects = [];

  if (effects.resource) {
    nextRunState = addResourceToInventory(
      nextRunState,
      effects.resource.id,
      effects.resource.amount
    );
    appliedEffects.push({
      type: 'resource',
      text: `+${effects.resource.amount || 1} ${resources[effects.resource.id]?.name || effects.resource.id}`
    });
  }

  if (effects.randomResource) {
    const amount = effects.randomResource.amount || 1;
    for (let count = 0; count < amount; count += 1) {
      const resourceId = effects.randomResource.ids
        ? randomItem(effects.randomResource.ids)
        : getRandomResourceByType(effects.randomResource.type);
      nextRunState = addResourceToInventory(nextRunState, resourceId, 1);
      appliedEffects.push({
        type: 'resource',
        text: `+1 ${resources[resourceId]?.name || resourceId}`
      });
    }
  }

  if (effects.hp) {
    const beforeHp = nextRunState.hp ?? 30;
    nextRunState.hp = Math.max(
      0,
      Math.min(nextRunState.maxHp || 30, (nextRunState.hp ?? 30) + effects.hp)
    );
    const hpChange = nextRunState.hp - beforeHp;
    if (hpChange !== 0) {
      appliedEffects.push({
        type: 'hp',
        text: hpChange > 0 ? `+${hpChange} HP healed` : `${hpChange} HP`
      });
    }
  }

  if (effects.survival) {
    nextRunState.survival = Math.max(
      0,
      (nextRunState.survival || 0) + effects.survival
    );
    appliedEffects.push({
      type: 'survival',
      text: `${effects.survival > 0 ? '+' : ''}${effects.survival} Survival`
    });
  }

  if (effects.settlementMemory) {
    nextSettlement = applySettlementMemoryGain(
      nextSettlement,
      effects.settlementMemory,
      effects.memoryMinimum || 0
    );
    appliedEffects.push({
      type: 'settlementMemory',
      text: `${effects.settlementMemory > 0 ? '+' : ''}${effects.settlementMemory} settlementMemory`
    });
  }

  if (effects.gravesOfFallenBonus && hasGravesOfTheFallen(nextSettlement)) {
    nextSettlement = applySettlementMemoryGain(nextSettlement, effects.gravesOfFallenBonus);
    appliedEffects.push({
      type: 'settlementMemory',
      text: `+${effects.gravesOfFallenBonus} settlementMemory from Graves of the Fallen`
    });
  }

  if (effects.addCard) {
    nextRunState = addCardToRunDeck(nextRunState, effects.addCard);
    appliedEffects.push({
      type: 'card',
      text: `${cards[effects.addCard]?.name || effects.addCard} added to deck`
    });
  }

  if (effects.randomCard) {
    const cardId = randomItem(effects.randomCard);
    nextRunState = addCardToRunDeck(nextRunState, cardId);
    appliedEffects.push({
      type: 'card',
      text: `${cards[cardId]?.name || cardId} added to deck`
    });
  }

  if (effects.fightingArt) {
    nextRunState = addPassiveOrFightingArt(nextRunState, effects.fightingArt);
    appliedEffects.push({
      type: 'fightingArt',
      text: `${fightingArts[effects.fightingArt]?.name || effects.fightingArt} learned`
    });
  }

  if (effects.temporaryFightingArt) {
    const artIds = ['berserker', 'tumble', 'clawStyle'].filter(id => fightingArts[id]);
    if (artIds.length) {
      const artId = typeof effects.temporaryFightingArt === 'string'
        ? effects.temporaryFightingArt
        : randomItem(artIds);
      nextRunState = addPassiveOrFightingArt(nextRunState, artId);
      appliedEffects.push({
        type: 'fightingArt',
        text: `${fightingArts[artId]?.name || artId} learned for this run`
      });
    } else {
      nextSettlement = applySettlementMemoryGain(nextSettlement, 1);
      appliedEffects.push({
        type: 'settlementMemory',
        text: '+1 settlementMemory'
      });
    }
  }

  if (effects.nextCombatModifiers) {
    const current = nextRunState.nextCombatModifiers || {};
    nextRunState.nextCombatModifiers = Object.fromEntries(
      Object.entries({ ...current, ...effects.nextCombatModifiers }).map(([key, value]) => [
        key,
        (current[key] || 0) + (effects.nextCombatModifiers[key] || 0)
      ])
    );
    Object.entries(effects.nextCombatModifiers).forEach(([key, value]) => {
      appliedEffects.push({
        type: 'combatModifier',
        text: `${key}: ${value > 0 ? '+' : ''}${value} next combat`
      });
    });
  }

  if (effects.chance) {
    const branch =
      Math.random() < effects.chance.probability
        ? effects.chance.success
        : effects.chance.failure;
    const chanceResult = applyEffects(branch, nextRunState, nextSettlement);
    return {
      ...chanceResult,
      appliedEffects: [...appliedEffects, ...(chanceResult.appliedEffects || [])],
      todoEffects: [...todoEffects, ...(chanceResult.todoEffects || [])]
    };
  }

  const supportedKeys = new Set([
    'resource',
    'randomResource',
    'hp',
    'survival',
    'settlementMemory',
    'memoryMinimum',
    'gravesOfFallenBonus',
    'addCard',
    'randomCard',
    'fightingArt',
    'temporaryFightingArt',
    'nextCombatModifiers',
    'chance'
  ]);
  Object.keys(effects).forEach(key => {
    if (!supportedKeys.has(key)) {
      todoEffects.push(`TODO: unsupported event effect "${key}"`);
    }
  });

  return { runState: nextRunState, settlement: nextSettlement, appliedEffects, todoEffects };
}

export function applyEventChoice(event, choice, runState, settlement) {
  if (!event || !choice || !event.choices.some(item => item.id === choice.id)) {
    return { runState, settlement, appliedEffects: [], todoEffects: [] };
  }

  return applyEffects(choice.effects || {}, runState, settlement);
}

export function getResourceNodeChoices() {
  const basic = getRandomResourceByType('basic');
  const monster = getRandomResourceByType('monster');
  const rare = getRandomResourceByType('rare');

  // Most nodes stay grounded; one in four exposes a costly rare find.
  const third =
    Math.random() < 0.25
      ? rare
      : getRandomResourceByType(Math.random() < 0.5 ? 'basic' : 'monster');
  return [
    { resourceId: basic, hpCost: 0 },
    { resourceId: monster, hpCost: 0 },
    { resourceId: third, hpCost: resources[third].type === 'rare' ? 1 : 0 }
  ];
}
