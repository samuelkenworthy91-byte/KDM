const warnedUnknownIds = new Set();

export function getLegacyDisplayName(catalog, id, kind = 'item') {
  const entry = catalog?.[id];
  if (entry) return entry.name || entry.displayName || id;
  const warningKey = `${kind}:${id}`;
  if (!warnedUnknownIds.has(warningKey)) {
    console.warn(`[Legacy content] Unknown ${kind} id "${id}".`);
    warnedUnknownIds.add(warningKey);
  }
  return 'Unknown legacy item';
}

export function getLegacyDescription(catalog, id) {
  const entry = catalog?.[id];
  if (entry) return entry.description || entry.effect || entry.passiveText || '';
  getLegacyDisplayName(catalog, id);
  return `Legacy id: ${id}`;
}
