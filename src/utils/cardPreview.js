import { playCard } from '../game/combatLogic.js';
import {
  getWeakPointHarvestPreview,
  getWeakPointTellState,
  getWeaponSuitability
} from '../data/weakPoints.js';
import { getHarvestBenefitLabels } from '../game/harvestRewardLogic.js';

const EMPTY_PREVIEW = {
  baseDamage: 0,
  finalDamage: 0,
  monsterHpDamage: 0,
  blockDamage: 0,
  weakPointBreakDamage: 0,
  blockGain: 0,
  survivalGain: 0,
  healing: 0,
  drawCount: 0,
  panicAdded: 0,
  targetName: '',
  warnings: [],
  modifierBreakdown: [],
  effectSummary: ''
};

function clone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function countPanic(state) {
  return ['hand', 'discardPile', 'drawPile']
    .flatMap(key => state?.[key] || [])
    .filter(item => item?.id === 'panic').length;
}

function baseDamageFor(card) {
  return (card?.effects || []).reduce((total, effect) => {
    if (effect.type === 'damage') return total + (effect.amount || 0);
    if (effect.type === 'multiHitDamage') {
      return total + (effect.amount || 0) * (effect.hits || 1);
    }
    if (effect.type === 'discardForDamage') {
      return total + (effect.amount || effect.fallbackAmount || 0);
    }
    if (effect.type === 'damageFromBlock') return total;
    return total;
  }, 0);
}

function damageShape(card, finalDamage) {
  const damaging = (card?.effects || []).filter(effect =>
    ['damage', 'multiHitDamage', 'discardForDamage', 'damageFromBlock'].includes(effect.type)
  );
  if (damaging.length === 1 && damaging[0].type === 'multiHitDamage') {
    const hits = damaging[0].hits || 1;
    const perHit = hits ? Math.floor(finalDamage / hits) : finalDamage;
    return { hits, damagePerHit: perHit };
  }
  const repeated = damaging.length > 1 &&
    damaging.every(effect => effect.type === 'damage' && effect.amount === damaging[0].amount);
  if (repeated) {
    return {
      hits: damaging.length,
      damagePerHit: damaging.length ? Math.floor(finalDamage / damaging.length) : finalDamage
    };
  }
  return {};
}

function addConditionalBreakdown(lines, effect, state) {
  const conditions = [
    ['bonusIfMonsterMarked', state.monster?.marked, 'Marked bonus'],
    ['bonusIfSurvivorWounded', state.survivor?.hp < state.survivor?.maxHp, 'Wounded bonus'],
    ['bonusIfPanicInDiscard', state.discardPile?.some(card => card.id === 'panic'), 'Panic bonus'],
    ['bonusIfSurvivalSpent', (state.survivalSpentThisTurn || 0) > 0, 'Survival spent bonus'],
    ['bonusIfSecondAttack', (state.attacksPlayedThisTurn || 0) === 1, 'Second attack bonus'],
    ['bonusIfFirstAttack', (state.attacksPlayedThisTurn || 0) === 0, 'First attack bonus'],
    ['bonusIfPreviousCardSkill', state.previousCardType === 'skill', 'Previous skill bonus'],
    ['bonusIfMonsterHasBlock', (state.monster?.block || 0) > 0, 'Guarded monster bonus'],
    ['bonusIfMonsterNoBlock', (state.monster?.block || 0) <= 0, 'Unguarded monster bonus']
  ];
  conditions.forEach(([key, active, label]) => {
    if (!effect?.[key]) return;
    lines.push(`${active ? '+' + effect[key] : '+0'} ${label}${active ? '' : ' (inactive)'}`);
  });
}

function summaryFor(preview, card, selectedWeakPoint) {
  if (preview.monsterHpDamage || preview.blockDamage || card?.type === 'attack') {
    if (selectedWeakPoint) {
      return `HP: ${preview.monsterHpDamage} | Break: ${preview.weakPointBreakDamage}`;
    }
    if (preview.hits > 1) {
      return `Damage: ${preview.damagePerHit} x ${preview.hits} = ${preview.finalDamage}`;
    }
    if (preview.blockDamage > 0) {
      return `Damage: ${preview.finalDamage} - ${preview.blockDamage} blocked, ${preview.monsterHpDamage} HP`;
    }
    return `Damage: ${preview.monsterHpDamage}`;
  }
  if (preview.blockGain) return `Block: ${preview.blockGain}`;
  if (preview.healing) return `Heal ${preview.targetName || 'survivor'} for ${preview.healing}`;
  if (preview.survivalGain) return `Gain ${preview.survivalGain} Survival`;
  if (preview.drawCount) return `Draw ${preview.drawCount}`;
  if (preview.panicAdded < 0) return `Remove ${Math.abs(preview.panicAdded)} Panic`;
  if (preview.panicAdded > 0) return `Add ${preview.panicAdded} Panic`;
  const statusSummary = statusEffectsSummary(card);
  if (statusSummary) return statusSummary;
  const partyEffect = card?.effects?.find(effect => effect.type === 'partyEffect');
  if (partyEffect) {
    const target = partyEffect.target === 'nextPartyMember' ? 'Next ally' : partyEffect.target;
    return `${target}: +${partyEffect.value} ${partyEffect.effectType}`;
  }
  return card?.description || 'Effect preview unavailable';
}

function statusEffectsSummary(card) {
  const labels = {
    bleedTarget: amount => `Bleed ${amount}: true HP damage at end of turn; ignores block; then -1.`,
    burnTarget: amount => `Burn ${amount}: damages block first, strips Guarded, then HP; then -1.`,
    poisonTarget: amount => `Poison ${amount}: ignores half block and halves healing; then -1.`,
    doomTarget: amount => `Doom ${amount}: countdown; at 0, 10 true damage.`,
    vulnerableTarget: amount => `Vulnerable ${amount}: next incoming hit +50% damage.`,
    staggerTarget: amount => `Staggered ${amount}: next incoming hit deals double damage.`,
    guardTarget: amount => `Guarded ${amount}: next incoming hit -2 damage.`,
    guardSelf: amount => `Guarded ${amount}: next incoming hit -2 damage.`,
    snareTarget: amount => `Snared ${amount}: next outgoing hit -5 damage and retarget/evade restricted.`,
    shockTarget: amount => `Shock ${amount}: disrupts next card/intent.`,
    blindTarget: amount => `Blind ${amount}: next attack -3 damage / glancing blow.`,
    markTarget: amount => `Marked ${amount}: combo and targeting setup.`,
    exposeTarget: amount => `Exposed ${amount}: opens weak-point access.`,
    preparedSelf: amount => `Prepared ${amount}: improves next card.`,
    salvageSelf: amount => `Salvage ${amount}: adds post-combat reward value.`,
    testBonus: amount => `Test Bonus ${amount}: improves relevant tests.`,
    consequenceReduction: amount => `Consequence Reduction ${amount}: softens failed risks/events.`,
    healAfterCombat: amount => `Heal after combat: restores ${amount} HP after combat and persists.`,
    partyHealAfterCombat: amount => `Heal after combat: party restores ${amount} HP after combat and persists.`
  };
  const parts = (card?.effects || []).flatMap(effect => {
    const amount = effect.amount || effect.value || 1;
    return labels[effect.type] ? [labels[effect.type](amount)] : [];
  });
  return parts.join(' ');
}

export function getCardPreview({
  card,
  survivor,
  combatState,
  monster,
  selectedTarget,
  selectedWeakPoint,
  party,
  currentTurnState
} = {}) {
  try {
    if (!card) return { ...EMPTY_PREVIEW, warnings: ['No card selected'] };
    const source = combatState || currentTurnState;
    if (!source) return { ...EMPTY_PREVIEW, effectSummary: card.description || '' };
    const state = clone({
      ...source,
      survivor: survivor || source.survivor,
      monster: monster || source.monster,
      hand: source.hand || [card],
      selectedWeakPointId: selectedWeakPoint?.id ||
        (selectedTarget?.type === 'weakPoint' ? selectedTarget.id : source.selectedWeakPointId),
      status: 'playing'
    });
    let cardIndex = state.hand.findIndex(item => item === card || (
      item?.id === card.id && item?.source === card.source
    ));
    if (cardIndex < 0) {
      state.hand = [clone(card), ...state.hand];
      cardIndex = 0;
    }

    const before = clone(state);
    const after = playCard(cardIndex, state);
    const weakPointId = state.selectedWeakPointId;
    const beforePoint = before.monster?.weakPoints?.find(point => point.id === weakPointId);
    const afterPoint = after.monster?.weakPoints?.find(point => point.id === weakPointId);
    const monsterHpDamage = Math.max(0, (before.monster?.hp || 0) - (after.monster?.hp || 0));
    const blockDamage = Math.max(0, (before.monster?.block || 0) - (after.monster?.block || 0));
    const finalDamage = monsterHpDamage + blockDamage;
    const baseDamage = baseDamageFor(card);
    const weakPointBreakDamage = Math.max(
      0,
      (afterPoint?.currentBreakDamage || 0) - (beforePoint?.currentBreakDamage || 0)
    );
    const modifierBreakdown = [];
    if (baseDamage) modifierBreakdown.push(`Base: ${baseDamage}`);
    if ((before.survivor?.strength || 0) && card.type === 'attack') {
      modifierBreakdown.push(`+${before.survivor.strength} Strength per hit`);
    }
    const weaponType = card.weaponType ||
      (card.type === 'attack' && before.activeProficiencyType === 'fistAndTooth'
        ? 'fistAndTooth'
        : null);
    const proficiencyLevel = weaponType === before.activeProficiencyType
      ? before.weaponProficiency?.[weaponType]?.level || 0
      : 0;
    if (proficiencyLevel) {
      modifierBreakdown.push(`${weaponType} proficiency level ${proficiencyLevel} included`);
    }
    (card.effects || []).forEach(effect => addConditionalBreakdown(modifierBreakdown, effect, before));
    const unexplained = finalDamage - baseDamage -
      ((before.survivor?.strength || 0) * Math.max(1, damageShape(card, finalDamage).hits || 1));
    if (unexplained) {
      modifierBreakdown.push(`${unexplained > 0 ? '+' : ''}${unexplained} other combat modifiers`);
    }
    if (blockDamage) modifierBreakdown.push(`-${blockDamage} Monster block`);
    if (monsterHpDamage || card.type === 'attack') {
      modifierBreakdown.push(`Final HP damage: ${monsterHpDamage}`);
    }

    const preview = {
      ...EMPTY_PREVIEW,
      baseDamage,
      finalDamage,
      monsterHpDamage,
      blockDamage,
      weakPointBreakDamage,
      blockGain: Math.max(0, (after.survivor?.block || 0) - (before.survivor?.block || 0)),
      survivalGain: Math.max(0, (after.survivor?.survival || 0) - (before.survivor?.survival || 0)),
      healing: Math.max(0, (after.survivor?.hp || 0) - (before.survivor?.hp || 0)),
      drawCount: Math.max(0, (after.hand?.length || 0) - (before.hand?.length || 0) + 1),
      panicAdded: countPanic(after) - countPanic(before),
      targetName: selectedWeakPoint?.name || selectedTarget?.name ||
        survivor?.name || source.survivor?.name || '',
      warnings: [],
      modifierBreakdown,
      ...damageShape(card, finalDamage)
    };
    if (beforePoint && afterPoint) {
      const cardTags = [...(card.tags || []), ...(card.keywords || [])];
      let suitability = getWeaponSuitability(beforePoint, card.weaponType, cardTags);
      if (cardTags.includes('ignorePoorWeapon') && suitability.modifier < 0) {
        suitability = { ...suitability, modifier: 0, label: 'Neutral' };
      }
      preview.weaponMatch = suitability.label;
      preview.weakPointName = beforePoint.name;
      preview.tellState = source.hasMonsterBane
        ? getWeakPointTellState(
            beforePoint,
            before.monster?.intents?.[before.intentIndex || 0],
            before.monster?.quarryId
          )
        : 'unknown';
      preview.weakPointProgress = afterPoint.currentBreakDamage || 0;
      preview.weakPointBreakValue = afterPoint.breakValue || 0;
      preview.willBreakWeakPoint = !beforePoint.broken && Boolean(afterPoint.broken);
      preview.breakEffect = preview.willBreakWeakPoint
        ? source.hasMonsterBane
          ? afterPoint.onBreakEffect || ''
          : 'Breaking this part will weaken the monster.'
        : '';
      preview.failedBreakRisk = !afterPoint.broken
        ? source.hasMonsterBane
          ? afterPoint.riskLabel || ''
          : 'A failed break may provoke a consequence.'
        : '';
      preview.harvestWarning = afterPoint.harvestProfile?.fragile
        ? 'Fragile: excess break damage may reduce harvest quality.'
        : '';
      preview.harvestPreview = getWeakPointHarvestPreview({
        weakPoint: beforePoint,
        breakDamage: weakPointBreakDamage,
        weaponType,
        cardTags
      });
      if (preview.harvestPreview) {
        preview.modifierBreakdown.push(
          `Break value: ${preview.harvestPreview.breakValue}`,
          `Incoming break: ${preview.harvestPreview.breakDamage}`,
          `Overkill: ${preview.harvestPreview.overkill}`,
          ...preview.harvestPreview.labels
        );
      }
    }
    const harvestBenefits = getHarvestBenefitLabels(card);
    if (harvestBenefits.length) preview.modifierBreakdown.push(...harvestBenefits);
    preview.effectSummary = summaryFor(preview, card, selectedWeakPoint);
    return preview;
  } catch (error) {
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.warn('[Card preview] Unable to calculate preview', card?.id, error);
    }
    return {
      ...EMPTY_PREVIEW,
      warnings: ['Exact preview unavailable'],
      effectSummary: card?.description || 'Effect preview unavailable'
    };
  }
}
