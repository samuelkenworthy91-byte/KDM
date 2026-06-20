import { cards } from '../data/cards.js';
import { fightingArts, isMonsterBaneId } from '../data/fightingArts.js';
import { getPersonalCardId } from './deckLogic.js';

export function addPersonalCard(survivor, cardId, metadata = {}) {
  if (!cards[cardId]) {
    console.warn(`[Survivor progression] Unknown personal card "${cardId}".`);
    return survivor;
  }
  const additions = survivor.personalDeckAdditions || [];
  if (additions.some(addition => getPersonalCardId(addition) === cardId)) return survivor;
  return {
    ...survivor,
    personalDeckAdditions: [
      ...additions,
      {
        cardId,
        sourceType: metadata.sourceType || cards[cardId].sourceType || 'personal',
        reason: metadata.reason || 'Survivor progression',
        locked: Boolean(metadata.locked || cards[cardId].locked)
      }
    ]
  };
}

export function learnFightingArt(survivor, artId, reason = 'Survivor reward') {
  const art = fightingArts[artId];
  if (!art?.implemented) {
    console.warn(`[Survivor progression] Unknown fighting art "${artId}".`);
    return survivor;
  }
  if (isMonsterBaneId(artId) && (survivor.fightingArts || []).some(isMonsterBaneId)) {
    return survivor;
  }
  let next = {
    ...survivor,
    fightingArts: [...new Set([...(survivor.fightingArts || []), artId])]
  };
  if (artId === 'hardened' && !(survivor.fightingArts || []).includes(artId)) {
    next.maxHp = (next.maxHp || 30) + 1;
    next.hp = Math.min(next.maxHp, (next.hp || 0) + 1);
  }
  return next;
}

export function syncFightingArtCards(survivor) {
  return survivor;
}
