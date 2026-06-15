const uniqueIds = values => [...new Set(
  (Array.isArray(values) ? values : []).filter(value => typeof value === 'string' && value)
)];

const normalizeTutorialSteps = value => (
  Array.isArray(value)
    ? value.filter(step => typeof step === 'string' && step.trim()).map(step => step.trim())
    : []
);

export function createLegacyInnovationDefinition(id) {
  return {
    id: id || 'unknown-legacy',
    name: 'Unknown / Legacy',
    tier: 'legacy',
    category: 'legacy',
    prerequisites: [],
    deckWeight: 0,
    settlementBoostSummary: 'This saved innovation is not present in the current data catalog.',
    mechanicalEffects: {},
    unlocks: [],
    memoryCost: null,
    tutorialTitle: 'Legacy innovation',
    tutorialSteps: [],
    uiDestination: 'Settlement > Innovations',
    legacy: true
  };
}

export function normalizeInnovationDefinition(id, definition) {
  if (!definition || typeof definition !== 'object') {
    return createLegacyInnovationDefinition(id);
  }

  const effects = Array.isArray(definition.effects)
    ? definition.effects
    : definition.effect
      ? [definition.effect]
      : [];
  const unlocks = uniqueIds([
    ...(definition.unlocks || []),
    ...(definition.actionUnlocks || []),
    ...(definition.unlocksBuildings || []),
    ...(definition.unlocksRecipes || [])
  ]);

  return {
    ...definition,
    id: definition.id || id,
    name: definition.name || 'Unknown / Legacy',
    tier: definition.tier || 'legacy',
    category: definition.category || 'legacy',
    prerequisites: definition.prerequisites || definition.unlockRequirement || [],
    deckWeight: Number.isFinite(definition.deckWeight) ? definition.deckWeight : 1,
    settlementBoostSummary:
      definition.settlementBoostSummary ||
      effects[0] ||
      definition.description ||
      'Effect not described.',
    mechanicalEffects: definition.mechanicalEffects || {},
    unlocks,
    memoryCost: Number.isFinite(definition.memoryCost)
      ? definition.memoryCost
      : Number.isFinite(definition.costMemory)
        ? definition.costMemory
        : null,
    tutorialTitle: definition.tutorialTitle || `Using ${definition.name || 'Unknown / Legacy'}`,
    tutorialSteps: normalizeTutorialSteps(definition.tutorialSteps),
    uiDestination: definition.uiDestination || 'Settlement > Innovations',
    legacy: false
  };
}

export function getInnovationDefinition(catalog, id) {
  return normalizeInnovationDefinition(id, catalog?.[id]);
}

export function normalizeInnovationDeckState(state = {}, options = {}) {
  const ownedIds = uniqueIds([
    ...(options.ownedIds || []),
    ...(state.builtInnovationIds || [])
  ]);

  return {
    discoveredInnovationIds: uniqueIds([
      ...ownedIds,
      ...(state.discoveredInnovationIds || [])
    ]),
    availableInnovationPoolIds: uniqueIds([
      ...(options.defaultPoolIds || []),
      ...(state.availableInnovationPoolIds || [])
    ]),
    builtInnovationIds: ownedIds,
    innovationHistory: Array.isArray(state.innovationHistory)
      ? state.innovationHistory
      : []
  };
}
