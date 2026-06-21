let fallbackCounter = 0;

export function normaliseId(value, fallbackPrefix = 'item') {
  const text = value === null || value === undefined ? '' : String(value).trim();
  if (text && text.toLowerCase() !== 'null' && text.toLowerCase() !== 'undefined') return text;
  fallbackCounter += 1;
  return `${fallbackPrefix}-${fallbackCounter}`;
}

export function normaliseName(value, fallback = 'Unnamed') {
  const text = value === null || value === undefined ? '' : String(value).trim();
  if (text && text.toLowerCase() !== 'null' && text.toLowerCase() !== 'undefined') return text;
  return fallback;
}

export function normaliseArray(value) {
  return (Array.isArray(value) ? value : []).filter(item => item !== null && item !== undefined);
}

export function normaliseNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function normaliseBoolean(value, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

export function normaliseContentItem(item, fallbackType = 'content') {
  const raw = item && typeof item === 'object' ? item : {};
  const type = normaliseName(raw.type || raw.eventType || raw.role || fallbackType, fallbackType);
  const id = normaliseId(raw.id || raw.key, type);
  const name = normaliseName(raw.name || raw.displayName || raw.title, `Unnamed ${type}`);

  return {
    ...raw,
    id,
    name,
    type,
    source: normaliseName(raw.source || raw.sourceType || raw.section, 'preserved-data'),
    image: normaliseName(raw.image || raw.imagePath || raw.portraitPath || raw.assetPath || '', '')
  };
}
