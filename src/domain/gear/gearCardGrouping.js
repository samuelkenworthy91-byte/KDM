import { gearCatalog as defaultGearCatalog } from '../../data/gear/gearCatalog.js';
import { gearCards as defaultGearCards } from '../../data/gear/gearCards.js';

const UNLINKED_GROUP_ID = 'unlinked-cards';

function asArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'object') return Object.values(value).filter(Boolean);
  return [];
}

function normaliseKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function safeGear(gear, index = 0) {
  const raw = gear && typeof gear === 'object' ? gear : {};
  const id = raw.id || raw.gearId || `gear-${index + 1}`;
  const name = raw.name || raw.displayName || raw.gearName || `Gear ${index + 1}`;
  return {
    ...raw,
    id,
    name,
    itemType: raw.itemType || raw.type || raw.gearType || 'gear',
    slot: raw.slot || raw.bodySlot || raw.loadoutCategory || 'gear',
    image: raw.image || raw.imagePath || raw.assetPath || `assets/gear/${id}.png`
  };
}

function safeCard(card, index = 0) {
  const raw = card && typeof card === 'object' ? card : {};
  const id = raw.id || raw.cardId || `card-${index + 1}`;
  const name = raw.name || raw.displayName || raw.cardName || `Card ${index + 1}`;
  return {
    ...raw,
    id,
    name,
    type: raw.type || 'card',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    effects: Array.isArray(raw.effects) ? raw.effects : [],
    description: raw.description || raw.rulesText || raw.rulesSummary || 'No rules text available.',
    image: raw.image || raw.imagePath || raw.assetPath || `assets/cards/${id}.png`
  };
}

function emptyGroup(gear) {
  return {
    gearId: gear.id,
    gearName: gear.name,
    gearType: gear.itemType || gear.type || 'gear',
    slot: gear.slot || 'gear',
    image: gear.image || '',
    activeCards: [],
    passiveCards: [],
    unlinkedCards: []
  };
}

function unlinkedGroup() {
  return {
    gearId: UNLINKED_GROUP_ID,
    gearName: 'Unlinked Cards',
    gearType: 'unlinked',
    slot: 'unlinked',
    image: '',
    activeCards: [],
    passiveCards: [],
    unlinkedCards: []
  };
}

function isPassiveCard(card) {
  const type = normaliseKey(card.type);
  const tags = (card.tags || []).map(normaliseKey);
  return type === 'passive' ||
    type === 'reaction' ||
    tags.includes('passive') ||
    tags.includes('armorpassive') ||
    card.passive === true ||
    Boolean(card.passiveText || card.passiveEffect);
}

function cardMatchesGear(card, gear) {
  const explicit = [card.gearId, card.sourceGearId, card.parentGearId, card.equipmentId]
    .map(normaliseKey)
    .filter(Boolean);
  if (explicit.includes(normaliseKey(gear.id))) return true;

  const looseCardFields = [card.source, card.set, card.gearName, card.weapon]
    .map(normaliseKey)
    .filter(Boolean);
  const gearKeys = [gear.id, gear.name, gear.weaponType, gear.itemType]
    .map(normaliseKey)
    .filter(Boolean);
  if (looseCardFields.some(field => gearKeys.includes(field))) return true;

  const cardName = normaliseKey(card.name);
  return gearKeys.some(key => key && cardName.includes(key));
}

function addGearPassive(group, gear) {
  const text = gear.passiveText || gear.rulesText || gear.passiveDescription;
  if (!text) return;
  group.passiveCards.push(safeCard({
    id: `${gear.id}-passive`,
    name: `${gear.name} Passive`,
    type: 'passive',
    sourceGearId: gear.id,
    sourceGearName: gear.name,
    description: text,
    tags: ['gear', 'passive']
  }));
}

export function getGearCardGroups({ cardCatalog = defaultGearCards, gearCatalog = defaultGearCatalog } = {}) {
  const gearItems = asArray(gearCatalog).map(safeGear);
  const cards = asArray(cardCatalog).map(safeCard);
  const groups = gearItems.map(emptyGroup);
  const unlinked = unlinkedGroup();

  gearItems.forEach((gear, index) => addGearPassive(groups[index], gear));

  cards.forEach(card => {
    const gearIndex = gearItems.findIndex(gear => cardMatchesGear(card, gear));
    const target = gearIndex >= 0 ? groups[gearIndex] : unlinked;
    const cardWithSource = {
      ...card,
      sourceGearId: target.gearId === UNLINKED_GROUP_ID ? card.sourceGearId || '' : target.gearId,
      sourceGearName: target.gearId === UNLINKED_GROUP_ID ? card.sourceGearName || 'Unlinked Cards' : target.gearName
    };
    if (target === unlinked) {
      target.unlinkedCards.push(cardWithSource);
    } else if (isPassiveCard(cardWithSource)) {
      target.passiveCards.push(cardWithSource);
    } else {
      target.activeCards.push(cardWithSource);
    }
  });

  return [...groups, unlinked].filter(group =>
    group.gearId === UNLINKED_GROUP_ID ||
    group.activeCards.length ||
    group.passiveCards.length ||
    group.unlinkedCards.length
  );
}

export function getCardsForGearItem(gearId, options = {}) {
  const id = normaliseKey(gearId);
  const group = getGearCardGroups(options).find(item => normaliseKey(item.gearId) === id);
  if (!group) return [];
  return [...group.activeCards, ...group.passiveCards, ...group.unlinkedCards];
}

export function getPassiveCardsForGearItem(gearId, options = {}) {
  return getCardsForGearItem(gearId, options).filter(isPassiveCard);
}

export function getActiveCardsForGearItem(gearId, options = {}) {
  const group = getGearCardGroups(options).find(item => normaliseKey(item.gearId) === normaliseKey(gearId));
  return group ? [...group.activeCards] : [];
}

export function getStarterLoadout({ gearCatalog = defaultGearCatalog, cardCatalog = defaultGearCards } = {}) {
  const groups = getGearCardGroups({ gearCatalog, cardCatalog });
  const weapon = groups.find(group => group.gearType === 'weapon' && group.activeCards.length) ||
    groups.find(group => group.slot === 'weapon' && group.activeCards.length);
  const support = groups.find(group =>
    group.gearId !== weapon?.gearId &&
    ['armor', 'tool', 'survivalgear', 'gear'].includes(normaliseKey(group.gearType))
  );
  return [weapon?.gearId, support?.gearId].filter(Boolean);
}

export function buildSurvivorDeckFromLoadout({
  survivor,
  loadout,
  cardCatalog = defaultGearCards,
  gearCatalog = defaultGearCatalog
} = {}) {
  const requestedLoadout = asArray(loadout?.gear || loadout || survivor?.loadout || survivor?.gear);
  const gearIds = requestedLoadout.length
    ? requestedLoadout.map(item => typeof item === 'string' ? item : item.id || item.gearId).filter(Boolean)
    : getStarterLoadout({ cardCatalog, gearCatalog });
  const wanted = new Set(gearIds.map(normaliseKey));
  const groups = getGearCardGroups({ cardCatalog, gearCatalog })
    .filter(group => wanted.has(normaliseKey(group.gearId)));
  const activeCards = groups.flatMap(group => group.activeCards);
  const passiveCards = groups.flatMap(group => group.passiveCards);

  return {
    loadout: gearIds,
    activeCards,
    passiveCards,
    sourceGroups: groups
  };
}

