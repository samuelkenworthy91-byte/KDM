export function createMonster(input = {}) {
  const raw = input && typeof input === 'object' ? input : {};
  return {
    id: raw.id || 'test-monster',
    name: raw.name || raw.displayName || 'Test Monster',
    hp: Math.max(1, Number(raw.hp || raw.maxHp || 20)),
    maxHp: Math.max(1, Number(raw.maxHp || raw.hp || 20)),
    damage: Math.max(1, Number(raw.damage || 1)),
    intents: Array.isArray(raw.intents) && raw.intents.length
      ? raw.intents
      : [{ id: 'strike', label: 'Strike', type: 'damage', amount: Math.max(1, Number(raw.damage || 1)) }]
  };
}

export function chooseMonsterIntent(monster, random = Math.random) {
  const intents = Array.isArray(monster?.intents) && monster.intents.length
    ? monster.intents
    : [{ id: 'strike', label: 'Strike', type: 'damage', amount: 1 }];
  const index = Math.floor((typeof random === 'function' ? random() : 0) * intents.length);
  return intents[Math.max(0, Math.min(intents.length - 1, index))];
}
