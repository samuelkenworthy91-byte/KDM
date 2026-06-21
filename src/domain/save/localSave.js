import { createSettlement } from '../schema/settlementSchema.js';

export const SAVE_KEY = 'kdm.cleanCore.settlement';

function storageApi(storage) {
  if (storage) return storage;
  if (typeof localStorage !== 'undefined') return localStorage;
  return null;
}

export function saveSettlement(settlement, storage) {
  const api = storageApi(storage);
  if (!api) return null;
  const safeSettlement = createSettlement(settlement);
  api.setItem(SAVE_KEY, JSON.stringify(safeSettlement));
  return safeSettlement;
}

export function loadSettlement(storage) {
  const api = storageApi(storage);
  if (!api) return null;
  const raw = api.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return createSettlement(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function resetSettlementSave(storage) {
  const api = storageApi(storage);
  if (!api) return false;
  api.removeItem(SAVE_KEY);
  return true;
}
