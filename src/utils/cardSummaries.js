
export function getSimpleCardSummary(card) {
  if (!card) return 'No card data available.';

  const id = card.cardId || card.id || '';
  
  // Specific overrides for Beetugle as requested
  if (id === 'beetugleShowdownPhaseUse' || id === 'beetugleHuntPhaseUse') {
    return "Improves your next harvest or weak-point test. If it fails, the quarry becomes easier to track.";
  }
  if (id === 'beetugleShowdownPhaseContingency' || id === 'beetugleHuntPhaseContingency') {
    return "Makes a bad hunt or monster result less punishing and helps protect gathered resources.";
  }

  // Generic patterns to simplify dense mechanical text
  let summary = card.shortEffect || card.description || card.cardText || '';

  // Requirement: Do not show advanced phrases in the main Armoury list
  // "Harvest tool", "Precision", "Safety", "Consequence Reduction", "testBonus", "statusApplied"
  summary = summary
    .replace(/Harvest tool: improves weak-point reward planning\./gi, '')
    .replace(/Precision: better match for delicate weak points\./gi, '')
    .replace(/Safety: prevents accidental resource loss\./gi, '')
    .replace(/Consequence Reduction: \d+/gi, '')
    .replace(/testBonus: \d+/gi, '')
    .replace(/statusApplied: \{.*?\}/gi, '')
    .replace(/\[Block: \d+\]/gi, '')
    .replace(/\[Status: .*?\]/gi, '')
    .replace(/Cost \d+ Skill\./gi, '')
    .replace(/Exhaust\./gi, '');

  // Simplify common mechanical strings
  summary = summary
    .replace(/Gain \+\d+ to the next harvest, retreat, or weak-point test\./gi, "Improves your next harvest or weak-point test.")
    .replace(/apply (Marked|Exposed) \d+ to the quarry/gi, "the quarry becomes easier to track")
    .replace(/clear it from a survivor/gi, "clears negative tracking from a survivor")
    .replace(/When a hunt or monster consequence is previewed, reduce it by \d+; on retreat, preserve \d+ gathered resource\./gi, "Makes a bad hunt or monster result less punishing and helps protect gathered resources.")
    .replace(/If it fails, apply Marked 2 to the quarry or clear it from a survivor\./gi, "If it fails, the quarry becomes easier to track.")
    .trim();

  // If we stripped everything, fallback to name or basic description
  if (!summary || summary.length < 5) {
    return card.name + " utility effect.";
  }

  return summary;
}

export function getCardTag(card) {
  if (!card) return 'Support';
  
  const tags = (card.tags || []).map(t => t.toLowerCase());
  const type = (card.type || '').toLowerCase();
  
  if (tags.includes('attack') || type === 'attack' || card.damage || card.skillDamage) return 'Attack';
  if (tags.includes('defence') || tags.includes('block') || card.block || card.partyBlock) return 'Defence';
  if (tags.includes('harvest') || tags.includes('tool')) return 'Harvest';
  if (tags.includes('heal') || card.heal || card.healIfWounded || card.partyHealAfterCombat) return 'Heal';
  if (tags.includes('aura') || card.aura || card.auras?.length > 0) return 'Aura';
  
  return 'Support';
}
