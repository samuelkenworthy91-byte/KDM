import { cards, starterCardIds } from '../data/cards.js';
import {
  EARLY_FORGETTING_COST,
  forgetSurvivorCard,
  getCardForgetEligibility
} from './cardForgetting.js';
import { getPersonalCardId } from './deckLogic.js';
import { gainMemories, spendMemories } from './memoryEconomy.js';
import { treatWound } from '../data/woundTables.js';

const living = survivor => survivor?.alive !== false && Number(survivor?.hp) > 0;

export function getRestParty(party = [], activeSurvivor = null) {
  const members = party.filter(living);
  if (members.length) return members;
  return living(activeSurvivor) ? [activeSurvivor] : [];
}

export function getForgettableRestCards(settlement, survivor) {
  if (!survivor) return [];
  const additions = [
    ...(survivor.personalDeckAdditions || []),
    ...(survivor.permanentNegativeCards || [])
  ];
  const candidates = [
    ...starterCardIds.map(cardId => ({ cardId, addition: null })),
    ...additions.map(addition => ({
      cardId: getPersonalCardId(addition),
      addition
    }))
  ];

  return [...new Map(candidates.map(candidate => [candidate.cardId, candidate])).values()]
    .filter(candidate => candidate.cardId && getCardForgetEligibility({
      settlement,
      survivor,
      cardId: candidate.cardId,
      card: cards[candidate.cardId],
      addition: candidate.addition
    }).eligible)
    .map(candidate => ({
      ...candidate,
      name: cards[candidate.cardId]?.name || 'Unknown / Legacy'
    }));
}

export function revealNextMapNodes(map = [], currentNode = null) {
  const connectedIds = new Set(currentNode?.connections || []);
  const nextIds = new Set(
    map.flat()
      .filter(node => connectedIds.has(node.id))
      .flatMap(node => node.connections || [])
  );
  if (!nextIds.size) connectedIds.forEach(id => nextIds.add(id));
  return map.map(row => row.map(node => (
    nextIds.has(node.id) ? { ...node, revealedByTracks: true } : node
  )));
}

function updatePartyMember(party, survivorId, updater) {
  return party.map(survivor => survivor.id === survivorId ? updater(survivor) : survivor);
}

function bindWounds(survivor) {
  const lightLocation = Object.entries(survivor.hitLocations || {})
    .find(([, wound]) => wound.wounded && !wound.severe)?.[0];
  const rested = lightLocation ? treatWound(survivor, lightLocation, 'rest') : survivor;
  const healing = Math.max(
    0,
    Math.ceil(rested.maxHp * 0.25) - (rested.injuries?.includes('twistedAnkle') ? 1 : 0)
  );
  return {
    ...rested,
    hp: Math.min(rested.maxHp, rested.hp + healing)
  };
}

export function resolveRestStopChoice(state, choiceId, options = {}) {
  const sourceParty = Array.isArray(state.runParty) && state.runParty.length
    ? state.runParty
    : getRestParty([], state.runSurvivor);
  const party = getRestParty(sourceParty, state.runSurvivor);
  const activeId = options.survivorId || state.runSurvivor?.id || party[0]?.id;
  const target = party.find(survivor => survivor.id === activeId);
  const activeTarget = party.find(survivor => survivor.id === state.runSurvivor?.id) || party[0];
  const base = {
    ...state,
    runParty: sourceParty,
    runModifiers: { ...(state.runModifiers || {}) }
  };

  if ((!target && ['bindWounds', 'shareStories'].includes(choiceId)) ||
    (!activeTarget && choiceId === 'forgetBurden')) {
    return { ...base, applied: false, reason: 'No living survivor is available.' };
  }

  if (choiceId === 'bindWounds') {
    if (target.hp >= target.maxHp &&
      !Object.values(target.hitLocations || {}).some(wound => wound.wounded && !wound.severe)) {
      return { ...base, applied: false, reason: 'This survivor has no wounds to bind.' };
    }
    const runParty = updatePartyMember(sourceParty, target.id, bindWounds);
    return {
      ...base,
      runParty,
      runSurvivor: runParty.find(survivor => survivor.id === target.id),
      applied: true
    };
  }

  if (choiceId === 'prepareNextFight') {
    return {
      ...base,
      runModifiers: {
        ...base.runModifiers,
        firstAttackBonus: (base.runModifiers.firstAttackBonus || 0) + 2
      },
      applied: true
    };
  }

  if (choiceId === 'keepWatch') {
    return {
      ...base,
      runModifiers: {
        ...base.runModifiers,
        nextCombatStartBlock: (base.runModifiers.nextCombatStartBlock || 0) + 4,
        nextEventWarning: true
      },
      applied: true
    };
  }

  if (choiceId === 'shareStories') {
    if (options.storyReward === 'memory') {
      return {
        ...base,
        settlement: gainMemories(state.settlement, 1, {
          source: 'rest-stories',
          description: `${target.name} shared a story during the hunt.`,
          survivorIds: [target.id],
          huntId: state.currentHuntId
        }),
        applied: true
      };
    }
    if ((target.survival || 0) >= (target.maxSurvival || 3)) {
      return { ...base, applied: false, reason: 'This survivor is already at maximum Survival.' };
    }
    const runParty = updatePartyMember(sourceParty, target.id, survivor => ({
      ...survivor,
      survival: Math.min(survivor.maxSurvival || 3, (survivor.survival || 0) + 1)
    }));
    return {
      ...base,
      runParty,
      runSurvivor: runParty.find(survivor => survivor.id === target.id),
      applied: true
    };
  }

  if (choiceId === 'forgetBurden') {
    const forgetTarget = activeTarget;
    const cardId = options.cardId;
    const additions = [
      ...(forgetTarget.personalDeckAdditions || []),
      ...(forgetTarget.permanentNegativeCards || [])
    ];
    const addition = additions.find(item => getPersonalCardId(item) === cardId);
    if (!starterCardIds.includes(cardId) && !addition) {
      return { ...base, applied: false, reason: 'Choose an eligible personal card.' };
    }
    const card = cards[cardId];
    const eligibility = getCardForgetEligibility({
      settlement: state.settlement,
      survivor: forgetTarget,
      cardId,
      card,
      addition
    });
    if (!eligibility.eligible) return { ...base, applied: false, reason: eligibility.reason };
    const settlement = spendMemories(state.settlement, EARLY_FORGETTING_COST, {
      source: 'rest-reflection',
      description: `${forgetTarget.name} forgot ${card.name} at a rest stop.`,
      survivorIds: [forgetTarget.id],
      huntId: state.currentHuntId
    });
    if (!settlement) return { ...base, applied: false, reason: 'Not enough Memory.' };
    const method = settlement.builtMemoryInnovations?.includes('riteOfForgetting')
      ? 'Rite of Forgetting at Rest'
      : 'Rest Reflection';
    const forget = survivor =>
      forgetSurvivorCard(survivor, cardId, method, settlement.lanternYear, card);
    const runParty = updatePartyMember(sourceParty, forgetTarget.id, forget);
    const settlementSurvivors = settlement.survivors.map(survivor =>
      survivor.id === forgetTarget.id ? forget(survivor) : survivor
    );
    return {
      ...base,
      settlement: {
        ...settlement,
        survivors: settlementSurvivors,
        livingSurvivors: Array.isArray(settlement.livingSurvivors)
          ? settlement.livingSurvivors.map(survivor =>
            survivor.id === forgetTarget.id ? forget(survivor) : survivor
          )
          : settlementSurvivors.filter(living)
      },
      runParty,
      runSurvivor: runParty.find(survivor => survivor.id === forgetTarget.id),
      applied: true
    };
  }

  if (choiceId === 'repairGear') {
    return {
      ...base,
      runModifiers: {
        ...base.runModifiers,
        nextCombatStartBlock: (base.runModifiers.nextCombatStartBlock || 0) + 5
      },
      applied: true
    };
  }

  if (choiceId === 'studyTracks') {
    if (options.trackStudy === 'revealNodes') {
      return {
        ...base,
        runMap: revealNextMapNodes(state.runMap, state.currentNode),
        applied: true
      };
    }
    if (options.trackStudy === 'woundQuarry') {
      return {
        ...base,
        runModifiers: {
          ...base.runModifiers,
          monsterStartsWounded: (base.runModifiers.monsterStartsWounded || 0) + 2
        },
        applied: true
      };
    }
    return {
      ...base,
      runModifiers: {
        ...base.runModifiers,
        nextEventWarning: true
      },
      applied: true
    };
  }

  return { ...base, applied: false, reason: 'Unknown rest choice.' };
}
