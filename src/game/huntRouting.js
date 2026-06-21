import { equipment } from '../data/equipment.js';
import { buildRunDeck } from './deckLogic.js';

export function isValidSelectableNode(node) {
  return Boolean(node?.id && node?.type);
}

export function hasRecoverableHuntRoute(runMap = [], runParty = []) {
  return Array.isArray(runMap) &&
    runMap.length > 0 &&
    Array.isArray(runParty) &&
    runParty.some(survivor => survivor?.id && survivor.alive !== false && Number(survivor.hp) > 0);
}

export function getCompletionNodeId(node) {
  return node?.sourceNodeId || node?.id || null;
}

export function createScoutFightNode(originNode) {
  if (!originNode?.id) return null;
  return {
    id: `${originNode.id}:scout-fight`,
    sourceNodeId: originNode.id,
    row: originNode.row,
    column: originNode.column,
    connections: Array.isArray(originNode.connections) ? originNode.connections : [],
    type: 'fight',
    available: true,
    completed: false
  };
}

export function buildSafePartyCombatBonuses({
  runParty = [],
  existingBonuses = [],
  settlement = {},
  monsterId,
  quarryId,
  runModifiers = {},
  runBonus = {},
  getLoadoutBonus
}) {
  const bonuses = Array.isArray(existingBonuses) ? existingBonuses : [];
  return (Array.isArray(runParty) ? runParty : [])
    .filter(survivor => survivor?.id && survivor.alive !== false && Number(survivor.hp) > 0)
    .map(survivor => {
      const partySettlement = { ...settlement, activeSurvivorId: survivor.id };
      const loadoutBonus = getLoadoutBonus(partySettlement, monsterId, quarryId);
      const existing = bonuses.find(bonus => bonus?.survivor?.id === survivor.id) || {};
      const equippedGear = (survivor.boundGear || [])
        .filter(gear => equipment[gear.equipmentId]);
      return {
        ...existing,
        ...loadoutBonus,
        survivor,
        runDeck: Array.isArray(existing.runDeck)
          ? existing.runDeck
          : buildRunDeck({ survivor, equippedGear }),
        startingBlock:
          (loadoutBonus.startingBlock || 0) +
          (runModifiers.nextCombatStartBlock || 0) +
          (runBonus.firstCombatBlock || 0),
        firstTurnEnergyPenalty: runModifiers.nextCombatEnergyPenalty || 0,
        monsterBaneDamageBonus:
          settlement.builtInnovations?.includes('monsterArchive') &&
          survivor.fightingArts?.includes(`monsterBane_${quarryId}`) ? 1 : 0,
        hasMonsterBane: survivor.fightingArts?.includes(`monsterBane_${quarryId}`),
        huntDeckConditionsApplied: true
      };
    });
}
