export const survivorPanelPassiveGroups = [
  {
    label: 'Fighting Arts',
    match: passive => passive.sourceType === 'Fighting Art' &&
      !passive.tags?.includes('activeAbility')
  },
  {
    label: 'Active Fighting Art Buttons',
    match: passive => passive.sourceType === 'Fighting Art' &&
      passive.tags?.includes('activeAbility')
  },
  { label: 'Weapon Proficiency', match: passive => passive.sourceType === 'Weapon Proficiency' },
  { label: 'Traits', match: passive => passive.sourceType === 'Trait' },
  { label: 'Scars', match: passive => passive.sourceType === 'Scar' },
  { label: 'Disorders', match: passive => passive.sourceType === 'Disorder' },
  { label: 'Campaign Principles', match: passive => passive.sourceType === 'Campaign Principle' },
  { label: 'Gear Passives', match: passive => passive.sourceType === 'Gear' },
  { label: 'Temporary Hunt/Combat Modifiers', match: passive => passive.sourceType === 'Temporary Modifier' },
  { label: 'Monster Bane', match: passive => passive.sourceType === 'Monster Bane' }
];

export function groupPassivesForPanel(passives = []) {
  const claimed = new Set();
  const grouped = survivorPanelPassiveGroups.flatMap(group => {
    const items = passives.filter((passive, index) => {
      const matches = group.match(passive);
      if (matches) claimed.add(index);
      return matches;
    });
    return items.length ? [{ label: group.label, items }] : [];
  });
  const other = passives.filter((passive, index) => !claimed.has(index));
  return other.length ? [...grouped, { label: 'Other Passives', items: other }] : grouped;
}
